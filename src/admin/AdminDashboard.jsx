import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { dashboardService } from '../services/dashboardService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    studentCount: 0,
    facultyCount: 0,
    projectCount: 0,
    taskCount: 0
  });
  const [statusSummary, setStatusSummary] = useState([]);
  const [prioritySummary, setPrioritySummary] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          resUserCount,
          resStudentCount,
          resFacultyCount,
          resProjectCount,
          resTaskCount,
          resStatusSummary,
          resPrioritySummary,
          resOverdueTasks,
          resGradeDistribution
        ] = await Promise.all([
          dashboardService.getUserCount(),
          dashboardService.getTotalStudents(),
          dashboardService.getTotalFaculty(),
          dashboardService.getTotalProjects(),
          dashboardService.getTaskCount(),
          dashboardService.getTaskStatusSummary(),
          dashboardService.getPrioritySummary(),
          dashboardService.getOverdueTasks(),
          dashboardService.getGradeDistribution(),
        ]);

        setStats({
          userCount: resUserCount?.data || 0,
          studentCount: resStudentCount?.data || 0,
          facultyCount: resFacultyCount?.data || 0,
          projectCount: resProjectCount?.data || 0,
          taskCount: resTaskCount?.data || 0,
        });

        if (resStatusSummary?.success && Array.isArray(resStatusSummary.data)) {
          setStatusSummary(resStatusSummary.data);
        }
        if (resPrioritySummary?.success && Array.isArray(resPrioritySummary.data)) {
          setPrioritySummary(resPrioritySummary.data);
        }
        if (resOverdueTasks?.success && Array.isArray(resOverdueTasks.data)) {
          setOverdueTasks(resOverdueTasks.data);
        }
        if (resGradeDistribution?.success && Array.isArray(resGradeDistribution.data)) {
          setGradeDistribution(resGradeDistribution.data);
        }
      } catch (error) {
        console.error("Error loading dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="page-title-block">
          <h1>Dashboard</h1>
          <div className="breadcrumbs">
            <span>Loading dashboard statistics...</span>
          </div>
        </div>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{
            margin: '0 auto 20px',
            width: '40px',
            height: '40px',
            border: '4px solid #cbd5e1',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <span>Fetching real-time metrics...</span>
        </div>
      </AdminLayout>
    );
  }

  const totalStatusTasks = statusSummary.reduce((acc, curr) => acc + curr.totalTasks, 0) || 1;
  const totalPriorityTasks = prioritySummary.reduce((acc, curr) => acc + curr.totalTasks, 0) || 1;

  const getStatusColor = (statusName) => {
    const name = statusName.toLowerCase();
    if (name.includes('complete')) return 'var(--success)';
    if (name.includes('progress')) return 'var(--primary)';
    if (name.includes('reject')) return 'var(--danger)';
    return 'var(--warning)';
  };

  const getPriorityColor = (priorityName) => {
    const name = priorityName.toLowerCase();
    if (name.includes('high') || name.includes('critical')) return 'var(--danger)';
    if (name.includes('medium') || name.includes('normal')) return 'var(--warning)';
    return 'var(--text-muted)';
  };

  return (
    <AdminLayout>
      <div className="page-title-block">
        <h1>Dashboard Overview</h1>
        <div className="breadcrumbs">
<Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Dashboard</span>        </div>
      </div>

      {/* Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon-container users">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Users</span>
            <span className="summary-card-value">{stats.userCount}</span>
            <span className="summary-card-desc">registered users</span>
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
            <span className="summary-card-title">Total Students</span>
            <span className="summary-card-value">{stats.studentCount}</span>
            <span className="summary-card-desc">enrolled students</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container faculty">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Faculty</span>
            <span className="summary-card-value">{stats.facultyCount}</span>
            <span className="summary-card-desc">faculty members</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-container projects">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="summary-card-info">
            <span className="summary-card-title">Total Projects</span>
            <span className="summary-card-value">{stats.projectCount}</span>
            <span className="summary-card-desc">active projects</span>
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
            <span className="summary-card-title">Total Tasks</span>
            <span className="summary-card-value">{stats.taskCount}</span>
            <span className="summary-card-desc">total tasks</span>
          </div>
        </div>
      </div>

      {/* Distribution Summary & Grade Distribution Row */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {/* Task Status Summary */}
        <div className="chart-card">
          <div className="chart-card-header">Task Status Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px', justifyContent: 'center' }}>
            {statusSummary.length > 0 ? (
              statusSummary.map((item, idx) => {
                const pct = ((item.totalTasks / totalStatusTasks) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{item.taskStatus}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.totalTasks} tasks ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                      <div style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        backgroundColor: getStatusColor(item.taskStatus), 
                        borderRadius: '4px' 
                      }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No status data available.</span>
            )}
          </div>
        </div>

        {/* Task Priority breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">Task Priority Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px', justifyContent: 'center' }}>
            {prioritySummary.length > 0 ? (
              prioritySummary.map((item, idx) => {
                const pct = ((item.totalTasks / totalPriorityTasks) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{item.priority}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.totalTasks} tasks ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
                      <div style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        backgroundColor: getPriorityColor(item.priority), 
                        borderRadius: '4px' 
                      }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No priority data available.</span>
            )}
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>
          Student Grade Distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
          {gradeDistribution.length > 0 ? (
            gradeDistribution.map((gd, idx) => (
              <div key={idx} style={{ 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: 'var(--bg-main)'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {gd.grade || 'N/A'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                  {gd.students} {gd.students === 1 ? 'student' : 'students'}
                </div>
              </div>
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No grade allocations recorded.</span>
          )}
        </div>
      </div>

      {/* Overdue Tasks Registry */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Overdue Deliverables (Incomplete & Past Due)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Task ID</th>
                <th>Task Title</th>
                <th>Student</th>
                <th>Supervisor (Faculty)</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'center' }}>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.length > 0 ? (
                overdueTasks.map((task) => (
                  <tr key={task.taskID}>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                    <td>{task.student}</td>
                    <td>{task.faculty}</td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      {task.taskDueDate ? new Date(task.taskDueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge rejected" style={{ fontWeight: 700 }}>
                        {task.daysOverdue} days past
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No overdue tasks found! All active tasks are within schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
