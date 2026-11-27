import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';
import { taskService } from '../services/taskService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');

const StudentDashboard = () => {
  const { userId, fullName } = useAuth();

  const [allocations, setAllocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setPageError('');
      try {
        const [allocRes, taskRes] = await Promise.all([
          projectAllocationService.getAll(),
          taskService.getAll(),
        ]);
        if (!allocRes?.success || !Array.isArray(allocRes.data))
          throw new Error(allocRes?.message || 'Unable to load project data.');
        if (!taskRes?.success || !Array.isArray(taskRes.data))
          throw new Error(taskRes?.message || 'Unable to load tasks.');

        // Filter to this student's data by userId or fullName when known.
        const myAllocations = allocRes.data.filter((a) =>
          (userId && (a.studentID === userId || a.studentId === userId)) ||
          (fullName && a.studentName?.toLowerCase() === fullName.toLowerCase()) ||
          (!userId && !fullName)
        );
        const myTasks = taskRes.data.filter((t) =>
          (fullName && t.studentName?.toLowerCase() === fullName.toLowerCase()) ||
          myAllocations.some((a) => a.projectAllocationID === t.projectAllocationID) ||
          (!userId && !fullName)
        );

        setAllocations(myAllocations);
        setTasks(myTasks);
      } catch (error) {
        setPageError(getApiErrorMessage(error, 'Unable to load dashboard data.'));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [userId, fullName]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) =>
      t.taskStatusName?.toLowerCase().includes('complet'),
    ).length;
    const totalAssigned = tasks.reduce((s, t) => s + Number(t.assignedScore ?? 0), 0);
    const totalEarned = tasks.reduce((s, t) => s + Number(t.earnedScore ?? 0), 0);
    const overallProgress =
      allocations.length > 0
        ? Math.round(
            allocations.reduce((s, a) => s + Number(a.progressPercentage ?? 0), 0) /
              allocations.length,
          )
        : 0;
    return { totalTasks, completedTasks, totalAssigned, totalEarned, overallProgress };
  }, [tasks, allocations]);

  // Take the most recent / first allocation as the "active project"
  const activeAllocation = allocations[0] ?? null;

  // Latest 5 tasks for the quick overview table
  const recentTasks = tasks.slice(0, 5);

  return (
    <StudentLayout>
      <div className="page-title-block">
        <h1>Student Portal</h1>
        <div className="breadcrumbs">
          <Link to="/student/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>
            Home
          </Link>{' '}
          / <span>My Project Dashboard</span>
        </div>
      </div>

      {pageError && (
        <p className="error-text" role="alert">
          {pageError}
        </p>
      )}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon-container projects">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Project Progress</span>
            <span className="summary-card-value">
              {isLoading ? '…' : `${stats.overallProgress}%`}
            </span>
            <span className="summary-card-desc">overall completion</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container tasks">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <line x1="4" y1="6" x2="4.01" y2="6" />
              <line x1="4" y1="12" x2="4.01" y2="12" />
              <line x1="4" y1="18" x2="4.01" y2="18" />
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Tasks Assigned</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.totalTasks}</span>
            <span className="summary-card-desc">total deliverables</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container students">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Tasks Completed</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.completedTasks}</span>
            <span className="summary-card-desc">submitted deliverables</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container faculty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Score</span>
            <span className="summary-card-value">
              {isLoading ? '…' : `${stats.totalEarned}/${stats.totalAssigned}`}
            </span>
            <span className="summary-card-desc">evaluated grade points</span>
          </div>
        </div>
      </div>

      {/* Active Project Details */}
      {!isLoading && activeAllocation && (
        <div className="card" style={{ marginBottom: '25px', padding: '20px 24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
            Active Project Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
            <div>
              <strong>Title:</strong>{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {activeAllocation.projectTitle || '—'}
              </span>
            </div>
            <div>
              <strong>Faculty Supervisor:</strong>{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {activeAllocation.facultyName || '—'}
              </span>
            </div>
            <div>
              <strong>Deadline:</strong>{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {formatDate(activeAllocation.projectEndDate)}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{activeAllocation.progressPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
              <div
                style={{
                  width: `${Number(activeAllocation.progressPercentage) || 0}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">My Project Deliverables</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Deliverable Title</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Loading deliverables…
                  </td>
                </tr>
              ) : recentTasks.length ? (
                recentTasks.map((task) => (
                  <tr key={task.taskID}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {task.taskTitle}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      {formatDate(task.taskDueDate)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          (task.taskPriorityName || '').toLowerCase().includes('high') ||
                          (task.taskPriorityName || '').toLowerCase().includes('critical')
                            ? 'high'
                            : (task.taskPriorityName || '').toLowerCase().includes('medium')
                            ? 'medium'
                            : 'low'
                        }`}
                      >
                        {task.taskPriorityName || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {task.earnedScore !== null && task.earnedScore !== undefined
                          ? task.earnedScore
                          : '-'}{' '}
                        / {task.assignedScore}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          (task.taskStatusName || '').toLowerCase().includes('complet')
                            ? 'completed'
                            : (task.taskStatusName || '').toLowerCase().includes('progress')
                            ? 'progress'
                            : (task.taskStatusName || '').toLowerCase().includes('reject')
                            ? 'rejected'
                            : 'pending'
                        }`}
                      >
                        {task.taskStatusName || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No deliverables found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
