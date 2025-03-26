import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Database,
  ListChecks,
  History,
  MessageSquare,
  LogOut,
  Calendar,
} from 'lucide-react'
import { AuthContext } from '@/contexts/AuthContext'
import { Button } from '../ui/button'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  // Kiểm tra authen
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  const isAdmin = user.role === 'admin'

  const userMenuItems = [
    { path: '/', label: 'Nhập mã cược', icon: <MessageSquare size={20} /> },
    { path: '/history', label: 'Lịch sử mã cược', icon: <History size={20} /> },
  ]

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      path: '/admin/users',
      label: 'Quản lý người dùng',
      icon: <Users size={20} />,
    },
    {
      path: '/admin/stations',
      label: 'Quản lý đài',
      icon: <Database size={20} />,
    },
    {
      path: '/admin/bet-types',
      label: 'Quản lý kiểu cược',
      icon: <Database size={20} />,
    },
    {
      path: '/admin/verification',
      label: 'Đối soát kết quả',
      icon: <ListChecks size={20} />,
    },
    {
      path: '/admin/verification-history',
      label: 'Lịch sử đối soát',
      icon: <History size={20} />,
    },
    {
      path: '/admin/lottery-results',
      label: 'Kết quả xổ số',
      icon: <Calendar size={20} />,
    },
  ]

  const menuItems = isAdmin
    ? [...userMenuItems, ...adminMenuItems]
    : userMenuItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <div className='w-64 bg-slate-800 text-white p-4'>
        <div className='text-xl font-bold mb-6'>Quản lý xổ số</div>

        <nav className='space-y-2'>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 p-2 rounded hover:bg-slate-700 ${
                location.pathname === item.path ? 'bg-slate-700' : ''
              }`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className='mt-auto pt-6'>
          <Button
            variant='ghost'
            className='w-full flex items-center gap-2 text-white'
            onClick={handleLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-6'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
