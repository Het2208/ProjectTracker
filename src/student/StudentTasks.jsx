import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import TableState from '../common/TableState';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { taskService } from '../services/taskService';
import { taskStatusService } from '../services/taskStatusService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const priorityClass = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('high') || lower.includes('critical')) return 'high';
  if (lower.includes('medium') || lower.includes('normal')) return 'medium';
  return 'low';
};

const statusClass = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('complet')) return 'completed';
  if (lower.includes('progress')) return 'progress';
  if (lower.includes('reject') || lower.includes('cancel')) return 'rejected';
  return 'pending';
};

const StudentTasks = () => {
  const { fullName } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [statusesList, setStatusesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Details'); // 'Details' | 'Submit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({ taskStatusID: '', studentRemarks: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [taskRes, statusRes] = await Promise.all([
        taskService.getAll(),
        taskStatusService.getAll(),
      ]);
      if (!taskRes?.success || !Array.isArray(taskRes.data))
        throw new Error(taskRes?.message || 'Unable to load tasks.');
      setStatusesList(statusRes?.data ?? []);
      const myTasks = fullName
        ? taskRes.data.filter((t) => t.studentName === fullName)
        : taskRes.data;
      setTasks(myTasks);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load tasks.'));
    } finally {
      setIsLoading(false);
    }
  }, [fullName]);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        [task.taskTitle, task.taskStatusName, task.taskPriorityName].some((v) =>
          v?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    [tasks, searchQuery],
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormErrors({});
  };

  const openModal = async (type, task) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    try {
      const response = await taskService.getById(task.taskID);
      if (!response?.success || !response.data)
        throw new Error(response?.message || 'Unable to load task details.');
      setSelectedTask(response.data);
      if (type === 'Submit') {
        setFormData({
          taskStatusID: String(response.data.taskStatusID ?? ''),
          studentRemarks: response.data.studentRemarks || '',
        });
      }
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load task details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !selectedTask) return;
    const errors = {};
    if (!formData.taskStatusID) errors.taskStatusID = 'Status is required.';
    if ((formData.studentRemarks || '').length > 500)
      errors.studentRemarks = 'Remarks cannot exceed 500 characters.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setMessage('');
    try {
      // Full-object PUT — echo all existing fields back, only update student-editable ones.
      const payload = {
        projectAllocationID: selectedTask.projectAllocationID,
        taskTitle: selectedTask.taskTitle,
        taskDescription: selectedTask.taskDescription,
        taskStatusID: Number(formData.taskStatusID),
        taskPriorityID: selectedTask.taskPriorityID,
        assignedScore: selectedTask.assignedScore,
        earnedScore: selectedTask.earnedScore,
        progressPercentage: selectedTask.progressPercentage,
        taskAssignedDate: selectedTask.taskAssignedDate,
        taskStartDate: selectedTask.taskStartDate,
        taskDueDate: selectedTask.taskDueDate,
        taskCompletedDate:
          statusesList
            .find((s) => s.taskStatusID === Number(formData.taskStatusID))
            ?.taskStatusName?.toLowerCase()
            .includes('complet')
            ? (selectedTask.taskCompletedDate ?? new Date().toISOString())
            : selectedTask.taskCompletedDate,
        nextFollowUpDate: selectedTask.nextFollowUpDate,
        facultyRemarks: selectedTask.facultyRemarks,
        studentRemarks: formData.studentRemarks || null,
      };
      const response = await taskService.update(selectedTask.taskID, payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save submission.');
      setMessage('Work submitted successfully.');
      closeModal();
      await loadTasks();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save submission.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Deliverables</h1>
          <div className="breadcrumbs">
            <Link to="/student/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>
              Home
            </Link>{' '}
            / <span>Deliverables &amp; Submissions</span>
          </div>
        </div>
      </div>

      {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {/* Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Allocated Tasks Registry (SPM_Task)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Task Details</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Submitted On</th>
                <th>Obtained / Assigned Pts</th>
                <th>Status</th>
                <th style={{ width: '200px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState
                colSpan={8}
                loading={isLoading}
                error={pageError}
                count={filteredTasks.length}
                emptyText={`No deliverables found${searchQuery ? ` matching "${searchQuery}"` : '.'}`}
                onRetry={loadTasks}
              />
              {!isLoading && !pageError && filteredTasks.map((task) => (
                <tr key={task.taskID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                  <td><span className={`badge ${priorityClass(task.taskPriorityName)}`}>{task.taskPriorityName || '—'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(task.taskDueDate)}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(task.taskCompletedDate)}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {task.earnedScore !== null && task.earnedScore !== undefined ? task.earnedScore : '—'} / {task.assignedScore} pts
                    </span>
                  </td>
                  <td><span className={`badge ${statusClass(task.taskStatusName)}`}>{task.taskStatusName || '—'}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openModal('Details', task)}
                        style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Details
                      </button>
                      {!(task.taskStatusName || '').toLowerCase().includes('complet') && (
                        <button
                          onClick={() => openModal('Submit', task)}
                          style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '95%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {modalType === 'Details' ? 'Deliverable Details' : 'Submit / Update Work'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {isDetailsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading details…</div>
            ) : modalType === 'Details' ? (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task ID</span>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>#{selectedTask?.taskID}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status &amp; Priority</span>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                      <span className={`badge ${statusClass(selectedTask?.taskStatusName)}`}>{selectedTask?.taskStatusName}</span>
                      <span className={`badge ${priorityClass(selectedTask?.taskPriorityName)}`}>{selectedTask?.taskPriorityName}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Title</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.taskTitle}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scope Details</span>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '6px' }}>{selectedTask?.taskDescription || '—'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{formatDate(selectedTask?.taskDueDate)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed On</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.taskCompletedDate ? formatDate(selectedTask.taskCompletedDate) : 'Not Submitted'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)', marginTop: '4px' }}>
                      {selectedTask?.earnedScore !== null && selectedTask?.earnedScore !== undefined ? selectedTask.earnedScore : '—'} / {selectedTask?.assignedScore} pts
                    </div>
                  </div>
                </div>
                {selectedTask?.studentRemarks && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Submission Notes</span>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '6px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                      {selectedTask.studentRemarks}
                    </div>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty Evaluation Remarks</span>
                  <div style={{ fontSize: '0.92rem', color: selectedTask?.facultyRemarks ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: selectedTask?.facultyRemarks ? 'normal' : 'italic', marginTop: '6px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                    {selectedTask?.facultyRemarks || 'No feedback remarks provided by faculty advisor yet.'}
                  </div>
                </div>
                <div style={{ marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitting Work For</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.taskTitle}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="taskStatusID">Work Status</label>
                    <select
                      id="taskStatusID"
                      className="form-control"
                      value={formData.taskStatusID}
                      onChange={(e) => setFormData({ ...formData, taskStatusID: e.target.value })}
                    >
                      <option value="">Select status...</option>
                      {statusesList.map((s) => (
                        <option key={s.taskStatusID} value={s.taskStatusID}>{s.taskStatusName}</option>
                      ))}
                    </select>
                    {formErrors.taskStatusID && <span className="error-text">{formErrors.taskStatusID}</span>}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="studentRemarks">Submission Notes / Deliverable Link</label>
                    <textarea
                      id="studentRemarks"
                      className="form-control"
                      placeholder="Paste your git repo link, deployment URL, or describe what you completed..."
                      rows="4"
                      maxLength={500}
                      value={formData.studentRemarks}
                      onChange={(e) => setFormData({ ...formData, studentRemarks: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                    {formErrors.studentRemarks && <span className="error-text">{formErrors.studentRemarks}</span>}
                  </div>
                  {formErrors.submit && <p className="error-text" role="alert" style={{ marginTop: '12px' }}>{formErrors.submit}</p>}
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <button type="button" onClick={closeModal} style={{ padding: '8px 16px', border: '1px solid var(--border)', backgroundColor: 'white', borderRadius: '8px', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                    {isSubmitting ? 'Submitting…' : 'Submit Work'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentTasks;
