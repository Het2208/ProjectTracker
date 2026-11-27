import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuth, getAuth } from '../services/auth';

const UNAUTHORIZED_EVENT = 'project-tracker:unauthorized';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // localStorage-backed state: survives refresh while the JWT is unexpired.
  const [auth, setAuth] = useState(() => getAuth());

  // A 401 from the API (expired/invalid token) clears the session app-wide.
  useEffect(() => {
    const handleUnauthorized = () => setAuth(null);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback((nextAuth) => setAuth(nextAuth), []);
  const logout = useCallback(() => {
    clearAuth();
    setAuth(null);
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(auth?.token),
    token: auth?.token ?? null,
    email: auth?.email ?? null,
    role: auth?.role ?? null,
    userId: auth?.userId ?? null,
    fullName: auth?.fullName ?? null,
    user: auth ? { email: auth.email, role: auth.role, userId: auth.userId, fullName: auth.fullName } : null,
    login,
    logout,
  }), [auth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
