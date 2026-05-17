import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookingApi } from '../services/api'
import './RoomCard.css'

export default function RoomCard({ room, onBooked }) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isAvailable = room.status === 'AVAILABLE'

  const handleBook = async () => {
    // Step 1: Check auth
    if (!isLoggedIn) {
      navigate('/signin', { state: { returnTo: '/', roomId: room.id } })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 2 & 3: API does final availability check + creates booking + updates room status
      await bookingApi.create(room.id)
      setSuccess(true)
      onBooked && onBooked(room.id)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Đặt phòng thất bại. Phòng có thể đã được đặt.'
      setError(typeof msg === 'string' ? msg : 'Đặt phòng thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  return (
    <div className={`room-card ${!isAvailable ? 'room-card--booked' : ''} ${success ? 'room-card--success' : ''}`}>
      {/* Status badge */}
      <div className={`room-status-badge ${isAvailable ? 'available' : 'booked'}`}>
        {isAvailable ? '● Còn trống' : '● Đã đặt'}
      </div>

      {/* Room visual */}
      <div className="room-visual">
        <div className="room-number-display">{room.roomNumber || room.id}</div>
        <div className="room-icon">
          {isAvailable ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7v10M3 12h18M21 7v10M7 12v-2a2 2 0 012-2h6a2 2 0 012 2v2"/>
              <rect x="2" y="6" width="20" height="12" rx="1"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M4.93 4.93l14.14 14.14"/>
            </svg>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="room-info">
        <h3 className="room-name">{room.name}</h3>
        <p className="room-price">{formatPrice(room.price)}<span>/đêm</span></p>

        {/* Messages */}
        {error && (
          <div className="alert alert-error" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            ✓ Đặt phòng thành công!
          </div>
        )}

        {/* CTA */}
        {!success && (
          <button
            className={`btn ${isAvailable ? 'btn-primary' : 'btn-ghost'} room-cta`}
            disabled={!isAvailable || loading}
            onClick={handleBook}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> Đang xử lý...</>
            ) : isAvailable ? (
              'Đặt Phòng Ngay'
            ) : (
              'Không Khả Dụng'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
