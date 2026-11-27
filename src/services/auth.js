const AUTH_STORAGE_KEY = 'projectTrackerAuth';

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window.atob(normalizedPayload)
        .split('')
        .map((character) => `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRole(payload) {
  return payload?.role
    ?? payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    ?? payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']
    ?? null;
}

export function getAuth() {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) return null;
    const auth = JSON.parse(storedAuth);
    const payload = decodeToken(auth.token);
    if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
      clearAuth();
      return null;
    }
    return {
      ...auth,
      role: getRole(payload),
      email: payload.sub ?? auth.email ?? null,
      userId: auth.userId ?? null,
      fullName: auth.fullName ?? null,
    };
  } catch {
    clearAuth();
    return null;
  }
}

/**
 * Persist auth after a successful login.
 * @param {string} token  - JWT from the backend
 * @param {object} [userRecord] - optional { userId, fullName } looked up post-login
 */
export function saveAuth(token, userRecord = null) {
  const payload = decodeToken(token);
  const role = getRole(payload);
  if (!payload || !role) throw new Error('The login response did not contain a valid role token.');
  const auth = {
    token,
    role,
    email: payload.sub ?? null,
    userId: userRecord?.userId ?? null,
    fullName: userRecord?.fullName ?? null,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  return auth;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function dashboardPathForRole(role) {
  const normalizedRole = String(role).toLowerCase();
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'faculty') return '/faculty/dashboard';
  if (normalizedRole === 'student') return '/student/dashboard';
  return '/';
}
