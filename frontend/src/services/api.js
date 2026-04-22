import axios from 'axios';

function normalizeBaseUrl(raw) {
  if (!raw) return '';
  const s = String(raw).trim().replace(/\/+$/, '');
  // If user provides host only (e.g. http://localhost:5000), ensure /api suffix
  if (!/\/api$/i.test(s)) return `${s}/api`;
  return s;
}

const api = axios.create({
  baseURL:
    normalizeBaseUrl(import.meta.env.VITE_API_URL) || 'https://mediatesting.onrender.com/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
