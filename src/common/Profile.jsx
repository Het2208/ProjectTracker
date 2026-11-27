import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { userService } from '../services/userService';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  : 'https://localhost:7264';

/**
 * Shared profile page used by Admin, Faculty, and Student.
 * Props:
 *   layout      – { pageWrapper: Component, homePath: string }
 *   roleLabel   – display string e.g. "Admin", "Faculty", "Student"
 */
const Profile = ({ layout, roleLabel }) => {
  const { pageWrapper: PageWrapper, homePath } = layout;
  const { userId, email, fullName: authFullName } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    userCode: '',
    profilePicturePath: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUser = useCallback(async () => {
    if (!userId) {
      // userId not available (Student/Faculty can't call User/GetAll at login time).
      // Show what we know from the JWT token.
      setUser({ email, fullName: authFullName });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setPageError('');
    try {
      const response = await userService.getById(userId);
      if (!response?.success || !response.data)
        throw new Error(response?.message || 'Unable to load profile.');
      setUser(response.data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to load profile.'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, email, authFullName]);

  useEffect(() => { void loadUser(); }, [loadUser]);

  const startEdit = () => {
    if (!user) return;
    setFormData({
      fullName: user.fullName || '',
      mobileNumber: user.mobileNumber || '',
      userCode: user.userCode || '',
      profilePicturePath: null,
    });
    setFormErrors({});
    setMessage('');
    setIsEditing(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting || !userId) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      const dto = {
        userId,
        userTypeId: user.userTypeId,
        fullName: formData.fullName.trim(),
        userCode: formData.userCode.trim(),
        email: user.email,
        password: '',
        mobileNumber: formData.mobileNumber.trim(),
        profilePicturePath: formData.profilePicturePath,
        isActive: user.isActive,
        isDeleted: user.isDeleted ?? false,
      };
      const response = await userService.update(userId, dto);
      if (!response?.success) throw new Error(response?.message || 'Unable to save profile.');
      setMessage('Profile updated successfully.');
      setIsEditing(false);
      await loadUser();
    } catch (error) {
      setFormErrors({ submit: getApiErrorMessage(error, 'Unable to save profile.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Profile</h1>
          <div className="breadcrumbs">
            <Link to={homePath} style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>{' '}
            / <span>Profile</span>
          </div>
        </div>
        {userId && !isEditing && !isLoading && user && (
          <button
            className="btn-primary"
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={startEdit}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {message && <p role="status" style={{ color: '#15803d', marginBottom: '12px' }}>{message}</p>}
      {pageError && <p className="error-text" role="alert">{pageError}</p>}

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile…</div>
      ) : isEditing ? (
        <div className="card" style={{ padding: '28px', maxWidth: '560px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Edit Profile</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input id="fullName" className="form-control" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="userCode">User Code</label>
              <input id="userCode" className="form-control" value={formData.userCode} onChange={(e) => setFormData({ ...formData, userCode: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">Mobile Number</label>
              <input id="mobileNumber" className="form-control" type="tel" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
              {formErrors.mobileNumber && <span className="error-text">{formErrors.mobileNumber}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="profilePic">Profile Picture (optional)</label>
              <input id="profilePic" className="form-control" type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, profilePicturePath: e.target.files?.[0] || null })} />
              {user?.profilePicturePath && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current: {user.profilePicturePath}</span>}
            </div>
            {formErrors.submit && <p className="error-text" role="alert">{formErrors.submit}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', border: '1px solid var(--border)', backgroundColor: 'white', borderRadius: '8px', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }} disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
          {/* Avatar card */}
          <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
            {user?.profilePicturePath ? (
              <img
                src={`${BACKEND_BASE}/${user.profilePicturePath}`}
                alt={user.fullName}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '3px solid var(--primary)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid var(--primary)' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.fullName || authFullName || email}</div>
            <span className={`badge ${roleLabel === 'Admin' ? 'rejected' : roleLabel === 'Faculty' ? 'progress' : 'completed'}`} style={{ marginTop: '8px', display: 'inline-block' }}>{roleLabel}</span>
            {user?.isActive !== undefined && (
              <div style={{ marginTop: '8px' }}>
                <span className={`badge ${user.isActive ? 'completed' : 'rejected'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            )}
          </div>

          {/* Details card */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              Account Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{user?.fullName || authFullName || '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{user?.email || email || '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Number</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{user?.mobileNumber || '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Code</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{user?.userCode || '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Type</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{user?.userTypeName || roleLabel}</div>
              </div>
              {userId && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User ID</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>#{userId}</div>
                </div>
              )}
            </div>
            {!userId && (
              <p style={{ marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                Profile editing is available after the next login session once user record lookup is completed.
              </p>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Profile;
