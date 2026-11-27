import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableState from './TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { taskService } from '../services/taskService';
import { taskStatusService } from '../services/taskStatusService';
import { taskPriorityService } from '../services/taskPriorityService';
import { projectAllocationService } from '../services/projectAllocationService';

const emptyForm = {
  projectAllocationID: '',
  taskTitle: '',
  taskDescription: '',
  taskStatusID: '',
  taskPriorityID: '',
  assignedScore: '10',
  earnedScore: '',
  progressPercentage: '0',
  taskStartDate: '',
  taskDueDate: '',
  taskCompletedDate: '',
  nextFollowUpDate: '',
  facultyRemarks: '',
  studentRemarks: '',
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const statusBadgeClass = (cssClass, name) => {
  const known = ['completed', 'progress', 'pending', 'rejected'];
  if (cssClass && known.includes(cssClass.toLowerCase())) return cssClass.toLowerCase();
  const lower = (name || '').toLowerCase();
  if (lower.includes('complete')) return 'completed';
  if (lower.includes('progress')) return 'progress';
  if (lower.includes('reject') || lower.includes('cancel')) return 'rejected';
  return 'pending';
};

const priorityBadgeClass = (cssClass, name) => {
  const known = ['high', 'medium', 'low'];
  if (cssClass && known.includes(cssClass.toLowerCase())) return cssClass.toLowerCase();
  const lower = (name || '').toLowerCase();
  if (lower.includes('high') || lower.includes('critical')) return 'high';
  if (lower.includes('medium') || lower.includes('normal')) return 'medium';
  return 'low';
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Full Task CRUD used by both Admin (/admin/tasks) and Faculty (/faculty/tasks).
 * layout: { Home: Component|node wrapper, homePath, tableTitle }
 */
const TaskManagerPage = ({ layout, tableTitle }) => {
  const { pageWrapper: PageWrapper, homePath } = layout;
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [statusesList, setStatusesList] = useState([]);
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [allocationsList, setAllocationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [tasksResponse, statusesResponse, prioritiesResponse, allocationsResponse] = await Promise.all([
        taskService.getAll(),
        taskStatusService.getAll(),
        taskPriorityService.getAll(),
        projectAllocationService.getAll(),
      ]);
      if (!tasksResponse?.success || !Array.isArray(tasksResponse.data)) throw new Error(tasksResponse?.message || 'Unable to load tasks.');
      setTasks(tasksResponse.data);
      if (statusesResponse?.success) setStatusesList(statusesResponse.data ?? []);
      if (prioritiesResponse?.success) setPrioritiesList(prioritiesResponse.data ?? []);
      if (allocationsResponse?.success) setAllocationsList(allocationsResponse.data ?? []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load tasks.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(() => tasks.filter((task) =>
    [task.taskTitle, task.projectTitle, task.studentName].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [tasks, searchQuery]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormErrors({});
  };

  const openModal = async (type, task = null) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    if (!task) {
      setSelectedTask(null);
      setFormData({ ...emptyForm, taskStatusID: statusesList[0] ? String(statusesList[0].taskStatusID) : '', taskPriorityID: prioritiesList[0] ? String(prioritiesList[0].taskPriorityId) : '' });
      return;
    }
    setIsDetailsLoading(true);
    try {
      const response = await taskService.getById(task.taskID);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load task details.');
      const details = response.data;
      setSelectedTask(details);
      setFormData({
        projectAllocationID: String(details.projectAllocationID ?? ''),
        taskTitle: details.taskTitle || '',
        taskDescription: details.taskDescription || '',
        taskStatusID: String(details.taskStatusID ?? ''),
        taskPriorityID: String(details.taskPriorityID ?? ''),
        assignedScore: String(details.assignedScore ?? '0'),
        earnedScore: details.earnedScore === null || details.earnedScore === undefined ? '' : String(details.earnedScore),
        progressPercentage: String(details.progressPercentage ?? '0'),
        taskStartDate: toDateInput(details.taskStartDate),
        taskDueDate: toDateInput(details.taskDueDate),
        taskCompletedDate: toDateInput(details.taskCompletedDate),
        nextFollowUpDate: toDateInput(details.nextFollowUpDate),
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

  const validate = () => {
    const errors = {};
    if (!formData.projectAllocationID) errors.projectAllocationID = 'Project allocation is required.';
    if (!formData.taskTitle.trim()) errors.taskTitle = 'Task title is required.';
    else if (formData.taskTitle.trim().length > 200) errors.taskTitle = 'Task title cannot exceed 200 characters.';
    if (!formData.taskStatusID) errors.taskStatusID = 'Task status is required.';
    if (!formData.taskPriorityID) errors.taskPriorityID = 'Task priority is required.';
    const assigned = Number(formData.assignedScore);
    if (Number.isNaN(assigned) || assigned < 0) errors.assignedScore = 'Assigned score must be 0 or greater.';
    const progress = Number(formData.progressPercentage);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) errors.progressPercentage = 'Progress must be between 0 and 100.';
    if ((formData.facultyRemarks || '').length > 500) errors.facultyRemarks = 'Faculty remarks cannot exceed 500 characters.';
    if ((formData.studentRemarks || '').length > 500) errors.studentRemarks = 'Student remarks cannot exceed 500 characters.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = selectedTask
        ? await taskService.update(selectedTask.taskID, formData)
        : await taskService.add(formData);
      if (!response?.success) throw new Error(response?.message || 'Unable to save task.');
      setMessage(response.message);
      closeModal();
      await loadTasks();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save task.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setMessage('');
    try {
      const response = await taskService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete task.');
      setMessage(response.message);
      await loadTasks();
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to delete task.'));
    }
  };

  const iconButtonStyle = (background, color) => ({
    padding: '6px 12px',
    backgroundColor: background,
    color,
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  });

  return (
    <PageWrapper>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Tasks</h1>
          <div className="breadcrumbs">
            <Link to={homePath} style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> /{' '}
            <span>Tasks</span>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => openModal('Add')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </div>

      {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {/* Filter and Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">{tableTitle}</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Task Details</th>
                <th>Project Context</th>
                <th>Student Name</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Weightage (Score)</th>
                <th>Status</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={9} loading={isLoading} error={pageError} count={filteredTasks.length} emptyText={`No tasks found matching "${searchQuery}"`} onRetry={loadTasks} />
              {!isLoading && !pageError && filteredTasks.map((task) => (
                <tr key={task.taskID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                  <td><span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{task.projectTitle || '—'}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{task.studentName || '—'}</span></td>
                  <td>
                    <span className={`badge ${priorityBadgeClass(prioritiesList.find((p) => p.taskPriorityId === task.taskPriorityID)?.taskPriorityCssClass, task.taskPriorityName)}`}>
                      {task.taskPriorityName || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(task.taskDueDate)}</td>
                  <td><span style={{ fontWeight: 600 }}>{task.earnedScore ?? 0} / {task.assignedScore} pts</span></td>
                  <td>
                    <span className={`badge ${statusBadgeClass(statusesList.find((s) => s.taskStatusID === task.taskStatusID)?.taskStatusCssClass, task.taskStatusName)}`}>
                      {task.taskStatusName || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openModal('Details', task)} style={iconButtonStyle('#e0f2fe', '#0369a1')}>View</button>
                      <button onClick={() => openModal('Edit', task)} style={iconButtonStyle('var(--primary-light)', 'var(--primary)')}>Edit</button>
                      <button onClick={() => handleDelete(task.taskID)} style={iconButtonStyle('#fee2e2', '#ef4444')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            width: '95%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {modalType === 'Details' ? 'Task Details' : `${modalType} Project Task`}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
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
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status & Priority</span>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                      <span className={`badge ${statusBadgeClass(statusesList.find((s) => s.taskStatusID === selectedTask?.taskStatusID)?.taskStatusCssClass, selectedTask?.taskStatusName)}`}>
                        {selectedTask?.taskStatusName || '—'}
                      </span>
                      <span className={`badge ${priorityBadgeClass(prioritiesList.find((p) => p.taskPriorityId === selectedTask?.taskPriorityID)?.taskPriorityCssClass, selectedTask?.taskPriorityName)}`}>
                        {selectedTask?.taskPriorityName || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Title</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.taskTitle}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Description</span>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '6px' }}>{selectedTask?.taskDescription || '—'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allocated Student</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.studentName || '—'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Title</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>{selectedTask?.projectTitle || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Date</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{formatDate(selectedTask?.taskAssignedDate)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{formatDate(selectedTask?.taskDueDate)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed On</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.taskCompletedDate ? formatDate(selectedTask.taskCompletedDate) : 'Not Submitted'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)', marginTop: '4px' }}>{selectedTask?.earnedScore ?? 0} / {selectedTask?.assignedScore} pts</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{selectedTask?.progressPercentage ?? 0}%</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Follow-Up</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{formatDate(selectedTask?.nextFollowUpDate)}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '0px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty Remarks</span>
                  <div style={{
                    fontSize: '0.92rem',
                    color: selectedTask?.facultyRemarks ? 'var(--text-main)' : 'var(--text-muted)',
                    fontStyle: selectedTask?.facultyRemarks ? 'normal' : 'italic',
                    marginTop: '6px',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #cbd5e1',
                  }}>
                    {selectedTask?.facultyRemarks || 'No feedback or evaluation remarks provided yet.'}
                  </div>
                </div>

                {selectedTask?.studentRemarks && (
                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Remarks</span>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '6px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                      {selectedTask.studentRemarks}
                    </div>
                  </div>
                )}

                <div style={{
                  marginTop: '28px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <button
                    onClick={closeModal}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 20px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ padding: '24px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="projectAllocationID">Project & Student Allocation</label>
                    <select
                      id="projectAllocationID"
                      className="form-control"
                      value={formData.projectAllocationID}
                      onChange={(e) => setFormData({ ...formData, projectAllocationID: e.target.value })}
                    >
                      <option value="">Select Allocation...</option>
                      {allocationsList.map((a) => (
                        <option key={a.projectAllocationID} value={a.projectAllocationID}>
                          {a.studentName} — {a.projectTitle}
                        </option>
                      ))}
                    </select>
                    {formErrors.projectAllocationID && <span className="error-text">{formErrors.projectAllocationID}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="taskTitle">Task Title</label>
                    <input
                      type="text"
                      id="taskTitle"
                      className="form-control"
                      placeholder="Enter task title"
                      maxLength={200}
                      value={formData.taskTitle}
                      onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                    />
                    {formErrors.taskTitle && <span className="error-text">{formErrors.taskTitle}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="taskDescription">Task Description</label>
                    <textarea
                      id="taskDescription"
                      className="form-control"
                      placeholder="Enter task details and requirements..."
                      rows="3"
                      value={formData.taskDescription}
                      onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="taskStatusID">Task Status</label>
                      <select
                        id="taskStatusID"
                        className="form-control"
                        value={formData.taskStatusID}
                        onChange={(e) => setFormData({ ...formData, taskStatusID: e.target.value })}
                      >
                        <option value="">Select Status...</option>
                        {statusesList.map((s) => (
                          <option key={s.taskStatusID} value={s.taskStatusID}>{s.taskStatusName}</option>
                        ))}
                      </select>
                      {formErrors.taskStatusID && <span className="error-text">{formErrors.taskStatusID}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="taskPriorityID">Task Priority</label>
                      <select
                        id="taskPriorityID"
                        className="form-control"
                        value={formData.taskPriorityID}
                        onChange={(e) => setFormData({ ...formData, taskPriorityID: e.target.value })}
                      >
                        <option value="">Select Priority...</option>
                        {prioritiesList.map((p) => (
                          <option key={p.taskPriorityId} value={p.taskPriorityId}>{p.taskPriorityName}</option>
                        ))}
                      </select>
                      {formErrors.taskPriorityID && <span className="error-text">{formErrors.taskPriorityID}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="assignedScore">Assigned Weightage (Pts)</label>
                      <input
                        type="number"
                        id="assignedScore"
                        className="form-control"
                        min="0"
                        step="0.5"
                        value={formData.assignedScore}
                        onChange={(e) => setFormData({ ...formData, assignedScore: e.target.value })}
                      />
                      {formErrors.assignedScore && <span className="error-text">{formErrors.assignedScore}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="earnedScore">Earned Score (Pts)</label>
                      <input
                        type="number"
                        id="earnedScore"
                        className="form-control"
                        min="0"
                        step="0.5"
                        value={formData.earnedScore}
                        onChange={(e) => setFormData({ ...formData, earnedScore: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="progressPercentage">Progress (%)</label>
                      <input
                        type="number"
                        id="progressPercentage"
                        className="form-control"
                        min="0"
                        max="100"
                        value={formData.progressPercentage}
                        onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                      />
                      {formErrors.progressPercentage && <span className="error-text">{formErrors.progressPercentage}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="taskStartDate">Start Date</label>
                      <input
                        type="date"
                        id="taskStartDate"
                        className="form-control"
                        value={formData.taskStartDate}
                        onChange={(e) => setFormData({ ...formData, taskStartDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="taskDueDate">Due Date</label>
                      <input
                        type="date"
                        id="taskDueDate"
                        className="form-control"
                        value={formData.taskDueDate}
                        onChange={(e) => setFormData({ ...formData, taskDueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="taskCompletedDate">Completion Date</label>
                      <input
                        type="date"
                        id="taskCompletedDate"
                        className="form-control"
                        value={formData.taskCompletedDate}
                        onChange={(e) => setFormData({ ...formData, taskCompletedDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="nextFollowUpDate">Next Follow-Up Date</label>
                      <input
                        type="date"
                        id="nextFollowUpDate"
                        className="form-control"
                        value={formData.nextFollowUpDate}
                        onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="facultyRemarks">Faculty Remarks</label>
                    <textarea
                      id="facultyRemarks"
                      className="form-control"
                      placeholder="Add supervisor evaluation feedback..."
                      rows="2"
                      maxLength={500}
                      value={formData.facultyRemarks}
                      onChange={(e) => setFormData({ ...formData, facultyRemarks: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                    {formErrors.facultyRemarks && <span className="error-text">{formErrors.facultyRemarks}</span>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="studentRemarks">Student Remarks</label>
                    <textarea
                      id="studentRemarks"
                      className="form-control"
                      placeholder="Notes submitted by the student..."
                      rows="2"
                      maxLength={500}
                      value={formData.studentRemarks}
                      onChange={(e) => setFormData({ ...formData, studentRemarks: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                    {formErrors.studentRemarks && <span className="error-text">{formErrors.studentRemarks}</span>}
                  </div>

                  {formErrors.submit && <p className="error-text" role="alert" style={{ marginTop: '12px' }}>{formErrors.submit}</p>}
                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  backgroundColor: '#f8fafc',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px',
                }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--primary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {isSubmitting ? 'Saving…' : 'Save Task'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default TaskManagerPage;
