import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getApiErrorMessage } from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';

// Every DashboardController endpoint not already surfaced on the dashboard cards.
// `columns` map the anonymous objects returned by the API (camelCase in JSON).
const REPORTS = [
  { key: 'facultyWorkload', title: 'Faculty Workload (Projects per Faculty)', service: 'getFacultyWorkload', columns: [
    { key: 'facultyName', label: 'Faculty' }, { key: 'totalProjects', label: 'Total Projects' } ] },
  { key: 'upcomingDueTasks', title: 'Tasks Due Within 7 Days', service: 'getUpcomingDueTasks', columns: [
    { key: 'taskID', label: 'ID' }, { key: 'taskTitle', label: 'Task' }, { key: 'project', label: 'Project' }, { key: 'student', label: 'Student' },
    { key: 'taskDueDate', label: 'Due Date', type: 'date' }, { key: 'remainingDays', label: 'Days Left' } ] },
  { key: 'upcomingFollowUps', title: 'Follow-Ups in Next 7 Days', service: 'getUpcomingFollowUps', columns: [
    { key: 'taskTitle', label: 'Task' }, { key: 'student', label: 'Student' }, { key: 'faculty', label: 'Faculty' },
    { key: 'nextFollowUpDate', label: 'Follow-Up Date', type: 'date' } ] },
  { key: 'overdueProjects', title: 'Overdue Projects (Past End Date, < 100%)', service: 'getOverdueProjects', columns: [
    { key: 'projectTitle', label: 'Project' }, { key: 'student', label: 'Student' }, { key: 'faculty', label: 'Faculty' },
    { key: 'projectEndDate', label: 'End Date', type: 'date' }, { key: 'progressPercentage', label: 'Progress %' } ] },
  { key: 'projectTaskSummary', title: 'Project Task Summary', service: 'getProjectTaskSummary', columns: [
    { key: 'project', label: 'Project' }, { key: 'totalTasks', label: 'Total' }, { key: 'completedTasks', label: 'Completed' },
    { key: 'pendingTasks', label: 'Pending' }, { key: 'averageProgress', label: 'Avg Progress %' } ] },
  { key: 'projectTaskStatistics', title: 'Project Task Statistics', service: 'getProjectTaskStatistics', columns: [
    { key: 'project', label: 'Project' }, { key: 'totalTasks', label: 'Total' }, { key: 'completedTasks', label: 'Completed' },
    { key: 'pendingTasks', label: 'Pending' }, { key: 'overdueTasks', label: 'Overdue' } ] },
  { key: 'projectScoreSummary', title: 'Project Score Summary', service: 'getProjectScoreSummary', columns: [
    { key: 'project', label: 'Project' }, { key: 'totalAssignedScore', label: 'Assigned' }, { key: 'totalEarnedScore', label: 'Earned' },
    { key: 'scorePercentage', label: 'Score %' } ] },
  { key: 'topProjectsByScore', title: 'Top 10 Projects by Average Score', service: 'getTopProjectsByScore', columns: [
    { key: 'project', label: 'Project' }, { key: 'averageScore', label: 'Average Score' } ] },
  { key: 'facultyStatistics', title: 'Faculty Statistics', service: 'getFacultyStatistics', columns: [
    { key: 'faculty', label: 'Faculty' }, { key: 'totalProjects', label: 'Projects' }, { key: 'totalTasks', label: 'Tasks Given' },
    { key: 'averageProgress', label: 'Avg Progress %' } ] },
  { key: 'facultyRankingsByProgress', title: 'Faculty Rankings by Progress', service: 'getFacultyRankingsByProgress', columns: [
    { key: 'faculty', label: 'Faculty' }, { key: 'averageProgress', label: 'Average Progress %' } ] },
  { key: 'studentTasks', title: 'Tasks Assigned per Student', service: 'getStudentTasks', columns: [
    { key: 'studentName', label: 'Student' }, { key: 'totalTasks', label: 'Total Tasks' } ] },
  { key: 'studentTaskStatistics', title: 'Student Task Statistics', service: 'getStudentTaskStatistics', columns: [
    { key: 'student', label: 'Student' }, { key: 'totalTasks', label: 'Total' }, { key: 'completedTasks', label: 'Completed' },
    { key: 'pendingTasks', label: 'Pending' }, { key: 'averageScore', label: 'Avg Score' } ] },
  { key: 'topStudents', title: 'Top 10 Students by Average Score', service: 'getTopStudents', columns: [
    { key: 'studentName', label: 'Student' }, { key: 'averageScore', label: 'Average Score' } ] },
  { key: 'bottomStudents', title: 'Bottom 10 Students by Average Score', service: 'getBottomStudents', columns: [
    { key: 'studentName', label: 'Student' }, { key: 'averageScore', label: 'Average Score' } ] },
  { key: 'monthlyCompletion', title: 'Monthly Completed Tasks', service: 'getMonthlyCompletion', columns: [
    { key: 'year', label: 'Year' }, { key: 'month', label: 'Month' }, { key: 'totalCompletedTasks', label: 'Completed Tasks' } ] },
  { key: 'roleWiseActiveUserCount', title: 'Active Users per Role', service: 'getRoleWiseActiveUserCount', columns: [
    { key: 'roleName', label: 'Role' }, { key: 'activeUsers', label: 'Active Users' } ] },
  { key: 'roleStatistics', title: 'Role Statistics', service: 'getRoleStatistics', columns: [
    { key: 'roleName', label: 'Role' }, { key: 'totalUsers', label: 'Total' }, { key: 'activeUsers', label: 'Active' }, { key: 'inactiveUsers', label: 'Inactive' } ] },
  { key: 'rolesWithMoreThanTenUsers', title: 'Roles with More Than 10 Users', service: 'getRolesWithMoreThanTenUsers', columns: [
    { key: 'roleName', label: 'Role' }, { key: 'totalUsers', label: 'Total Users' } ] },
];

const formatCell = (value, type) => {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'date') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
};

const ReportCard = ({ report, rows, error }) => (
  <div className="data-table-container" style={{ marginBottom: '24px' }}>
    <div className="data-table-header">
      <span className="table-title">{report.title}</span>
    </div>
    <div className="table-responsive">
      <table className="dashboard-table">
        <thead>
          <tr>{report.columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {error ? (
            <tr><td colSpan={report.columns.length} style={{ textAlign: 'center', padding: '24px' }}><span className="error-text" role="alert">{error}</span></td></tr>
          ) : rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {report.columns.map((column) => (
                  <td key={column.key}>{formatCell(row[column.key], column.type)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td colSpan={report.columns.length} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No data available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminReports = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const entries = await Promise.all(REPORTS.map(async (report) => {
        try {
          const response = await dashboardService[report.service]();
          return [report.key, { rows: Array.isArray(response?.data) ? response.data : [], error: response?.success ? '' : (response?.message || 'Report failed.') }];
        } catch (error) {
          return [report.key, { rows: [], error: getApiErrorMessage(error, 'Report failed.') }];
        }
      }));
      setResults(Object.fromEntries(entries));
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load reports.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadReports(); }, [loadReports]);

  return (
    <AdminLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <div className="breadcrumbs">
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Reports</span>
          </div>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={loadReports} disabled={isLoading}>{isLoading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {isLoading && !Object.keys(results).length ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          <span>Loading reports…</span>
        </div>
      ) : (
        REPORTS.map((report) => {
          const result = results[report.key] ?? { rows: [], error: '' };
          return <ReportCard key={report.key} report={report} rows={result.rows} error={result.error} />;
        })
      )}
    </AdminLayout>
  );
};

export default AdminReports;
