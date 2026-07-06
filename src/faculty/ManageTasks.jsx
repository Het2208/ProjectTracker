import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from './FacultyLayout';

const ManageTasks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');

  // Blank form state
  const [formData, setFormData] = useState({
    projectId: '',
    taskTitle: '',
    taskDescription: '',
    priority: '',
    dueDate: '',
    assignedScore: '',
    status: ''
  });

  const tasks = [
    {
      taskId: 1,
      taskTitle: 'Database normalization & model setup',
      project: 'Student Project Management',
      student: 'Priya Sharma',
      priority: 'High',
      dueDate: '2026-07-10',
      assignedScore: 10,
      status: 'Completed'
    },
    {
      taskId: 2,
      taskTitle: 'Setup basic routing & login form validation',
      project: 'Student Project Management',
      student: 'Priya Sharma',
      priority: 'Medium',
      dueDate: '2026-07-20',
      assignedScore: 10,
      status: 'Completed'
    },
    {
      taskId: 3,
      taskTitle: 'Responsive sidebar & layouts integration',
      project: 'Student Project Management',
      student: 'Priya Sharma',
      priority: 'Low',
      dueDate: '2026-07-25',
      assignedScore: 10,
      status: 'In Progress'
    },
    {
      taskId: 4,
      taskTitle: 'Vite Setup and Dev server configurations',
      project: 'E-Commerce Engine',
      student: 'Rohan Shah',
      priority: 'High',
      dueDate: '2026-07-15',
      assignedScore: 15,
      status: 'Completed'
    }
  ];

  const filteredTasks = tasks.filter(task =>
    task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({
      projectId: '',
      taskTitle: '',
      taskDescription: '',
      priority: '',
      dueDate: '',
      assignedScore: '',
      status: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    // Do nothing
  };

  return (
    <FacultyLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Tasks</h1>
          <div className="breadcrumbs">
            <Link to="/faculty/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> /{' '}
            <span>Manage Tasks</span>
          </div>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => handleOpenModal('Add')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </div>

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
          <span className="table-title">System Project Deliverables & Tasks</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Task Details</th>
                <th>Project Context</th>
                <th>Assigned Student</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Weightage (Score)</th>
                <th>Status</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.taskId}>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskId}</span></td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{task.project}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{task.student}</td>
                    <td>
                      <span className={`badge ${
                        task.priority === 'High' ? 'high' : task.priority === 'Medium' ? 'medium' : 'low'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{task.dueDate}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{task.assignedScore} pts</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        task.status === 'Completed' ? 'completed' : task.status === 'In Progress' ? 'progress' : 'pending'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleOpenModal('Edit')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={handleDeleteClick}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No tasks found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blank Form Modal */}
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
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column'
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
                {modalType} Project Task
              </h3>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body (Blank Form) */}
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="projectId">Allocated Project Context</label>
                  <select 
                    id="projectId"
                    className="form-control"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    required
                  >
                    <option value="">Select Project...</option>
                    <option value="1">Student Project Management</option>
                    <option value="2">E-Commerce Engine</option>
                    <option value="3">IoT Smart Home</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="taskTitle">Task Title</label>
                  <input 
                    type="text" 
                    id="taskTitle"
                    className="form-control" 
                    placeholder="Enter task title"
                    value={formData.taskTitle}
                    onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="taskDescription">Task Description</label>
                  <textarea 
                    id="taskDescription"
                    className="form-control" 
                    placeholder="Enter detailed description of task requirements..."
                    rows="3"
                    value={formData.taskDescription}
                    onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="priority">Task Priority</label>
                    <select 
                      id="priority"
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      required
                    >
                      <option value="">Select Priority...</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dueDate">Due Date</label>
                    <input 
                      type="date" 
                      id="dueDate"
                      className="form-control" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="assignedScore">Weightage Points</label>
                    <input 
                      type="number" 
                      id="assignedScore"
                      className="form-control" 
                      placeholder="Enter target score points"
                      min="1"
                      value={formData.assignedScore}
                      onChange={(e) => setFormData({ ...formData, assignedScore: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Task Status</label>
                    <select 
                      id="status"
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                    >
                      <option value="">Select Status...</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
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
                  onClick={handleCloseModal}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default ManageTasks;
