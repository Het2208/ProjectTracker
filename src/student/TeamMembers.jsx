 import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import TableState from '../common/TableState';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';

/**
 * Shows all allocations from the same project(s) that this student is part of.
 * Since the system is one-student-per-allocation, "team members" are other
 * students working on the same projectID. Falls back to showing all allocations
 * when fullName cannot be resolved.
 */
const TeamMembers = () => {
  const { fullName } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadAllocations = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await projectAllocationService.getAll();
      if (!response?.success || !Array.isArray(response.data))
        throw new Error(response?.message || 'Unable to load team members.');
      setAllocations(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load team members.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAllocations(); }, [loadAllocations]);

  // Find project IDs this student is allocated to
  const myProjectIds = useMemo(() => {
    if (!fullName) return new Set();
    return new Set(
      allocations.filter((a) => a.studentName === fullName).map((a) => a.projectID),
    );
  }, [allocations, fullName]);

  // Team = all allocations in the same projects (includes the student themselves)
  const teamAllocations = useMemo(() => {
    if (!fullName || myProjectIds.size === 0) return allocations;
    return allocations.filter((a) => myProjectIds.has(a.projectID));
  }, [allocations, fullName, myProjectIds]);

  return (
    <StudentLayout>
      <div className="page-title-block">
        <h1>Team Members</h1>
        <div className="breadcrumbs">
          <Link to="/student/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>
            Home
          </Link>{' '}
          / <span>Team Members</span>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Project Team Assignments</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Student Name</th>
                <th>Project</th>
                <th>Faculty Supervisor</th>
                <th style={{ textAlign: 'center' }}>Progress</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              <TableState
                colSpan={6}
                loading={isLoading}
                error={pageError}
                count={teamAllocations.length}
                emptyText="No team members found."
                onRetry={loadAllocations}
              />
              {!isLoading && !pageError && teamAllocations.map((allocation) => (
                <tr key={allocation.projectAllocationID} style={allocation.studentName === fullName ? { backgroundColor: 'var(--primary-light)' } : {}}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{allocation.studentID}</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {allocation.studentName || '—'}
                      {allocation.studentName === fullName && (
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                          You
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{allocation.projectTitle || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{allocation.facultyName || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{allocation.progressPercentage}%</span>
                  </td>
                  <td>
                    {allocation.overAllGrade ? (
                      <span className="badge completed">{allocation.overAllGrade}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
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

export default TeamMembers;
