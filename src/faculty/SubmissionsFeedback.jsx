import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from './FacultyLayout';
import TableState from '../common/TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { taskService } from '../services/taskService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Submissions & Feedback: completed/submitted tasks (taskCompletedDate set or
 * progress reported) with the student ↔ faculty remarks thread. Consumes
 * Task/GetAll; feedback is recorded through Task/Update/{id}.
 */
const SubmissionsFeedback = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({ facultyRemarks: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await taskService.getAll();
      if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load submissions.');
      setTasks(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load submissions.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const submittedTasks = useMemo(() => tasks
    .filter((task) => task.taskCompletedDate || task.studentRemarks || task.progressPercentage > 0)
    .filter((task) => [task.taskTitle, task.studentName, task.projectTitle].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()))),
  [tasks, searchQuery]);

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
      setSelectedTask(response.data);
      setFormData({ facultyRemarks: response.data.facultyRemarks || '' });
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
    if (formData.facultyRemarks.length > 500) {
      setFormErrors({ facultyRemarks: 'Faculty remarks cannot exceed 500 characters.' });
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      const payload = {
        projectAllocationID: selectedTask.projectAllocationID,
        taskTitle: selectedTask.taskTitle,
        taskDescription: selectedTask.taskDescription,
        taskStatusID: selectedTask.taskStatusID,
        taskPriorityID: selectedTask.taskPriorityID,
        assignedScore: selectedTask.assignedScore,
        earnedScore: selectedTask.earnedScore,
        progressPercentage: selectedTask.progressPercentage,
        taskAssignedDate: selectedTask.taskAssignedDate,
        taskStartDate: selectedTask.taskStartDate,
        taskDueDate: selectedTask.taskDueDate,
        taskCompletedDate: selectedTask.taskCompletedDate,
        nextFollowUpDate: selectedTask.nextFollowUpDate,
        facultyRemarks: formData.facultyRemarks || null,
        studentRemarks: selectedTask.studentRemarks,
      };
      const response = await taskService.update(selectedTask.taskID, payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save feedback.');
      setMessage(response.message);
      closeModal();
      await loadTasks();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save feedback.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FacultyLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Submissions & Feedback</h1>
          <div className="breadcrumbs">
            <Link to="/faculty/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Submissions & Feedback</span>
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
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Submitted Deliverables & Feedback Thread</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Task ID</th>
                <th>Task</th>
                <th>Student</th>
                <th>Submitted On</th>
                <th style={{ textAlign: 'center' }}>Progress</th>
                <th>Student Remarks</th>
                <th>Feedback Given</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={8} loading={isLoading} error={pageError} count={submittedTasks.length} emptyText={`No submissions found matching "${searchQuery}"`} onRetry={loadTasks} />
              {!isLoading && !pageError && submittedTasks.map((task) => (
                <tr key={task.taskID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                  <td>{task.studentName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(task.taskCompletedDate)}</td>
                  <td style={{ textAlign: 'center' }}>{task.progressPercentage}%</td>
                  <td style={{ maxWidth: '200px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {task.studentRemarks ? (task.studentRemarks.length > 50 ? `${task.studentRemarks.slice(0, 50)}…` : task.studentRemarks) : '—'}
                  </td>
                  <td style={{ maxWidth: '200px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {task.facultyRemarks ? (task.facultyRemarks.length > 50 ? `${task.facultyRemarks.slice(0, 50)}…` : task.facultyRemarks) : <span className="badge pending">Pending</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => openModal(task)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, .6)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '95%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            {isDetailsLoading ? (
              <p>Loading details…</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3>Review Task #{selectedTask?.taskID}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedTask?.taskTitle} — {selectedTask?.studentName}</p>
                <p><strong>Completed On:</strong> {selectedTask?.taskCompletedDate ? formatDate(selectedTask.taskCompletedDate) : 'Not marked complete'}</p>
                <p><strong>Progress:</strong> {selectedTask?.progressPercentage}%</p>

                <div style={{ borderLeft: '4px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Remarks</div>
                  <div style={{ fontSize: '0.92rem', marginTop: '4px' }}>{selectedTask?.studentRemarks || 'No remarks submitted by the student.'}</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="facultyRemarks">Your Feedback</label>
                  <textarea id="facultyRemarks" className="form-control" rows="4" maxLength={500} value={formData.facultyRemarks} onChange={(e) => setFormData({ ...formData, facultyRemarks: e.target.value })} />
                  {formErrors.facultyRemarks && <span className="error-text">{formErrors.facultyRemarks}</span>}
                </div>
                {formErrors.submit && <p className="error-text" role="alert">{formErrors.submit}</p>}
                <button type="button" onClick={closeModal}>Cancel</button>{' '}
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Feedback'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default SubmissionsFeedback;
