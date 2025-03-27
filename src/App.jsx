import { useEffect } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

// Auth
import LoginPage from './pages/auth/LoginPage'

// User Pages
import BetCodeInput from './pages/user/BetCodeInput'
import BetCodeHistory from './pages/user/BetCodeHistory'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import StationManagement from './pages/admin/StationManagement'
import BetTypeManagement from './pages/admin/BetTypeManagement'
import BetCodeVerification from './pages/admin/BetCodeVerification'
import VerificationHistory from './pages/admin/VerificationHistory'
import LotteryResults from './pages/admin/LotteryResults'

// Layouts
import MainLayout from './components/layout/MainLayout'
import BetManagementLayout from './components/BetManagementLayout'

function App() {
  useEffect(() => {
    // Seed database khi khởi động app
    import('./database/seeders').then(({ seedDatabase }) => {
      seedDatabase()
    })
  }, [])

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage />} />

        <Route path='/' element={<MainLayout />}>
          {/* User Routes */}
          <Route index element={<BetManagementLayout />} />
          <Route path='history' element={<BetCodeHistory />} />

          {/* Admin Routes */}
          <Route path='admin' element={<Dashboard />} />
          <Route path='admin/users' element={<UserManagement />} />
          <Route path='admin/stations' element={<StationManagement />} />
          <Route path='admin/bet-types' element={<BetTypeManagement />} />
          <Route path='admin/verification' element={<BetCodeVerification />} />
          <Route
            path='admin/verification-history'
            element={<VerificationHistory />}
          />
          <Route path='admin/lottery-results' element={<LotteryResults />} />
        </Route>
      </Routes>

      <Toaster position='top-right' />
    </Router>
  )
}

export default App
