import { createContext, useState, useEffect } from 'react'
import { db } from '../database/db'

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
        throw new Error('User not found or inactive')
      }

      // Trong thực tế, bạn nên hash password và so sánh
      // Đây chỉ là ví dụ đơn giản
      if (userRecord.password !== password) {
        throw new Error('Invalid password')
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
