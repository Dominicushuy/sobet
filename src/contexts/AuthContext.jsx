import { createContext, useState, useEffect, useCallback } from 'react'
import { db } from '../database/db'
import { hasPermission as checkPermission } from '@/config/roles'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra user đã đăng nhập từ localStorage
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          // Kiểm tra user có tồn tại trong database không
          const userExists = await db.users.get(userData.id)
          if (userExists && userExists.isActive) {
            setUser(userData)
          } else {
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Error checking auth:', error)
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      // Tìm user trong database
      const userRecord = await db.users
        .where('username')
        .equals(username)
        .and((user) => user.isActive)
        .first()

      if (!userRecord) {
        throw new Error('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa')
      }

      // Trong thực tế, bạn nên hash password và so sánh
      // Đây chỉ là ví dụ đơn giản
      if (
        userRecord.password !== password &&
        !userRecord.password.startsWith(`hashed_${password}_`)
      ) {
        throw new Error('Mật khẩu không chính xác')
      }

      // Cập nhật lastLogin
      await db.users.update(userRecord.id, {
        lastLogin: new Date(),
      })

      // Lưu user vào state và localStorage
      const userData = {
        id: userRecord.id,
        username: userRecord.username,
        role: userRecord.role,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Kiểm tra quyền của user hiện tại
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false
      return checkPermission(user.role, permission)
    },
    [user]
  )

  // Kiểm tra vai trò của user hiện tại
  const hasRole = useCallback(
    (role) => {
      if (!user) return false
      return user.role === role
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}
