import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './MyBookings.css'

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    bookingApi.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(err => {
        if (err.response?.status === 404) setBookings([])
        else setError('Không thể tải lịch sử đặt phòng.')
      })
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatPrice = (price) =>
    price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : '—'

  return (
    <div className="mybookings-page">
      <div className="container">
        {/* Header */}
        <div className="mybookings-header">
          <div>
            <p className="mybookings-eyebrow">Tài khoản của tôi</p>
            <h1 className="mybookings-title">Lịch Sử Đặt Phòng</h1>
            <p className="mybookings-subtitle">
              Xin chào, <strong>{user?.fullName}</strong>. Dưới đây là danh sách các phòng bạn đã đặt.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            + Đặt Thêm Phòng
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="page-loader">
            <div className="spinner" style={{ width: 32, height: 32 }}></div>
            <p>Đang tải lịch sử...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="bookings-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <h3>Chưa có đặt phòng nào</h3>
            <p>Khám phá bộ sưu tập phòng nghỉ của chúng tôi và đặt ngay hôm nay.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Xem Danh Sách Phòng
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {/* Summary */}
            <div className="bookings-summary">
              <span>{bookings.length} đặt phòng</span>
            </div>

            {bookings.map((booking, index) => (
              <div
                key={booking.bookingId || booking.id || index}
                className="booking-item"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Room info */}
                <div className="booking-room">
                  <div className="booking-room-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7v10M3 12h18M21 7v10M7 12v-2a2 2 0 012-2h6a2 2 0 012 2v2"/>
                      <rect x="2" y="6" width="20" height="12" rx="1"/>
                    </svg>
                  </div>
                  <div className="booking-room-details">
                    <h3 className="booking-room-name">
                      {booking.room?.name || `Phòng ${booking.roomId}`}
                    </h3>
                    <p className="booking-room-number">
                      Mã phòng: {booking.room?.roomNumber || booking.roomId}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="booking-meta">
                  <div className="booking-meta-item">
                    <span className="booking-meta-label">Giá / đêm</span>
                    <span className="booking-meta-value text-gold">
                      {formatPrice(booking.room?.price)}
                    </span>
                  </div>
                  <div className="booking-meta-item">
                    <span className="booking-meta-label">Ngày đặt</span>
                    <span className="booking-meta-value">{formatDate(booking.bookedAt)}</span>
                  </div>
                  <div className="booking-meta-item">
                    <span className="booking-meta-label">Trạng thái</span>
                    <span className="booking-status-badge">✓ Đã xác nhận</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
