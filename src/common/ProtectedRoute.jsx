import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from './Forbidden';

/**
 * Route guard: unauthenticated users are sent to login; authenticated users
 * without one of `allowedRoles` see the 403 Forbidden page.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Forbidden />;
  }
  return children;
};

export default ProtectedRoute;
