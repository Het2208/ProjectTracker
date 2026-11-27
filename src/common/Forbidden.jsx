import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../services/auth';

const Forbidden = () => {
  const { role } = useAuth();
  const homePath = role ? dashboardPathForRole(role) : '/';

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--danger, #ef4444)' }}>403</div>
        <h2 className="auth-title">Access Denied</h2>
        <p className="auth-subtitle" style={{ marginBottom: '20px' }}>
          You do not have permission to view this page. If you believe this is a mistake, contact your administrator.
        </p>
        <Link to={homePath} className="btn-primary" style={{ width: 'auto', display: 'inline-block', textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
