import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { toast } from 'sonner'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }

    setIsLoading(true)
    try {
      const user = await login(username, password)
      if (user) {
        toast.success('Đăng nhập thành công')
        navigate('/')
      }
    } catch (error) {
      toast.error(`Đăng nhập thất bại: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-100'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Đăng nhập</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='username' className='text-sm font-medium'>
                Tên đăng nhập
              </label>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete='username'
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium'>
                Mật khẩu
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete='current-password'
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
