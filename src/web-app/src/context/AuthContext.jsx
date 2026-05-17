import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { customerApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [validating, setValidating] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) return
    setValidating(true)
    customerApi.validate()
      .then((res) => {
        if (!res.data?.valid) logout()
      })
      .catch(() => logout())
      .finally(() => setValidating(false))
  }, []) // eslint-disable-line

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!user, validating }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
