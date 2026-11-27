import axios from 'axios';
import { clearAuth, getAuth } from './auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7264/api',
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuth()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    // A 401 from the login endpoint itself means bad credentials, not an
    // expired session — only real session losses clear the stored auth.
    if (status === 401 && !url.toLowerCase().includes('/user/login')) {
      clearAuth();
      window.dispatchEvent(new Event('project-tracker:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(' ');
  if (typeof data?.message === 'string') return data.message;
  if (typeof data === 'string') return data;
  if (error.response?.status === 403) return 'You do not have permission to perform this action.';
  if (!error.response) return 'The API is unavailable. Check that the backend is running.';
  return fallback;
}

export default apiClient;
