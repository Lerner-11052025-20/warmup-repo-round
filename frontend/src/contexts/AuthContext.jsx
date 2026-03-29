import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (token && savedUser) {
        try {
          const { data } = await authAPI.getMe()
          setUser(data.user)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const signup = async (formData) => {
    try {
      const { data } = await authAPI.signup(formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Account created successfully! Welcome aboard! 🚀')
      navigate('/dashboard')
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      toast.error(message)
      throw error
    }
  }

  const login = async (formData) => {
    try {
      const { data } = await authAPI.login(formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.name}! 👋`)
      navigate('/dashboard')
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const forgotPassword = async (email) => {
    try {
      const { data } = await authAPI.forgotPassword({ email })
      toast.success(data.message || 'Temporary password sent!')
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
