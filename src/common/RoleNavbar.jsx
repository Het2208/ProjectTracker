import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Shared top bar for the Admin / Faculty / Student layouts. Shows the signed-in
 * identity from AuthContext; clicking the badge signs the user out.
 */
const RoleNavbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { email, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = (email ?? role ?? 'U')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="header-right">
        {/* Notification Icon */}
        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
        </div>

        {/* Profile badge */}
        <div className="user-profile-badge" onClick={handleLogout} title="Click to Sign Out" style={{ cursor: 'pointer' }}>
          <div className="avatar-circle">{initials || 'U'}</div>
          <div className="user-profile-info">
            <span className="user-profile-name">{email ?? role}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RoleNavbar;
