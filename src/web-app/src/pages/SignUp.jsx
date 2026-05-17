import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { customerApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu không khớp'
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
      const res = await customerApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })

      // If API returns token on registration, auto login
      if (res.data?.token) {
        login(res.data.user || { fullName: form.fullName, email: form.email }, res.data.token)
        navigate('/')
      } else {
        setSuccess(true)
        setTimeout(() => navigate('/signin'), 2000)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data
      if (typeof msg === 'string' && msg.toLowerCase().includes('email')) {
        setApiError('Email đã được sử dụng. Vui lòng dùng email khác.')
      } else {
        setApiError(msg || 'Đăng ký thất bại. Vui lòng thử lại.')
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
          <p className="auth-eyebrow">Tạo tài khoản</p>
          <h1 className="auth-title">Đăng Ký</h1>
          <p className="auth-subtitle">Tham gia LuxStay để bắt đầu hành trình nghỉ dưỡng đẳng cấp</p>
        </div>

        {success ? (
          <div className="alert alert-success">
            ✓ Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="alert alert-error">{apiError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ và Tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Nguyễn Văn An"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

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
                placeholder="Ít nhất 6 ký tự"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Đang xử lý...</> : 'Tạo Tài Khoản'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Đã có tài khoản? <Link to="/signin" className="auth-link">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  )
}
