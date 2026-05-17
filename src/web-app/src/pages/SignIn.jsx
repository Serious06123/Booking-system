import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { customerApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Where to go after login
  const returnTo = location.state?.returnTo || '/'

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }))
    setApiError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)
    try {
      const res = await customerApi.login(form)
      const { token, user } = res.data

      login(user || { email: form.email }, token)
      navigate(returnTo, { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 400) {
        setApiError('Sai email hoặc mật khẩu. Vui lòng thử lại.')
      } else {
        setApiError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="auth-deco-text">LUXSTAY</div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Chào mừng trở lại</p>
          <h1 className="auth-title">Đăng Nhập</h1>
          <p className="auth-subtitle">Đăng nhập để tiếp tục trải nghiệm dịch vụ đẳng cấp</p>
        </div>

        {location.state?.returnTo && (
          <div className="alert alert-error" style={{ background: 'rgba(201,169,110,0.08)', borderColor: 'var(--gold)', color: 'var(--gold-light)' }}>
            Vui lòng đăng nhập để đặt phòng.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật Khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Đang đăng nhập...</> : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/signup" className="auth-link">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  )
}
