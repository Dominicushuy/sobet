// src/hooks/useBetCodes.js
import { useState, useCallback, useContext } from 'react'
import { db } from '@/database/db'
import { AuthContext } from '@/contexts/AuthContext'
import { BET_CODE_STATUS } from '@/config/constants'
import { toast } from 'sonner'

export function useBetCodes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [betCodes, setBetCodes] = useState([])
  const { user } = useContext(AuthContext)

  // Lấy tất cả mã cược của người dùng hiện tại
  const fetchUserBetCodes = useCallback(async () => {
    if (!user) return []

    setLoading(true)
    setError(null)
    try {
      const userBetCodes = await db.betCodes
        .where('userId')
        .equals(user.id)
        .and((betCode) => betCode.status !== BET_CODE_STATUS.DELETED)
        .reverse()
        .sortBy('createdAt')

      setBetCodes(userBetCodes)
      return userBetCodes
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi tải mã cược')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  // Thêm mã cược mới
  const addBetCode = useCallback(
    async (
      content,
      parsedContent,
      stakeAmount,
      potentialWinning,
      errors = []
    ) => {
      if (!user) {
        toast.error('Bạn cần đăng nhập để thêm mã cược')
        return null
      }

      setLoading(true)
      setError(null)
      try {
        const betCode = {
          userId: user.id,
          content,
          parsedContent,
          stakeAmount,
          potentialWinning,
          errors,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: BET_CODE_STATUS.PENDING,
        }

        const id = await db.betCodes.add(betCode)
        toast.success('Đã thêm mã cược mới')
        await fetchUserBetCodes()
        return { id, ...betCode }
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi thêm mã cược: ${err.message}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, fetchUserBetCodes]
  )

  // Cập nhật mã cược
  const updateBetCode = useCallback(
    async (id, updates) => {
      if (!user) return false

      setLoading(true)
      setError(null)
      try {
        // Kiểm tra mã cược có tồn tại
        const betCode = await db.betCodes.get(id)
        if (!betCode) {
          toast.error('Mã cược không tồn tại')
          return false
        }

        // Kiểm tra quyền - chỉ owner hoặc admin mới có thể sửa
        if (betCode.userId !== user.id && user.role !== 'admin') {
          toast.error('Bạn không có quyền sửa mã cược này')
          return false
        }

        // Cập nhật mã cược
        await db.betCodes.update(id, {
          ...updates,
          updatedAt: new Date(),
        })

        toast.success('Đã cập nhật mã cược')
        await fetchUserBetCodes()
        return true
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi cập nhật mã cược: ${err.message}`)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, fetchUserBetCodes]
  )

  // Xóa mã cược (soft delete)
  const deleteBetCode = useCallback(
    async (id) => {
      if (!user) return false

      setLoading(true)
      setError(null)
      try {
        // Kiểm tra mã cược có tồn tại
        const betCode = await db.betCodes.get(id)
        if (!betCode) {
          toast.error('Mã cược không tồn tại')
          return false
        }

        // Kiểm tra quyền - chỉ owner hoặc admin mới có thể xóa
        if (betCode.userId !== user.id && user.role !== 'admin') {
          toast.error('Bạn không có quyền xóa mã cược này')
          return false
        }

        // Soft delete
        await db.betCodes.update(id, {
          status: BET_CODE_STATUS.DELETED,
          updatedAt: new Date(),
        })

        toast.success('Đã xóa mã cược')
        await fetchUserBetCodes()
        return true
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi xóa mã cược: ${err.message}`)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, fetchUserBetCodes]
  )

  // Lấy chi tiết một mã cược
  const getBetCodeById = useCallback(
    async (id) => {
      if (!user) return null

      setLoading(true)
      setError(null)
      try {
        const betCode = await db.betCodes.get(id)
        return betCode
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi lấy chi tiết mã cược: ${err.message}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  return {
    loading,
    error,
    betCodes,
    fetchUserBetCodes,
    addBetCode,
    updateBetCode,
    deleteBetCode,
    getBetCodeById,
  }
}
