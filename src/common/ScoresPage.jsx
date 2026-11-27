import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableState from './TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { taskService } from '../services/taskService';

/**
 * Scores & Remarks management. Scores and remarks live on Task records, so this
 * page consumes Task/GetAll + Task/Update/{id} to edit evaluation fields only.
 */
const ScoresPage = ({ pageWrapper: PageWrapper, homePath, title, breadcrumb }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({ earnedScore: '', facultyRemarks: '', studentRemarks: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const tasksResponse = await taskService.getAll();
      if (!tasksResponse?.success || !Array.isArray(tasksResponse.data)) throw new Error(tasksResponse?.message || 'Unable to load scores.');
      setTasks(tasksResponse.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load scores.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(() => tasks.filter((task) =>
    [task.taskTitle, task.studentName, task.projectTitle].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [tasks, searchQuery]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormErrors({});
  };

  const openModal = async (task) => {
    setMessage('');
    setFormErrors({});
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    try {
      const response = await taskService.getById(task.taskID);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load task details.');
      const details = response.data;
      setSelectedTask(details);
      setFormData({
        earnedScore: details.earnedScore === null || details.earnedScore === undefined ? '' : String(details.earnedScore),
        facultyRemarks: details.facultyRemarks || '',
        studentRemarks: details.studentRemarks || '',
      });
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load task details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const earned = formData.earnedScore === '' ? null : Number(formData.earnedScore);
    const errors = {};
    if (earned !== null && (Number.isNaN(earned) || earned < 0)) errors.earnedScore = 'Earned score must be 0 or greater.';
    if (earned !== null && earned > Number(selectedTask.assignedScore)) errors.earnedScore = 'Earned score cannot exceed the assigned score.';
    if (formData.facultyRemarks.length > 500) errors.facultyRemarks = 'Faculty remarks cannot exceed 500 characters.';
    if (formData.studentRemarks.length > 500) errors.studentRemarks = 'Student remarks cannot exceed 500 characters.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      // Task/Update is a full-object PUT: echo the unchanged fields back.
      const payload = {
        projectAllocationID: selectedTask.projectAllocationID,
        taskTitle: selectedTask.taskTitle,
        taskDescription: selectedTask.taskDescription,
        taskStatusID: selectedTask.taskStatusID,
        taskPriorityID: selectedTask.taskPriorityID,
        assignedScore: selectedTask.assignedScore,
        earnedScore: earned,
        progressPercentage: selectedTask.progressPercentage,
        taskAssignedDate: selectedTask.taskAssignedDate,
        taskStartDate: selectedTask.taskStartDate,
        taskDueDate: selectedTask.taskDueDate,
        taskCompletedDate: selectedTask.taskCompletedDate,
        nextFollowUpDate: selectedTask.nextFollowUpDate,
        facultyRemarks: formData.facultyRemarks || null,
        studentRemarks: formData.studentRemarks || null,
      };
      const response = await taskService.update(selectedTask.taskID, payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save score.');
      setMessage(response.message);
      closeModal();
      await loadTasks();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save score.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{title}</h1>
          <div className="breadcrumbs">
            <Link to={homePath} style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>{breadcrumb}</span>
          </div>
        </div>
      </div>

      {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by task, student, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Evaluation Registry (SPM_Task scores & remarks)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Task ID</th>
                <th>Task</th>
                <th>Student</th>
                <th>Project</th>
                <th style={{ textAlign: 'center' }}>Score</th>
                <th style={{ textAlign: 'center' }}>Progress</th>
                <th>Faculty Remarks</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={8} loading={isLoading} error={pageError} count={filteredTasks.length} emptyText={`No evaluations found matching "${searchQuery}"`} onRetry={loadTasks} />
              {!isLoading && !pageError && filteredTasks.map((task) => (
                <tr key={task.taskID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                  <td>{task.studentName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{task.projectTitle || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{task.earnedScore ?? '—'}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {task.assignedScore}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{task.progressPercentage}%</td>
                  <td style={{ maxWidth: '240px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {task.facultyRemarks ? (task.facultyRemarks.length > 60 ? `${task.facultyRemarks.slice(0, 60)}…` : task.facultyRemarks) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => openModal(task)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Evaluate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, .6)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '95%', maxWidth: '500px', padding: '24px' }}>
            {isDetailsLoading ? (
              <p>Loading details…</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3>Evaluate Task #{selectedTask?.taskID}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedTask?.taskTitle} — {selectedTask?.studentName} ({selectedTask?.projectTitle})
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignedScoreDisplay">Assigned Score</label>
                    <input id="assignedScoreDisplay" className="form-control" value={selectedTask?.assignedScore ?? ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="earnedScore">Earned Score</label>
                    <input type="number" id="earnedScore" className="form-control" min="0" step="0.5" value={formData.earnedScore} onChange={(e) => setFormData({ ...formData, earnedScore: e.target.value })} />
                    {formErrors.earnedScore && <span className="error-text">{formErrors.earnedScore}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="facultyRemarks">Faculty Remarks</label>
                  <textarea id="facultyRemarks" className="form-control" rows="3" maxLength={500} value={formData.facultyRemarks} onChange={(e) => setFormData({ ...formData, facultyRemarks: e.target.value })} />
                  {formErrors.facultyRemarks && <span className="error-text">{formErrors.facultyRemarks}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="studentRemarks">Student Remarks</label>
                  <textarea id="studentRemarks" className="form-control" rows="2" maxLength={500} value={formData.studentRemarks} onChange={(e) => setFormData({ ...formData, studentRemarks: e.target.value })} />
                  {formErrors.studentRemarks && <span className="error-text">{formErrors.studentRemarks}</span>}
                </div>
                {formErrors.submit && <p className="error-text" role="alert">{formErrors.submit}</p>}
                <button type="button" onClick={closeModal}>Cancel</button>{' '}
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Evaluation'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ScoresPage;
