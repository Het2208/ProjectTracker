import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from './FacultyLayout';
import TableState from '../common/TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Students under supervision. The backend user list is Admin-only, so the
 * student roster is derived from ProjectAllocation/GetAll (StudentID +
 * StudentName per allocated project).
 */
const StudentBatches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadAllocations = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await projectAllocationService.getAll();
      if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load student allocations.');
      setAllocations(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load student allocations.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAllocations(); }, [loadAllocations]);

  const students = useMemo(() => {
    const byStudent = new Map();
    allocations.forEach((allocation) => {
      const key = allocation.studentID;
      if (!byStudent.has(key)) {
        byStudent.set(key, {
          studentID: allocation.studentID,
          studentName: allocation.studentName,
          projects: [],
        });
      }
      byStudent.get(key).projects.push(allocation);
    });
    return Array.from(byStudent.values());
  }, [allocations]);

  const filteredStudents = useMemo(() => students.filter((student) =>
    student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.projects.some((project) => project.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [students, searchQuery]);

  return (
    <FacultyLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Student Batches</h1>
          <div className="breadcrumbs">
            <Link to="/faculty/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>Student Batches</span>
          </div>
        </div>
      </div>

      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search students or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">Students with Allocated Projects</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Student ID</th>
                <th>Student Name</th>
                <th>Allocated Project(s)</th>
                <th style={{ textAlign: 'center' }}>Projects</th>
                <th style={{ textAlign: 'center' }}>Avg Progress</th>
                <th>Grades</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={6} loading={isLoading} error={pageError} count={filteredStudents.length} emptyText={`No students found matching "${searchQuery}"`} onRetry={loadAllocations} />
              {!isLoading && !pageError && filteredStudents.map((student) => {
                const averageProgress = student.projects.reduce((sum, project) => sum + Number(project.progressPercentage || 0), 0) / student.projects.length;
                return (
                  <tr key={student.studentID}>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{student.studentID}</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.studentName || '—'}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {student.projects.map((project) => (
                        <div key={project.projectAllocationID} style={{ fontSize: '0.85rem' }}>
                          {project.projectTitle || '—'} <span style={{ opacity: 0.7 }}>({formatDate(project.projectStartDate)} → {formatDate(project.projectEndDate)})</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ textAlign: 'center' }}>{student.projects.length}</td>
                    <td style={{ textAlign: 'center' }}>{averageProgress.toFixed(1)}%</td>
                    <td>
                      {student.projects.some((project) => project.overAllGrade)
                        ? student.projects.filter((project) => project.overAllGrade).map((project) => (
                          <span key={project.projectAllocationID} className="badge completed" style={{ marginRight: '4px' }}>
                            {project.projectTitle?.slice(0, 12)}…: {project.overAllGrade}
                          </span>
                        ))
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default StudentBatches;
