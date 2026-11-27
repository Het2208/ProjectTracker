import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from './FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';
import { taskService } from '../services/taskService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const FacultyDashboard = () => {
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
        const [allocationsResponse, tasksResponse] = await Promise.all([
          projectAllocationService.getAll(),
          taskService.getAll(),
        ]);
        if (!allocationsResponse?.success || !Array.isArray(allocationsResponse.data)) throw new Error(allocationsResponse?.message || 'Unable to load allocations.');
        if (!tasksResponse?.success || !Array.isArray(tasksResponse.data)) throw new Error(tasksResponse?.message || 'Unable to load tasks.');

        const myAllocations = allocationsResponse.data.filter((a) =>
          (userId && (a.facultyID === userId || a.facultyId === userId)) ||
          (fullName && a.facultyName?.toLowerCase() === fullName.toLowerCase()) ||
          (!userId && !fullName)
        );
        const myAllocationIds = new Set(myAllocations.map((a) => a.projectAllocationID));
        const myTasks = tasksResponse.data.filter((t) =>
          myAllocationIds.has(t.projectAllocationID) ||
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
    const evaluated = tasks.filter((task) => task.earnedScore !== null && task.earnedScore !== undefined).length;
    const pending = tasks.filter((task) => (task.earnedScore === null || task.earnedScore === undefined) && task.taskStatusName !== 'Completed').length;
    return {
      projects: allocations.length,
      tasks: tasks.length,
      evaluated,
      pending,
    };
  }, [allocations, tasks]);

  const priorityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((task) => {
      const name = (task.taskPriorityName || '').toLowerCase();
      if (name.includes('high') || name.includes('critical')) counts.High += 1;
      else if (name.includes('medium') || name.includes('normal')) counts.Medium += 1;
      else counts.Low += 1;
    });
    return counts;
  }, [tasks]);

  const totalTasksForPie = Math.max(tasks.length, 1);
  const pieSegments = [
    { color: 'var(--danger)', count: priorityCounts.High, offset: 0 },
    { color: 'var(--warning)', count: priorityCounts.Medium, offset: priorityCounts.High },
    { color: 'var(--primary)', count: priorityCounts.Low, offset: priorityCounts.High + priorityCounts.Medium },
  ];

  return (
    <FacultyLayout>
      <div className="page-title-block">
        <h1>Faculty Workspace</h1>
        <div className="breadcrumbs">
          <Link to="/faculty/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> /{' '}
          <span>Supervision Dashboard</span>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {/* Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon-container projects">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Allocated Projects</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.projects}</span>
            <span className="summary-card-desc">active allocations</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container tasks">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="9" y1="6" x2="20" y2="6"></line>
              <line x1="9" y1="12" x2="20" y2="12"></line>
              <line x1="9" y1="18" x2="20" y2="18"></line>
              <line x1="4" y1="6" x2="4.01" y2="6"></line>
              <line x1="4" y1="12" x2="4.01" y2="12"></line>
              <line x1="4" y1="18" x2="4.01" y2="18"></line>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Active Deliverables</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.tasks}</span>
            <span className="summary-card-desc">assigned tasks</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container students">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Evaluated Deliverables</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.evaluated}</span>
            <span className="summary-card-desc">scored tasks</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container faculty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Pending Reviews</span>
            <span className="summary-card-value">{isLoading ? '…' : stats.pending}</span>
            <span className="summary-card-desc">tasks awaiting grades</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">Project Lifecycle Progress</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '220px', justifyContent: 'center' }}>
            {isLoading ? (
              <span style={{ color: 'var(--text-muted)' }}>Loading…</span>
            ) : allocations.length ? (
              allocations.map((allocation) => (
                <div key={allocation.projectAllocationID}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>{allocation.projectTitle || `Allocation #${allocation.projectAllocationID}`}</span>
                    <span style={{ fontWeight: 600 }}>{allocation.progressPercentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                    <div
                      style={{
                        width: `${Number(allocation.progressPercentage) || 0}%`,
                        height: '100%',
                        backgroundColor: allocation.progressPercentage >= 100 ? 'var(--success)' : allocation.progressPercentage >= 50 ? 'var(--primary)' : 'var(--warning)',
                        borderRadius: '4px',
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No project allocations yet.</span>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">Deliverable Priorities</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', gap: '24px' }}>
            <svg width="150" height="150" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5"></circle>
              {priorityCounts.High + priorityCounts.Medium + priorityCounts.Low > 0 && pieSegments.map((segment, index) => (
                <circle
                  key={index}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${(segment.count / totalTasksForPie) * 100} ${100 - (segment.count / totalTasksForPie) * 100}`}
                  strokeDashoffset={-((segment.offset / totalTasksForPie) * 100)}
                ></circle>
              ))}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <span><span style={{ color: 'var(--danger)' }}>●</span> High — {priorityCounts.High}</span>
              <span><span style={{ color: 'var(--warning)' }}>●</span> Medium — {priorityCounts.Medium}</span>
              <span><span style={{ color: 'var(--primary)' }}>●</span> Low — {priorityCounts.Low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supervised Project List */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Supervised Project Lists</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Assigned Student</th>
                <th>Tasks Completed</th>
                <th>Progress</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading allocations…</td></tr>
              ) : allocations.length ? (
                allocations.map((allocation) => (
                  <tr key={allocation.projectAllocationID}>
                    <td style={{ fontWeight: 600 }}>{allocation.projectTitle || '—'}</td>
                    <td>{allocation.studentName || '—'}</td>
                    <td>{allocation.totalCompletedTasks} / {allocation.totalTasksGiven}</td>
                    <td>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${Number(allocation.progressPercentage) || 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{allocation.progressPercentage}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(allocation.projectEndDate)}</td>
                    <td>
                      {allocation.overAllGrade
                        ? <span className="badge completed">Graded {allocation.overAllGrade}</span>
                        : Number(allocation.progressPercentage) >= 100
                          ? <span className="badge completed">Completed</span>
                          : <span className="badge progress">In Progress</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No project allocations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
