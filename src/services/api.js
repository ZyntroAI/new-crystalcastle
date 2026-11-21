import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── เพิ่ม Token เข้า Header ทุกคำขอ ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── จัดการ Refresh Token อัตโนมัติ ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า Token หมดอายุ → ลองต่ออายุ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // เรียกซ้ำด้วย Token ใหม่
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  logoutAll: () => api.post('/api/auth/logout-all'),
  getMe: () => api.get('/api/auth/me'),
};

// ── Products API ──
export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.patch(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// ── System ──
export const systemAPI = {
  health: () => api.get('/api/health'),
};

export default api;
