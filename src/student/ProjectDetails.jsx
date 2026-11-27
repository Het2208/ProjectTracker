import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';
import { taskService } from '../services/taskService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'N/A');

const ProjectDetails = () => {
  const { fullName } = useAuth();
  const [allocation, setAllocation] = useState(null);
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

        const myAllocations = fullName
          ? allocRes.data.filter((a) => a.studentName === fullName)
          : allocRes.data;
        const myTasks = fullName
          ? taskRes.data.filter((t) => t.studentName === fullName)
          : taskRes.data;

        // Use the first allocation as the active project
        setAllocation(myAllocations[0] ?? null);
        setTasks(myTasks);
      } catch (error) {
        setPageError(getApiErrorMessage(error, 'Unable to load project details.'));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [fullName]);

  const completedTasks = tasks.filter((t) =>
    (t.taskStatusName || '').toLowerCase().includes('complet'),
  ).length;

  return (
    <StudentLayout>
      <div className="page-title-block">
        <h1>My Project Details</h1>
        <div className="breadcrumbs">
          <Link to="/student/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>
            Home
          </Link>{' '}
          / <span>Project Details</span>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading project details…
        </div>
      ) : !allocation ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No project allocation found for your account.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Allocation ID: #{allocation.projectAllocationID}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
                    {allocation.projectTitle || 'Untitled Project'}
                  </h2>
                </div>
                {allocation.overAllGrade ? (
                  <span className="badge completed" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Grade {allocation.overAllGrade}
                  </span>
                ) : (
                  <span className="badge progress" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    In Progress
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Faculty Supervisor</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{allocation.facultyName || '—'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Timeline</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatDate(allocation.projectStartDate)} → {formatDate(allocation.projectEndDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
                Task Overview
              </h3>
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No tasks assigned yet.</p>
              ) : (
                <table className="dashboard-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.taskID}>
                        <td style={{ fontWeight: 600 }}>{task.taskTitle}</td>
                        <td>
                          <span className={`badge ${
                            (task.taskPriorityName || '').toLowerCase().includes('high') ? 'high'
                            : (task.taskPriorityName || '').toLowerCase().includes('medium') ? 'medium'
                            : 'low'
                          }`}>{task.taskPriorityName || '—'}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(task.taskDueDate)}</td>
                        <td>
                          <span className={`badge ${
                            (task.taskStatusName || '').toLowerCase().includes('complet') ? 'completed'
                            : (task.taskStatusName || '').toLowerCase().includes('progress') ? 'progress'
                            : 'pending'
                          }`}>{task.taskStatusName || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
                Project Progress
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Overall Status</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {allocation.progressPercentage}%
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ width: `${Number(allocation.progressPercentage) || 0}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{allocation.totalTasksGiven}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tasks</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{allocation.totalCompletedTasks ?? completedTasks}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text-main)' }}>
                Grade &amp; Evaluation
              </h3>
              <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                <strong>Overall Grade:</strong>{' '}
                <span style={{ color: allocation.overAllGrade ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {allocation.overAllGrade || 'Not yet graded'}
                </span>
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Assigned Date:</strong>{' '}
                {formatDate(allocation.assignedDate)}
              </p>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default ProjectDetails;
