import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getApiErrorMessage } from '../services/apiClient';
import { userTypeService } from '../services/userTypeService';

const emptyForm = { userTypeName: '', description: '' };

const ManageUserTypes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypes, setUserTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Add');
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const loadUserTypes = async () => {
    setIsLoading(true); setPageError('');
    try {
      const response = await userTypeService.getAll();
      if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load user types.');
      setUserTypes(response.data);
    } catch (error) { setPageError(error.message || getApiErrorMessage(error, 'Unable to load user types.')); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void Promise.resolve().then(loadUserTypes); }, []);

  const filteredUserTypes = userTypes.filter((userType) => [userType.userTypeName, userType.description].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase())));
  const closeModal = () => { setIsModalOpen(false); setSelectedUserType(null); setFormErrors({}); };

  const openModal = async (type, userType = null) => {
    setMessage(''); setFormErrors({}); setModalType(type); setIsModalOpen(true);
    if (!userType) { setSelectedUserType(null); setFormData(emptyForm); return; }
    setIsDetailsLoading(true);
    try {
      const response = await userTypeService.getById(userType.userTypeID);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Unable to load user type.');
      setSelectedUserType(response.data);
      setFormData({ userTypeName: response.data.userTypeName, description: response.data.description ?? '' });
    } catch (error) { closeModal(); setPageError(error.message || getApiErrorMessage(error, 'Unable to load user type.')); }
    finally { setIsDetailsLoading(false); }
  };

  const validate = () => {
    const errors = {}; const name = formData.userTypeName.trim(); const description = formData.description.trim();
    if (!name) errors.userTypeName = 'User type name is required.';
    else if (name.length > 50) errors.userTypeName = 'User type name cannot exceed 50 characters.';
    if (description.length > 250) errors.description = 'Description cannot exceed 250 characters.';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    const payload = { userTypeName: formData.userTypeName.trim(), description: formData.description.trim() };
    try {
      const response = modalType === 'Add' ? await userTypeService.add(payload) : await userTypeService.update(selectedUserType.userTypeID, payload);
      if (!response?.success) throw new Error(response?.message || 'Unable to save user type.');
      setMessage(response.message); closeModal(); await loadUserTypes();
    } catch (error) { setFormErrors({ submit: error.message || getApiErrorMessage(error, 'Unable to save user type.') }); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user type?')) return;
    setMessage('');
    try {
      const response = await userTypeService.remove(id);
      if (!response?.success) throw new Error(response?.message || 'Unable to delete user type.');
      setMessage(response.message); await loadUserTypes();
    } catch (error) { setPageError(error.message || getApiErrorMessage(error, 'Unable to delete user type.')); }
  };

  return <AdminLayout>
    <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><h1>Manage User Types</h1><div className="breadcrumbs"><Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span>User Types</span></div></div>
      <button className="btn-primary" style={{ width: 'auto' }} onClick={() => openModal('Add')}>Add User Type</button>
    </div>
    {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}{pageError && <p className="error-text" role="alert">{pageError}</p>}
    <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}><input type="search" className="form-control" placeholder="Search user types..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
    <div className="data-table-container"><div className="data-table-header"><span className="table-title">System User Types</span></div><div className="table-responsive"><table className="dashboard-table"><thead><tr><th>Type ID</th><th>User Type Name</th><th>Description</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead><tbody>
      {isLoading ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>Loading user types…</td></tr> : filteredUserTypes.length ? filteredUserTypes.map((userType) => <tr key={userType.userTypeID}><td>#{userType.userTypeID}</td><td>{userType.userTypeName}</td><td>{userType.description || '—'}</td><td style={{ textAlign: 'center' }}><button onClick={() => openModal('Details', userType)}>View</button>{' '}<button onClick={() => openModal('Edit', userType)}>Edit</button>{' '}<button onClick={() => handleDelete(userType.userTypeID)}>Delete</button></td></tr>) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No user types found.</td></tr>}
    </tbody></table></div></div>
    {isModalOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, .6)', display: 'grid', placeItems: 'center', zIndex: 9999 }}><div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '95%', maxWidth: '500px', padding: '24px' }}><h3>{modalType === 'Details' ? 'User Type Details' : `${modalType} User Type`}</h3>
      {isDetailsLoading ? <p>Loading details…</p> : modalType === 'Details' ? <><p><strong>Type ID:</strong> #{selectedUserType?.userTypeID}</p><p><strong>Name:</strong> {selectedUserType?.userTypeName}</p><p><strong>Description:</strong> {selectedUserType?.description || '—'}</p><button className="btn-primary" style={{ width: 'auto' }} onClick={closeModal}>Close</button></> : <form onSubmit={handleSubmit} noValidate><div className="form-group"><label className="form-label" htmlFor="userTypeName">User Type Name</label><input id="userTypeName" className="form-control" maxLength="50" value={formData.userTypeName} onChange={(event) => setFormData({ ...formData, userTypeName: event.target.value })} />{formErrors.userTypeName && <span className="error-text">{formErrors.userTypeName}</span>}</div><div className="form-group"><label className="form-label" htmlFor="description">Description</label><textarea id="description" className="form-control" rows="4" maxLength="250" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />{formErrors.description && <span className="error-text">{formErrors.description}</span>}</div>{formErrors.submit && <p className="error-text">{formErrors.submit}</p>}<button type="button" onClick={closeModal}>Cancel</button>{' '}<button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save User Type'}</button></form>}
    </div></div>}
  </AdminLayout>;
};

export default ManageUserTypes;
