import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableState from './TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { projectMasterService } from '../services/projectMasterService';

const emptyForm = { projectTitle: '', description: '' };

/**
 * Project Master list shared by Admin (/admin/projects, full CRUD — backend
 * restricts Add/Update/Delete to Admin) and Faculty (/faculty/projects, read-only).
 */
const ProjectMasterPage = ({ layout, title, breadcrumb, tableTitle, canManage = false }) => {
  const { pageWrapper: PageWrapper, homePath } = layout;
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await projectMasterService.getAll();
      if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load projects.');
      setProjects(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load projects.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const filteredProjects = useMemo(() => projects.filter((project) =>
    [project.projectTitle, project.description].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [projects, searchQuery]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setFormErrors({});
  };

  const openModal = async (type, project = null) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    if (!project) {
      setSelectedProject(null);
      setFormData(emptyForm);
      return;
    }
    setIsDetailsLoading(true);
    try {
      const response = await projectMasterService.getById(project.projectId);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load project details.');
      setSelectedProject(response.data);
      setFormData({ projectTitle: response.data.projectTitle || '', description: response.data.description || '' });
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load project details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.projectTitle.trim()) errors.projectTitle = 'Project title is required.';
    else if (formData.projectTitle.trim().length > 200) errors.projectTitle = 'Project title cannot exceed 200 characters.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      const payload = { projectTitle: formData.projectTitle.trim(), description: formData.description.trim() || null };
      const response = selectedProject
        ? await projectMasterService.update(selectedProject.projectId, payload)
        : await projectMasterService.add(payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save project.');
      setMessage(response.message);
      closeModal();
      await loadProjects();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save project.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setMessage('');
    try {
      const response = await projectMasterService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete project.');
      setMessage(response.message);
      await loadProjects();
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to delete project.'));
    }
  };

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
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => openModal('Add')}>Add Project</button>
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
            placeholder="Search projects..."
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
                <th>Project Title</th>
                <th>Description</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={4} loading={isLoading} error={pageError} count={filteredProjects.length} emptyText={`No projects found matching "${searchQuery}"`} onRetry={loadProjects} />
              {!isLoading && !pageError && filteredProjects.map((project) => (
                <tr key={project.projectId}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{project.projectId}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{project.projectTitle}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{project.description || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openModal('Details', project)} style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>View</button>
                      {canManage && <button onClick={() => openModal('Edit', project)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>}
                      {canManage && <button onClick={() => handleDelete(project.projectId)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>}
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
          inset: 0,
          background: 'rgba(15, 23, 42, .6)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '95%', maxWidth: '500px', padding: '24px' }}>
            <h3>{modalType === 'Details' ? 'Project Details' : `${modalType} Project`}</h3>
            {isDetailsLoading ? (
              <p>Loading details…</p>
            ) : modalType === 'Details' ? (
              <>
                <p><strong>Project ID:</strong> #{selectedProject?.projectId}</p>
                <p><strong>Title:</strong> {selectedProject?.projectTitle}</p>
                <p><strong>Description:</strong> {selectedProject?.description || '—'}</p>
                <button className="btn-primary" style={{ width: 'auto' }} onClick={closeModal}>Close</button>
              </>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="projectTitle">Project Title</label>
                  <input id="projectTitle" className="form-control" maxLength={200} value={formData.projectTitle} onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })} />
                  {formErrors.projectTitle && <span className="error-text">{formErrors.projectTitle}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea id="description" className="form-control" rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                {formErrors.submit && <p className="error-text" role="alert">{formErrors.submit}</p>}
                <button type="button" onClick={closeModal}>Cancel</button>{' '}
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Project'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ProjectMasterPage;
