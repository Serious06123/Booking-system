import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Vui lòng nhập đầy đủ thông tin'); return }
    setLoading(true)
    try {
      const res = await customerApi.login(form)
      const { token, user } = res.data
      login(user || { email: form.email }, token)
      navigate('/admin', { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 400 || status === 403) {
        setError('Sai email hoặc mật khẩu. Vui lòng thử lại.')
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thất bại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>✦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, color: 'var(--white)' }}>
            LuxStay
          </h1>
          <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--gold)', marginTop: '0.25rem' }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
          padding: '2rem',
        }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '0.35rem' }}>
              Đăng nhập quản trị
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--white)' }}>
              Xác thực quản trị viên
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>
            )}

            <div className="form-group">
              <label className="form-label">Email quản trị</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="admin@luxstay.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Đang xác thực...</>
                : 'Đăng nhập Admin'
              }
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--dark-border)', textAlign: 'center' }}>
            <a href="/" style={{ fontSize: '0.8125rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color var(--transition)' }}
              onMouseOver={e => e.target.style.color = 'var(--gold)'}
              onMouseOut={e => e.target.style.color = 'var(--muted)'}
            >
              ← Quay về trang chủ
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
          Chỉ dành cho quản trị viên được uỷ quyền
        </p>
      </div>
    </div>
  )
}
