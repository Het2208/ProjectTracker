import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import TableState from '../common/TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { userRoleService } from '../services/userRoleService';
import { roleService } from '../services/roleService';
import { userService } from '../services/userService';

const emptyForm = { roleId: '', userId: '' };

/**
 * User ↔ Role link management. Consumes UserRoleController CRUD
 * (RolePermissionId is the primary key) plus Role/User lists for dropdowns.
 */
const ManageUserRoles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUserRoles = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [userRolesResponse, rolesResponse, usersResponse] = await Promise.all([
        userRoleService.getAll(),
        roleService.getAll(),
        userService.getAll(),
      ]);
      if (!userRolesResponse?.success || !Array.isArray(userRolesResponse.data)) throw new Error(userRolesResponse?.message || 'Unable to load user roles.');
      setUserRoles(userRolesResponse.data);
      if (rolesResponse?.success) setRolesList(rolesResponse.data ?? []);
      if (usersResponse?.success) setUsersList(usersResponse.data ?? []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load user roles.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadUserRoles(); }, [loadUserRoles]);

  const filteredUserRoles = useMemo(() => userRoles.filter((userRole) =>
    [userRole.fullName, userRole.roleName].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())),
  ), [userRoles, searchQuery]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserRole(null);
    setFormErrors({});
  };

  const openModal = async (type, userRole = null) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    if (!userRole) {
      setSelectedUserRole(null);
      setFormData(emptyForm);
      return;
    }
    setIsDetailsLoading(true);
    try {
      const response = await userRoleService.getById(userRole.rolePermissionId);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load user role details.');
      setSelectedUserRole(response.data);
      setFormData({ roleId: String(response.data.roleId ?? ''), userId: String(response.data.userId ?? '') });
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load user role details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.roleId) errors.roleId = 'Role is required.';
    if (!formData.userId) errors.userId = 'User is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    const payload = { roleId: Number(formData.roleId), userId: Number(formData.userId) };
    try {
      const response = selectedUserRole
        ? await userRoleService.update(selectedUserRole.rolePermissionId, payload)
        : await userRoleService.add(payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save user role link.');
      setMessage(response.message);
      closeModal();
      await loadUserRoles();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save user role link.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user role link?')) return;
    setMessage('');
    try {
      const response = await userRoleService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete user role link.');
      setMessage(response.message);
      await loadUserRoles();
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to delete user role link.'));
    }
  };

  return (
    <AdminLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>User Roles Mapping</h1>
          <div className="breadcrumbs">
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>User Roles</span>
          </div>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => openModal('Add')}>Add Mapping</button>
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
            placeholder="Search mappings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">User Role Assignments (SPM_UserRole)</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>User</th>
                <th>Assigned Role</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={4} loading={isLoading} error={pageError} count={filteredUserRoles.length} emptyText={`No mappings found matching "${searchQuery}"`} onRetry={loadUserRoles} />
              {!isLoading && !pageError && filteredUserRoles.map((userRole) => (
                <tr key={userRole.rolePermissionId}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{userRole.rolePermissionId}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userRole.fullName || `User #${userRole.userId}`}</span></td>
                  <td>
                    <span className={`badge ${userRole.roleName === 'Admin' ? 'rejected' : userRole.roleName === 'Faculty' ? 'progress' : 'completed'}`}>
                      {userRole.roleName || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openModal('Details', userRole)} style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>View</button>
                      <button onClick={() => openModal('Edit', userRole)} style={{ padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(userRole.rolePermissionId)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, .6)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '95%', maxWidth: '480px', padding: '24px' }}>
            <h3>{modalType === 'Details' ? 'Mapping Details' : `${modalType} User Role Mapping`}</h3>
            {isDetailsLoading ? (
              <p>Loading details…</p>
            ) : modalType === 'Details' ? (
              <>
                <p><strong>Mapping ID:</strong> #{selectedUserRole?.rolePermissionId}</p>
                <p><strong>User:</strong> {selectedUserRole?.fullName || `User #${selectedUserRole?.userId}`}</p>
                <p><strong>Role:</strong> {selectedUserRole?.roleName || '—'}</p>
                <button className="btn-primary" style={{ width: 'auto' }} onClick={closeModal}>Close</button>
              </>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="userId">User</label>
                  <select id="userId" className="form-control" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })}>
                    <option value="">Select User...</option>
                    {usersList.map((user) => (
                      <option key={user.userId} value={user.userId}>{user.fullName} ({user.userTypeName})</option>
                    ))}
                  </select>
                  {formErrors.userId && <span className="error-text">{formErrors.userId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="roleId">Role</label>
                  <select id="roleId" className="form-control" value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
                    <option value="">Select Role...</option>
                    {rolesList.map((role) => (
                      <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                    ))}
                  </select>
                  {formErrors.roleId && <span className="error-text">{formErrors.roleId}</span>}
                </div>
                {formErrors.submit && <p className="error-text" role="alert">{formErrors.submit}</p>}
                <button type="button" onClick={closeModal}>Cancel</button>{' '}
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Mapping'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageUserRoles;
