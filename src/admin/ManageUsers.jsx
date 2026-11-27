import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import TableState from '../common/TableState';
import { getApiErrorMessage } from '../services/apiClient';
import { userService } from '../services/userService';
import { userTypeService } from '../services/userTypeService';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  mobileNumber: '',
  userTypeId: '',
  userCode: '',
  profilePicturePath: null,
  isActive: true,
};

// Reused for the generic Users page and the Students/Faculty pages
// (fixedUserTypeName filters the list and locks the type on the form).
const AdminManageUsers = ({ fixedUserTypeName = null, title = 'Manage Users', breadcrumb = 'Users', addLabel = 'Add User' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const [usersResponse, userTypesResponse] = await Promise.all([
        userService.getAll(),
        userTypeService.getAll(),
      ]);
      if (!usersResponse?.success || !Array.isArray(usersResponse.data)) throw new Error(usersResponse?.message || 'Unable to load users.');
      if (!userTypesResponse?.success || !Array.isArray(userTypesResponse.data)) throw new Error(userTypesResponse?.message || 'Unable to load user types.');
      setUsers(usersResponse.data);
      // Backend property is UserTypeID; normalize for the select options.
      setUserTypes(userTypesResponse.data.map((ut) => ({ ...ut, userTypeId: ut.userTypeId ?? ut.userTypeID })));
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load users.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredUsers = users
    .filter((user) => !fixedUserTypeName || user.userTypeName === fixedUserTypeName)
    .filter((user) =>
      [user.fullName, user.email, user.userTypeName].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.mobileNumber?.includes(searchQuery),
    );

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormErrors({});
  };

  const openModal = async (type, user = null) => {
    setMessage('');
    setFormErrors({});
    setModalType(type);
    setIsModalOpen(true);
    if (!user) {
      setSelectedUser(null);
      const defaultType = fixedUserTypeName
        ? userTypes.find((ut) => ut.userTypeName === fixedUserTypeName)
        : null;
      setFormData({ ...emptyForm, userTypeId: defaultType ? String(defaultType.userTypeId) : '' });
      return;
    }
    setIsDetailsLoading(true);
    try {
      const response = await userService.getById(user.userId);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load user details.');
      setSelectedUser(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        password: '',
        mobileNumber: response.data.mobileNumber || '',
        userTypeId: String(response.data.userTypeId ?? ''),
        userCode: response.data.userCode || '',
        profilePicturePath: null,
        isActive: response.data.isActive,
      });
    } catch (error) {
      closeModal();
      setPageError(getApiErrorMessage(error, 'Unable to load user details.'));
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    if (modalType === 'Add' && !formData.password) errors.password = 'Password is required.';
    if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required.';
    if (!fixedUserTypeName && !formData.userTypeId) errors.userTypeId = 'User type is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    const dto = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      userTypeId: Number(formData.userTypeId),
      userCode: formData.userCode.trim(),
      profilePicturePath: formData.profilePicturePath,
      isActive: formData.isActive,
    };
    if (fixedUserTypeName) {
      const fixedType = userTypes.find((ut) => ut.userTypeName === fixedUserTypeName);
      if (fixedType) dto.userTypeId = fixedType.userTypeId;
    }
    try {
      const response = modalType === 'Add'
        ? await userService.add(dto)
        : await userService.update(selectedUser.userId, { ...dto, userId: selectedUser.userId, isDeleted: selectedUser.isDeleted ?? false });
      if (!response?.success) throw new Error(response?.message || 'Unable to save user.');
      setMessage(response.message);
      closeModal();
      await loadData();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save user.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setMessage('');
    try {
      const response = await userService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete user.');
      setMessage(response.message);
      await loadData();
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to delete user.'));
    }
  };

  return (
    <AdminLayout>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{title}</h1>
          <div className="breadcrumbs">
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> /{' '}
            <span>{breadcrumb}</span>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => openModal('Add')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {addLabel}
        </button>
      </div>

      {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {/* Filter and Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 14px', maxWidth: '380px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <div className="data-table-header">
          <span className="table-title">{fixedUserTypeName ? `${fixedUserTypeName} Accounts` : 'System User Accounts'}</span>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>System Role</th>
                <th>Status</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableState colSpan={7} loading={isLoading} error={pageError} count={filteredUsers.length} emptyText={`No users found matching "${searchQuery}"`} onRetry={loadData} />
              {!isLoading && !pageError && filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{user.userId}</span></td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.fullName}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.mobileNumber}</td>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.userTypeName}</span></td>
                  <td>
                    <span className={`badge ${user.isActive ? 'completed' : 'rejected'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openModal('Edit', user)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
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
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {modalType} User
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            {isDetailsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading details…</div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ padding: '24px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      className="form-control"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="userCode">User Code</label>
                      <input type="text" id="userCode" className="form-control" maxLength="100" value={formData.userCode} onChange={(e) => setFormData({ ...formData, userCode: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="name@darshan.ac.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder={modalType === 'Add' ? 'Password' : 'Leave blank to keep unchanged'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profilePicture">Profile Picture</label>
                    <input type="file" id="profilePicture" className="form-control" accept="image/*" onChange={(e) => setFormData({ ...formData, profilePicturePath: e.target.files?.[0] || null })} />
                    {selectedUser?.profilePicturePath && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current file: {selectedUser.profilePicturePath}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="mobileNumber">Mobile Number</label>
                      <input
                        type="tel"
                        id="mobileNumber"
                        className="form-control"
                        placeholder="e.g. 9876543210"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      />
                      {formErrors.mobileNumber && <span className="error-text">{formErrors.mobileNumber}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="userTypeId">User Type</label>
                      <select
                        id="userTypeId"
                        className="form-control"
                        value={formData.userTypeId}
                        onChange={(e) => setFormData({ ...formData, userTypeId: e.target.value })}
                        disabled={Boolean(fixedUserTypeName)}
                      >
                        <option value="">Select User Type</option>
                        {userTypes.map((ut) => (
                          <option key={ut.userTypeId} value={ut.userTypeId}>
                            {ut.userTypeName}
                          </option>
                        ))}
                      </select>
                      {formErrors.userTypeId && <span className="error-text">{formErrors.userTypeId}</span>}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="isActive">User Account Status</label>
                    <select
                      id="isActive"
                      className="form-control"
                      value={String(formData.isActive)}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  {formErrors.submit && <p className="error-text" role="alert" style={{ marginTop: '12px' }}>{formErrors.submit}</p>}
                </div>

                {/* Modal Footer */}
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
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--primary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {isSubmitting ? 'Saving…' : 'Save User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManageUsers;
