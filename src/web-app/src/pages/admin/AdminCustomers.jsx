import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../services/api'
import '../../components/admin/AdminLayout.css'

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return <div className={`admin-toast admin-toast-${type}`}>{msg}</div>
}

function DetailModal({ customer, onClose }) {
  if (!customer) return null
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  const rows = [
    { label: 'Mã khách hàng', value: customer.id },
    { label: 'Họ và tên',     value: customer.fullName },
    { label: 'Email',         value: customer.email },
    { label: 'Ngày đăng ký',  value: formatDate(customer.createdAt) },
    { label: 'Trạng thái',    value: customer.active !== false ? '✓ Đang hoạt động' : '✗ Đã khoá' },
  ]

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Hồ sơ khách hàng</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(201,169,110,0.12)',
              border: '2px solid rgba(201,169,110,0.3)',
              color: 'var(--gold)',
              fontSize: '1.5rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}>
              {customer.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <p style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              {customer.fullName}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{customer.email}</p>
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rows.map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.label}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--white-dim)' }}>{r.value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('ALL') // ALL | ACTIVE | INACTIVE
  const [toggling, setToggling]   = useState(null)
  const [detail, setDetail]       = useState(null)
  const [toast, setToast]         = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.getAllCustomers()
      .then(res => setCustomers(res.data || []))
      .catch(() => showToast('Không thể tải danh sách khách hàng', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return customers.filter(c => {
      const isActive = c.active !== false
      const matchFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && isActive) ||
        (filter === 'INACTIVE' && !isActive)
      const matchSearch =
        !q ||
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        String(c.id).includes(q)
      return matchFilter && matchSearch
    })
  }, [customers, search, filter])

  const handleToggleStatus = async (customer) => {
    const newActive = customer.active === false ? true : false
    setToggling(customer.id)
    try {
      await adminApi.updateCustomerStatus(customer.id, newActive)
      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? { ...c, active: newActive } : c)
      )
      showToast(`Tài khoản ${customer.fullName} đã ${newActive ? 'được kích hoạt' : 'bị khoá'}`)
    } catch {
      showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error')
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  const active   = customers.filter(c => c.active !== false).length
  const inactive = customers.filter(c => c.active === false).length

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Customer Management</p>
          <h1 className="admin-page-title">Hồ sơ Khách hàng</h1>
          <p className="admin-page-subtitle">Quản lý danh tính và trạng thái tài khoản người dùng</p>
        </div>
        <button className="admin-refresh-btn" onClick={load} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Làm mới
        </button>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Tổng khách hàng</span>
          <span className="admin-stat-value gold">{customers.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Đang hoạt động</span>
          <span className="admin-stat-value green">{active}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Đã khoá</span>
          <span className="admin-stat-value red">{inactive}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Kết quả lọc</span>
          <span className="admin-stat-value">{filtered.length}</span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              className="admin-search-input"
              placeholder="Tìm theo tên, email, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="admin-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="ALL">Tất cả ({customers.length})</option>
              <option value="ACTIVE">Hoạt động ({active})</option>
              <option value="INACTIVE">Đã khoá ({inactive})</option>
            </select>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{filtered.length} khách hàng</span>
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: '30vh' }}>
            <div className="spinner"></div><p>Đang tải...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Validate</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="admin-table-empty">
                  {search || filter !== 'ALL' ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
                </td></tr>
              ) : filtered.map(c => {
                const isActive = c.active !== false
                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>#{c.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(201,169,110,0.1)',
                          border: '1px solid rgba(201,169,110,0.2)',
                          color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {c.fullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ color: 'var(--white)' }}>{c.fullName}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {isActive ? '✓ Hoạt động' : '✗ Đã khoá'}
                      </span>
                    </td>
                    <td>
                      {/* Validate column – phản ánh nghiệp vụ Validate User */}
                      <span className={`badge ${isActive ? 'badge-available' : 'badge-inactive'}`}
                        title="Kết quả kiểm tra tính hợp lệ của tài khoản"
                      >
                        {isActive ? 'Hợp lệ' : 'Không hợp lệ'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          className="tbl-btn"
                          onClick={() => setDetail(c)}
                          title="Xem hồ sơ"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                          </svg>
                          Chi tiết
                        </button>
                        <button
                          className={`tbl-btn ${isActive ? 'tbl-btn-danger' : 'tbl-btn-success'}`}
                          onClick={() => handleToggleStatus(c)}
                          disabled={toggling === c.id}
                          title={isActive ? 'Khoá tài khoản' : 'Kích hoạt tài khoản'}
                        >
                          {toggling === c.id
                            ? <><span className="spinner" style={{ width: 12, height: 12 }}></span> Đang xử lý</>
                            : isActive
                              ? <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                  Khoá
                                </>
                              : <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
                                  Kích hoạt
                                </>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <DetailModal customer={detail} onClose={() => setDetail(null)} />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  )
}
