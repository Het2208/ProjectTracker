import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableState from './TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { projectAllocationService } from '../services/projectAllocationService';
import { projectMasterService } from '../services/projectMasterService';
import { userService } from '../services/userService';

const emptyForm = {
  projectID: '',
  studentID: '',
  facultyID: '',
  projectStartDate: '',
  projectEndDate: '',
  totalTasksGiven: '0',
  totalCompletedTasks: '0',
  progressPercentage: '0',
  overAllGrade: '',
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Project Allocation CRUD shared by Admin (/admin/project-allocations) and
 * Faculty (/faculty/allocations). Backend allows Admin,Faculty on Add/Update/Delete.
 */
const AllocationManagerPage = ({ layout, title, breadcrumb, tableTitle, canManage = true }) => {
  const { pageWrapper: PageWrapper, homePath } = layout;
  const [searchQuery, setSearchQuery] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllocations = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [allocationsResponse, projectsResponse, usersResponse] = await Promise.all([
        projectAllocationService.getAll(),
        projectMasterService.getAll(),
        userService.getAll(),
      ]);
      if (!allocationsResponse?.success || !Array.isArray(allocationsResponse.data)) throw new Error(allocationsResponse?.message || 'Unable to load project allocations.');
      setAllocations(allocationsResponse.data);
      if (projectsResponse?.success) setProjects(projectsResponse.data ?? []);
      if (usersResponse?.success) {
        setStudents((usersResponse.data ?? []).filter((u) => u.userTypeName === 'Student'));
        setFaculty((usersResponse.data ?? []).filter((u) => u.userTypeName === 'Faculty'));
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load project allocations.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAllocations(); }, [loadAllocations]);

  const filteredAllocations = useMemo(() => allocations.filter((allocation) =>
    [allocation.projectTitle, allocation.studentName, allocation.facultyName, allocation.overAllGrade].some((value) =>
      value?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [allocations, searchQuery]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAllocation(null);
    setFormErrors({});
  };

  const openModal = async (type, allocation = null) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    if (!allocation) {
      setSelectedAllocation(null);
      setFormData(emptyForm);
      return;
    }
    setIsDetailsLoading(true);
    try {
      const response = await projectAllocationService.getById(allocation.projectAllocationID);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load allocation details.');
      const details = response.data;
      setSelectedAllocation(details);
      setFormData({
        projectID: String(details.projectID ?? ''),
        studentID: String(details.studentID ?? ''),
        facultyID: String(details.facultyID ?? ''),
        projectStartDate: toDateInput(details.projectStartDate),
        projectEndDate: toDateInput(details.projectEndDate),
        totalTasksGiven: String(details.totalTasksGiven ?? 0),
        totalCompletedTasks: String(details.totalCompletedTasks ?? 0),
        progressPercentage: String(details.progressPercentage ?? 0),
        overAllGrade: details.overAllGrade || '',
      });
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load allocation details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.projectID) errors.projectID = 'Project is required.';
    if (!formData.studentID) errors.studentID = 'Student is required.';
    if (!formData.facultyID) errors.facultyID = 'Faculty is required.';
    if (!formData.projectStartDate) errors.projectStartDate = 'Project start date is required.';
    if (!formData.projectEndDate) errors.projectEndDate = 'Project end date is required.';
    else if (formData.projectStartDate && new Date(formData.projectEndDate) <= new Date(formData.projectStartDate)) {
      errors.projectEndDate = 'Project end date must be after the start date.';
    }
    const progress = Number(formData.progressPercentage);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) errors.progressPercentage = 'Progress must be between 0 and 100.';
    if (formData.overAllGrade && !/^[ABC]$/.test(formData.overAllGrade)) errors.overAllGrade = 'Grade must be A, B, or C.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = selectedAllocation
        ? await projectAllocationService.update(selectedAllocation.projectAllocationID, formData)
        : await projectAllocationService.add(formData);
      if (!response?.success) throw new Error(response?.message || 'Unable to save allocation.');
      setMessage(response.message);
      closeModal();
      await loadAllocations();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save allocation.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project allocation?')) return;
    setMessage('');
    try {
      const response = await projectAllocationService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete allocation.');
      setMessage(response.message);
      await loadAllocations();
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to delete allocation.'));
    }
  };

  const selectField = (id, label, value, onChange, options, error) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <select id={id} className="form-control" value={value} onChange={onChange}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );

  return (
    <PageWrapper>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{title}</h1>
          <div className="breadcrumbs">
            <Link to={homePath} style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>{breadcrumb}</span>
          </div>
        </div>
        {canManage && (
          <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => openModal('Add')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Allocate Project
          </button>
        )}
      </div>

      {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search allocations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">{tableTitle}</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Project</th>
                <th>Student</th>
                <th>Faculty Guide</th>
                <th>Duration</th>
                <th>Tasks</th>
                <th style={{ width: '160px' }}>Progress</th>
                <th>Grade</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={9} loading={isLoading} error={pageError} count={filteredAllocations.length} emptyText={`No allocations found matching "${searchQuery}"`} onRetry={loadAllocations} />
              {!isLoading && !pageError && filteredAllocations.map((allocation) => (
                <tr key={allocation.projectAllocationID}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{allocation.projectAllocationID}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{allocation.projectTitle || '—'}</span></td>
                  <td>{allocation.studentName || '—'}</td>
                  <td>{allocation.facultyName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {formatDate(allocation.projectStartDate)} → {formatDate(allocation.projectEndDate)}
                  </td>
                  <td>{allocation.totalCompletedTasks} / {allocation.totalTasksGiven}</td>
                  <td>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${Number(allocation.progressPercentage) || 0}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{allocation.progressPercentage}%</span>
                    </div>
                  </td>
                  <td>{allocation.overAllGrade ? <span className="badge completed">{allocation.overAllGrade}</span> : '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openModal('Details', allocation)} style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>View</button>
                      {canManage && <button onClick={() => openModal('Edit', allocation)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>}
                      {canManage && <button onClick={() => handleDelete(allocation.projectAllocationID)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {modalType === 'Details' ? 'Allocation Details' : `${modalType} Project Allocation`}
              </h3>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                <p><strong>Project:</strong> {selectedAllocation?.projectTitle || '—'}</p>
                <p><strong>Student:</strong> {selectedAllocation?.studentName || '—'}</p>
                <p><strong>Faculty Guide:</strong> {selectedAllocation?.facultyName || '—'}</p>
                <p><strong>Assigned Date:</strong> {formatDate(selectedAllocation?.assignedDate)}</p>
                <p><strong>Start Date:</strong> {formatDate(selectedAllocation?.projectStartDate)}</p>
                <p><strong>End Date:</strong> {formatDate(selectedAllocation?.projectEndDate)}</p>
                <p><strong>Tasks:</strong> {selectedAllocation?.totalCompletedTasks ?? 0} / {selectedAllocation?.totalTasksGiven ?? 0} completed</p>
                <p><strong>Progress:</strong> {selectedAllocation?.progressPercentage ?? 0}%</p>
                <p><strong>Overall Grade:</strong> {selectedAllocation?.overAllGrade || 'Not graded'}</p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ padding: '24px' }}>
                  {selectField('projectID', 'Project', formData.projectID, (e) => setFormData({ ...formData, projectID: e.target.value }), projects.map((p) => ({ value: String(p.projectId), label: p.projectTitle })), formErrors.projectID)}

                  <div className="form-row">
                    {selectField('studentID', 'Student', formData.studentID, (e) => setFormData({ ...formData, studentID: e.target.value }), students.map((s) => ({ value: String(s.userId), label: `${s.fullName} (${s.userCode || s.email})` })), formErrors.studentID)}
                    {selectField('facultyID', 'Faculty Guide', formData.facultyID, (e) => setFormData({ ...formData, facultyID: e.target.value }), faculty.map((f) => ({ value: String(f.userId), label: f.fullName })), formErrors.facultyID)}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="projectStartDate">Start Date</label>
                      <input type="date" id="projectStartDate" className="form-control" value={formData.projectStartDate} onChange={(e) => setFormData({ ...formData, projectStartDate: e.target.value })} />
                      {formErrors.projectStartDate && <span className="error-text">{formErrors.projectStartDate}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="projectEndDate">End Date</label>
                      <input type="date" id="projectEndDate" className="form-control" value={formData.projectEndDate} onChange={(e) => setFormData({ ...formData, projectEndDate: e.target.value })} />
                      {formErrors.projectEndDate && <span className="error-text">{formErrors.projectEndDate}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="totalTasksGiven">Total Tasks Given</label>
                      <input type="number" id="totalTasksGiven" className="form-control" min="0" value={formData.totalTasksGiven} onChange={(e) => setFormData({ ...formData, totalTasksGiven: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="totalCompletedTasks">Completed Tasks</label>
                      <input type="number" id="totalCompletedTasks" className="form-control" min="0" value={formData.totalCompletedTasks} onChange={(e) => setFormData({ ...formData, totalCompletedTasks: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="progressPercentage">Progress (%)</label>
                      <input type="number" id="progressPercentage" className="form-control" min="0" max="100" value={formData.progressPercentage} onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })} />
                      {formErrors.progressPercentage && <span className="error-text">{formErrors.progressPercentage}</span>}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="overAllGrade">Overall Grade (A / B / C)</label>
                    <select id="overAllGrade" className="form-control" value={formData.overAllGrade} onChange={(e) => setFormData({ ...formData, overAllGrade: e.target.value })}>
                      <option value="">Not graded</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                    {formErrors.overAllGrade && <span className="error-text">{formErrors.overAllGrade}</span>}
                  </div>

                  {formErrors.submit && <p className="error-text" role="alert" style={{ marginTop: '12px' }}>{formErrors.submit}</p>}
                </div>

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
                  <button type="button" onClick={closeModal} style={{ padding: '8px 16px', border: '1px solid var(--border)', backgroundColor: 'white', borderRadius: '8px', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                    {isSubmitting ? 'Saving…' : 'Save Allocation'}
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

export default AllocationManagerPage;
