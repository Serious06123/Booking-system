import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

// User pages
import Home        from './pages/Home'
import SignIn      from './pages/SignIn'
import SignUp      from './pages/SignUp'
import MyBookings  from './pages/MyBookings'

// Admin pages
import AdminLogin     from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBookings  from './pages/admin/AdminBookings'
import AdminRooms     from './pages/admin/AdminRooms'
import AdminCustomers from './pages/admin/AdminCustomers'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/signin" replace />
  return children
}

function AdminRoute({ children }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />
  return children
}

function UserLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      {/* ── Public / User routes ── */}
      <Route path="/" element={<UserLayout><Home /></UserLayout>} />
      <Route path="/signin" element={<UserLayout><SignIn /></UserLayout>} />
      <Route path="/signup" element={<UserLayout><SignUp /></UserLayout>} />
      <Route path="/my-bookings" element={
        <UserLayout>
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        </UserLayout>
      } />

      {/* ── Admin routes ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
      <Route path="/admin/rooms"    element={<AdminRoute><AdminRooms /></AdminRoute>} />
      <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
