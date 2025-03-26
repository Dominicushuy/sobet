// src/contexts/UIContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'

// Tạo context
export const UIContext = createContext()

// Provider component
export const UIProvider = ({ children }) => {
  // Trạng thái chung của UI
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Kiểm tra nếu là mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check ngay khi component mount
    checkIsMobile()

    // Thêm event listener để check khi resize
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Xử lý dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const value = {
    darkMode,
    toggleDarkMode,
    sidebarCollapsed,
    toggleSidebar,
    isMobile,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// Custom hook để sử dụng context
export const useUI = () => {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}
