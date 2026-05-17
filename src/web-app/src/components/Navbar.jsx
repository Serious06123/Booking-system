import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">✦</span>
          <span className="logo-text">LuxStay</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Phòng Nghỉ
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/my-bookings"
                className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}
              >
                Đặt Phòng Của Tôi
              </Link>
              <div className="nav-user">
                <span className="user-greeting">
                  Xin chào, <strong>{user?.fullName?.split(' ').pop()}</strong>
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Đăng Xuất
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/signin" className="btn btn-ghost btn-sm">Đăng Nhập</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Đăng Ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
