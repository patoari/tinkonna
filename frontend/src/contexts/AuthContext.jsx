import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'

const AuthContext = createContext(null)

// Create a cart clear callback registry
const cartClearCallbacks = []

export function registerCartClearCallback(callback) {
  cartClearCallbacks.push(callback)
  return () => {
    const index = cartClearCallbacks.indexOf(callback)
    if (index > -1) cartClearCallbacks.splice(index, 1)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const { user, token } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    const { user, token } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    
    // CRITICAL FIX: Clear cart and all local storage on logout
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Notify cart context to clear
    cartClearCallbacks.forEach(callback => {
      try {
        callback()
      } catch (e) {
        console.error('Error clearing cart:', e)
      }
    })
    
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  const hasRole = useCallback((role) => {
    if (!user?.roles) return false
    return user.roles.some(r => r.name === role)
  }, [user])

  const hasPermission = useCallback((permission) => {
    if (!user?.roles) return false
    return user.roles.some(r =>
      r.permissions?.some(p => p.name === permission)
    )
  }, [user])

  const isAdmin = hasRole('admin')
  const isStaff = user?.user_type !== 'customer'
  const isCustomer = user?.user_type === 'customer'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      hasRole,
      hasPermission,
      isAdmin,
      isStaff,
      isCustomer,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
