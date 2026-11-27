import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import TableState from '../common/TableState';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { taskService } from '../services/taskService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const ScoresGrades = () => {
  const { fullName } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await taskService.getAll();
      if (!response?.success || !Array.isArray(response.data))
        throw new Error(response?.message || 'Unable to load scores.');
      const myTasks = fullName
        ? response.data.filter((t) => t.studentName === fullName)
        : response.data;
      // Only show tasks that have been evaluated (earnedScore is set)
      setTasks(myTasks.filter((t) => t.earnedScore !== null && t.earnedScore !== undefined));
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load scores.'));
    } finally {
      setIsLoading(false);
    }
  }, [fullName]);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        [task.taskTitle, task.projectTitle].some((v) =>
          v?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    [tasks, searchQuery],
  );

  const totals = useMemo(() => {
    const totalAssigned = tasks.reduce((s, t) => s + Number(t.assignedScore ?? 0), 0);
    const totalEarned = tasks.reduce((s, t) => s + Number(t.earnedScore ?? 0), 0);
    const pct = totalAssigned > 0 ? ((totalEarned / totalAssigned) * 100).toFixed(1) : '0.0';
    return { totalAssigned, totalEarned, pct };
  }, [tasks]);

  return (
    <StudentLayout>
      <div className="page-title-block">
        <h1>Scores &amp; Grades</h1>
        <div className="breadcrumbs">
          <Link to="/student/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>
            Home
          </Link>{' '}
          / <span>Scores &amp; Grades</span>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {/* Summary Banner */}
      {!isLoading && tasks.length > 0 && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', gap: '40px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
              {totals.totalEarned}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Earned
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {totals.totalAssigned}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Assigned
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
              {totals.pct}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Score Percentage
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
              <span>Score Progress</span>
              <span>{totals.pct}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${totals.pct}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '5px' }} />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search evaluated tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">My Evaluated Task Grades (SPM_Task)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Evaluated Deliverable (Task)</th>
                <th>Project</th>
                <th style={{ textAlign: 'center' }}>Marks Obtained</th>
                <th style={{ textAlign: 'center' }}>Progress</th>
                <th>Completed On</th>
                <th>Supervisor Remarks</th>
              </tr>
            </thead>
            <tbody>
              <TableState
                colSpan={7}
                loading={isLoading}
                error={pageError}
                count={filteredTasks.length}
                emptyText="No evaluated tasks found. Scores will appear here once your faculty grades your submissions."
                onRetry={loadTasks}
              />
              {!isLoading && !pageError && filteredTasks.map((task) => (
                <tr key={task.taskID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.taskID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.taskTitle}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{task.projectTitle || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{task.earnedScore}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {task.assignedScore}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{task.progressPercentage}%</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(task.taskCompletedDate)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.4', maxWidth: '300px' }}>
                    {task.facultyRemarks || <span style={{ fontStyle: 'italic' }}>No remarks yet.</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ScoresGrades;
