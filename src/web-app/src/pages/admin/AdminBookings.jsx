import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../services/api'
import '../../components/admin/AdminLayout.css'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return <div className={`admin-toast admin-toast-${type}`}>{msg}</div>
}

function ConfirmModal({ booking, onConfirm, onCancel, loading }) {
  if (!booking) return null
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Xác nhận xoá</span>
          <button className="modal-close" onClick={onCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="confirm-icon confirm-icon-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <p className="confirm-text">
            Bạn chắc chắn muốn xoá đặt phòng <strong style={{ color: 'var(--gold)' }}>
              #{String(booking.bookingId || booking.id).padStart(4, '0')}
            </strong> của khách <strong>{booking.customer?.fullName || booking.customerName || '—'}</strong>?
            <br /><span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Thao tác này không thể hoàn tác.</span>
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Huỷ</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Đang xoá...</> : 'Xoá'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm]   = useState(null)
  const [toast, setToast]       = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.getAllBookings()
      .then(res => setBookings(res.data || []))
      .catch(() => showToast('Không thể tải dữ liệu đặt phòng', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return bookings.filter(b =>
      !q ||
      (b.customer?.fullName || b.customerName || '').toLowerCase().includes(q) ||
      (b.customer?.email || b.customerEmail || '').toLowerCase().includes(q) ||
      (b.room?.name || '').toLowerCase().includes(q) ||
      String(b.bookingId || b.id || '').includes(q)
    )
  }, [bookings, search])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminApi.deleteBooking(confirm.bookingId || confirm.id)
      setBookings(prev => prev.filter(b => (b.bookingId || b.id) !== (confirm.bookingId || confirm.id)))
      showToast('Đã xoá đặt phòng thành công')
    } catch {
      showToast('Xoá thất bại. Vui lòng thử lại.', 'error')
    } finally {
      setDeleting(false)
      setConfirm(null)
    }
  }

  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : '—'

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Booking Management</p>
          <h1 className="admin-page-title">Quản lý Đặt phòng</h1>
          <p className="admin-page-subtitle">Toàn bộ lịch sử giao dịch đặt phòng trong hệ thống</p>
        </div>
        <button className="admin-refresh-btn" onClick={load} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Tổng đặt phòng</span>
          <span className="admin-stat-value gold">{bookings.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Kết quả lọc</span>
          <span className="admin-stat-value">{filtered.length}</span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <input
            className="admin-search-input"
            placeholder="Tìm theo khách, phòng, mã..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{filtered.length} kết quả</span>
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: '30vh' }}>
            <div className="spinner"></div><p>Đang tải...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Phòng</th>
                <th>Mã phòng</th>
                <th>Giá / đêm</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="admin-table-empty">
                  {search ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đặt phòng nào'}
                </td></tr>
              ) : filtered.map((b, i) => (
                <tr key={b.bookingId || b.id || i}>
                  <td style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>
                    #{String(b.bookingId || b.id || i + 1).padStart(4, '0')}
                  </td>
                  <td style={{ color: 'var(--white)' }}>{b.customer?.fullName || b.customerName || '—'}</td>
                  <td>{b.customer?.email || b.customerEmail || '—'}</td>
                  <td>{b.room?.name || `Phòng ${b.roomId}`}</td>
                  <td style={{ fontFamily: 'monospace' }}>{b.room?.roomNumber || b.roomId}</td>
                  <td style={{ color: 'var(--gold)' }}>{formatPrice(b.room?.price)}</td>
                  <td>{formatDate(b.bookedAt)}</td>
                  <td><span className="badge badge-confirmed">✓ Xác nhận</span></td>
                  <td>
                    <div className="tbl-actions">
                      <button
                        className="tbl-btn tbl-btn-danger"
                        onClick={() => setConfirm(b)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        </svg>
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        booking={confirm}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        loading={deleting}
      />

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AdminLayout>
  )
}
