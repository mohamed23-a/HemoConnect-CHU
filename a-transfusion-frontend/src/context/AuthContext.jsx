import React, { createContext, useState, useContext, useEffect } from 'react'
import authService from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    // التحقق من وجود مستخدم مخزن
    const storedUser = localStorage.getItem('user')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
      setToken(response.token)
      toast.success('تم تسجيل الدخول بنجاح')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'فشل تسجيل الدخول')
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      toast.success('تم تسجيل الخروج')
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      toast.success('تم إنشاء المستخدم بنجاح')
      return { success: true, data: response }
    } catch (error) {
      toast.error(error.message || 'فشل إنشاء المستخدم')
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      })
      toast.success('تم تغيير كلمة المرور بنجاح')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'فشل تغيير كلمة المرور')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    changePassword,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isHospital: user?.role === 'hospital',
    isBloodCenter: user?.role === 'blood_center',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}