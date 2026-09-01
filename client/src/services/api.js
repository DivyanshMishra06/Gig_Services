import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('coopgig_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('coopgig_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Services
export const getServices = (params) => API.get('/services', { params });
export const getServiceById = (id) => API.get(`/services/${id}`);

// Workers
export const getWorkers = (params) => API.get('/workers', { params });
export const getWorkerById = (id, params) => API.get(`/workers/${id}`, { params });
export const updateWorker = (data) => API.put('/workers/update', data);
export const updateAvailability = (data) => API.put('/workers/availability', data);
export const getWorkerEarnings = () => API.get('/workers/earnings');
export const getWorkerWelfare = () => API.get('/workers/welfare');

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getBookings = (params) => API.get('/bookings', { params });
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}/status`, data);
export const getInvoice = (bookingId) => API.get(`/bookings/${bookingId}/invoice`);
export const payInvoice = (id, data) => API.put(`/bookings/invoice/${id}/pay`, data);

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getWorkerReviews = (workerId) => API.get(`/reviews/worker/${workerId}`);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminWorkers = (params) => API.get('/admin/workers', { params });
export const verifyWorker = (id, data) => API.put(`/admin/workers/${id}/verify`, data);
export const getAdminBookings = (params) => API.get('/admin/bookings', { params });
export const getCooperatives = () => API.get('/admin/cooperatives');
export const getDemandForecast = () => API.get('/admin/forecast');
export const getWorkforceAllocation = () => API.get('/admin/allocation');
export const getNotifications = () => API.get('/admin/notifications');
export const markNotificationRead = (id) => API.put(`/admin/notifications/${id}/read`);

export default API;
