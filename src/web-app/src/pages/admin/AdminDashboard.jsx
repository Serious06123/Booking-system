import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../services/api'
import '../../components/admin/AdminLayout.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, rooms: 0, available: 0, booked: 0, bookings: 0 })
  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    Promise.allSettled([
      adminApi.getAllCustomers(),
      adminApi.getAllRooms(),
      adminApi.getAllBookings(),
    ]).then(([cRes, rRes, bRes]) => {
      const customers = cRes.status === 'fulfilled' ? (cRes.value.data || []) : []
      const rooms     = rRes.status === 'fulfilled' ? (rRes.value.data || []) : []
      const bookings  = bRes.status === 'fulfilled' ? (bRes.value.data || []) : []
      setStats({
        customers: customers.length,
        rooms: rooms.length,
        available: rooms.filter(r => r.status === 'AVAILABLE').length,
        booked: rooms.filter(r => r.status === 'BOOKED').length,
        bookings: bookings.length,
      })
      setRecentBookings(bookings.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : '—'

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin Portal</p>
          <h1 className="admin-page-title">Tổng quan hệ thống</h1>
          <p className="admin-page-subtitle">Toàn cảnh hoạt động khách sạn LuxStay</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner"></div><p>Đang tải...</p></div>
      ) : (
        <>
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <span className="admin-stat-label">Tổng khách hàng</span>
              <span className="admin-stat-value gold">{stats.customers}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Tổng phòng</span>
              <span className="admin-stat-value">{stats.rooms}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Phòng trống</span>
              <span className="admin-stat-value green">{stats.available}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Phòng đã đặt</span>
              <span className="admin-stat-value red">{stats.booked}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Tổng đặt phòng</span>
              <span className="admin-stat-value">{stats.bookings}</span>
            </div>
          </div>

          <div className="admin-table-wrap">
            <div className="admin-table-toolbar">
              <div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--white-dim)', fontWeight: 500 }}>Đặt phòng gần đây</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>5 giao dịch mới nhất</p>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đặt phòng</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Giá / đêm</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan="6" className="admin-table-empty">Chưa có dữ liệu đặt phòng</td></tr>
                ) : recentBookings.map((b, i) => (
                  <tr key={b.bookingId || b.id || i}>
                    <td style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>
                      #{String(b.bookingId || b.id || i + 1).padStart(4, '0')}
                    </td>
                    <td>{b.customer?.fullName || b.customerName || '—'}</td>
                    <td>{b.room?.name || `Phòng ${b.roomId}`}</td>
                    <td>{formatPrice(b.room?.price)}</td>
                    <td>{formatDate(b.bookedAt)}</td>
                    <td><span className="badge badge-confirmed">✓ Xác nhận</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
