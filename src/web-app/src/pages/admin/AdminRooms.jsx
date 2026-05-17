import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../services/api'
import '../../components/admin/AdminLayout.css'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return <div className={`admin-toast admin-toast-${type}`}>{msg}</div>
}

function CreateRoomModal({ onSave, onCancel, loading }) {
  const [form, setForm] = useState({ roomNumber: '', name: '', price: '', status: 'AVAILABLE' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.roomNumber.trim()) e.roomNumber = 'Bắt buộc'
    if (!form.name.trim())       e.name       = 'Bắt buộc'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Giá phải là số dương'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...form, price: Number(form.price) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Thêm phòng mới</span>
          <button className="modal-close" onClick={onCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {[
            { key: 'roomNumber', label: 'Mã phòng', placeholder: 'VD: 101' },
            { key: 'name',       label: 'Tên phòng', placeholder: 'VD: Phòng Deluxe Hướng Biển' },
            { key: 'price',      label: 'Giá / đêm (VND)', placeholder: 'VD: 1500000', type: 'number' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <input
                className={`form-input ${errors[f.key] ? 'error' : ''}`}
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: null })) }}
              />
              {errors[f.key] && <span className="field-error" style={{ color: '#E57373', fontSize: '0.75rem' }}>{errors[f.key]}</span>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Tình trạng</label>
            <select className="admin-select" style={{ width: '100%', padding: '0.875rem 1rem' }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="AVAILABLE">Còn trống</option>
              <option value="BOOKED">Đã đặt</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Huỷ</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Đang lưu...</> : 'Tạo phòng'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminRooms() {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('ALL')
  const [updating, setUpdating] = useState(null) // roomId being updated
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [toast, setToast]           = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.getAllRooms()
      .then(res => setRooms(res.data || []))
      .catch(() => showToast('Không thể tải danh sách phòng', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rooms.filter(r => {
      const matchFilter = filter === 'ALL' || r.status === filter
      const matchSearch = !q || r.name?.toLowerCase().includes(q) || String(r.roomNumber).includes(q)
      return matchFilter && matchSearch
    })
  }, [rooms, search, filter])

  const handleToggleStatus = async (room) => {
    const newStatus = room.status === 'AVAILABLE' ? 'BOOKED' : 'AVAILABLE'
    setUpdating(room.id)
    try {
      await adminApi.updateRoomStatus(room.id, newStatus)
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r))
      showToast(`Đã cập nhật phòng ${room.roomNumber} → ${newStatus === 'AVAILABLE' ? 'Còn trống' : 'Đã đặt'}`)
    } catch {
      showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleCreate = async (data) => {
    setCreating(true)
    try {
      const res = await adminApi.createRoom(data)
      setRooms(prev => [...prev, res.data])
      setShowCreate(false)
      showToast(`Đã tạo phòng ${data.roomNumber} thành công`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Tạo phòng thất bại.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : '—'

  const available = rooms.filter(r => r.status === 'AVAILABLE').length
  const booked    = rooms.filter(r => r.status === 'BOOKED').length

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Room Management</p>
          <h1 className="admin-page-title">Tình trạng Phòng</h1>
          <p className="admin-page-subtitle">Quản lý và cập nhật tình trạng từng phòng</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-refresh-btn" onClick={load} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Làm mới
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            + Thêm phòng
          </button>
        </div>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Tổng phòng</span>
          <span className="admin-stat-value">{rooms.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Còn trống</span>
          <span className="admin-stat-value green">{available}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Đã đặt</span>
          <span className="admin-stat-value red">{booked}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Tỷ lệ lấp đầy</span>
          <span className="admin-stat-value gold">{rooms.length ? Math.round((booked / rooms.length) * 100) : 0}%</span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              className="admin-search-input"
              placeholder="Tìm theo tên, mã phòng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="admin-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="ALL">Tất cả ({rooms.length})</option>
              <option value="AVAILABLE">Còn trống ({available})</option>
              <option value="BOOKED">Đã đặt ({booked})</option>
            </select>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{filtered.length} phòng</span>
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: '30vh' }}>
            <div className="spinner"></div><p>Đang tải...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Tên phòng</th>
                <th>Giá / đêm</th>
                <th>Tình trạng</th>
                <th>Cập nhật trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="admin-table-empty">
                  {search || filter !== 'ALL' ? 'Không có phòng phù hợp' : 'Chưa có phòng nào'}
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>{r.roomNumber}</td>
                  <td style={{ color: 'var(--white)' }}>{r.name}</td>
                  <td>{formatPrice(r.price)}</td>
                  <td>
                    <span className={`badge ${r.status === 'AVAILABLE' ? 'badge-available' : 'badge-booked'}`}>
                      {r.status === 'AVAILABLE' ? '● Còn trống' : '● Đã đặt'}
                    </span>
                  </td>
                  <td>
                    <div className="tbl-actions">
                      {r.status === 'AVAILABLE' ? (
                        <button
                          className="tbl-btn tbl-btn-gold"
                          onClick={() => handleToggleStatus(r)}
                          disabled={updating === r.id}
                        >
                          {updating === r.id
                            ? <><span className="spinner" style={{ width: 12, height: 12 }}></span> Đang xử lý</>
                            : '→ Đánh dấu Đã đặt'
                          }
                        </button>
                      ) : (
                        <button
                          className="tbl-btn tbl-btn-success"
                          onClick={() => handleToggleStatus(r)}
                          disabled={updating === r.id}
                        >
                          {updating === r.id
                            ? <><span className="spinner" style={{ width: 12, height: 12 }}></span> Đang xử lý</>
                            : '→ Đặt lại Còn trống'
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={creating}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  )
}
