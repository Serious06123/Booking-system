import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/signin'
    }
    return Promise.reject(err)
  }
)

// ─── Customer Service ─────────────────────────────────────────────────────────
export const customerApi = {
  register: (data) => api.post('/api/customers/register', data),
  login: (data)    => api.post('/api/customers/login', data),
  validate: ()     => api.get('/api/customers/validate'),
}

// ─── Room Service ─────────────────────────────────────────────────────────────
export const roomApi = {
  getAll:   ()   => api.get('/api/rooms'),
  getById:  (id) => api.get(`/api/rooms/${id}`),
}

// ─── Booking Service ──────────────────────────────────────────────────────────
export const bookingApi = {
  create:        (roomId) => api.post('/api/bookings', { roomId }),
  getMyBookings: ()       => api.get('/api/bookings/my'),
}

// ─── Admin Service ────────────────────────────────────────────────────────────
export const adminApi = {
  // Customers
  getAllCustomers:     ()           => api.get('/api/admin/customers'),
  getCustomerById:    (id)         => api.get(`/api/admin/customers/${id}`),
  updateCustomerStatus:(id,active) => api.put(`/api/admin/customers/${id}/status`, { active }),

  // Rooms
  getAllRooms:    ()         => api.get('/api/rooms'),
  updateRoomStatus:(id,status)=> api.put(`/api/admin/rooms/${id}/status`, { status }),
  createRoom:    (data)     => api.post('/api/admin/rooms', data),
  deleteRoom:    (id)       => api.delete(`/api/admin/rooms/${id}`),

  // Bookings
  getAllBookings: ()   => api.get('/api/admin/bookings'),
  deleteBooking:  (id) => api.delete(`/api/admin/bookings/${id}`),
}

export default api
