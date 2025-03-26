// src/hooks/useVerification.js
import { useState, useCallback } from 'react'
import { db } from '@/database/db'
import { toast } from 'sonner'
import { useLotteryResults } from './useLotteryResults'

export function useVerification() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [verificationResults, setVerificationResults] = useState([])
  const { importLatestResults, checkResultExists } = useLotteryResults()

  // Kiểm tra nếu thời gian hiện tại đã sau 16h
  const isAfter4PM = useCallback(() => {
    const now = new Date()
    return now.getHours() >= 16
  }, [])

  // Lấy tất cả mã cược chưa đối soát
  const fetchUnverifiedBetCodes = useCallback(async (date = null) => {
    try {
      let query = db.betCodes.where('status').equals('pending')

      // Nếu có date, thêm điều kiện ngày
      if (date) {
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        query = query.and((betCode) => {
          const betDate = new Date(betCode.createdAt)
          return betDate >= targetDate && betDate < nextDay
        })
      }

      const unverifiedBetCodes = await query.toArray()
      return unverifiedBetCodes
    } catch (err) {
      console.error('Lỗi khi lấy mã cược chưa đối soát:', err)
      throw err
    }
  }, [])

  // Đối soát tất cả mã cược
  const verifyAllBetCodes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Kiểm tra nếu đã sau 16h
      if (!isAfter4PM()) {
        toast.error('Chỉ có thể đối soát tất cả sau 16h')
        return {
          success: false,
          message: 'Chỉ có thể đối soát tất cả sau 16h',
        }
      }

      // Lấy ngày hiện tại
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Kiểm tra đã có kết quả xổ số cho ngày hôm nay chưa
      const hasResults = await checkResultExists(today)

      // Nếu chưa có kết quả, thực hiện import
      if (!hasResults) {
        console.log(
          'Chưa có kết quả xổ số cho ngày hôm nay, tiến hành import...'
        )
        const importResult = await importLatestResults(today)

        if (!importResult.success && !importResult.alreadyExists) {
          toast.error('Không thể import kết quả xổ số')
          return {
            success: false,
            message: 'Không thể import kết quả xổ số',
          }
        }
      }

      // Lấy tất cả các mã cược chưa đối soát
      const unverifiedBetCodes = await fetchUnverifiedBetCodes(today)

      if (unverifiedBetCodes.length === 0) {
        toast.info('Không có mã cược nào cần đối soát')
        return {
          success: true,
          message: 'Không có mã cược nào cần đối soát',
          verifiedCount: 0,
        }
      }

      // TODO: Gọi service đối soát mã cược ở đây
      // Đây là phần sẽ được triển khai trong các phần tiếp theo

      // Giả lập kết quả đối soát thành công
      toast.success(
        `Đã đối soát thành công ${unverifiedBetCodes.length} mã cược`
      )
      return {
        success: true,
        message: `Đã đối soát thành công ${unverifiedBetCodes.length} mã cược`,
        verifiedCount: unverifiedBetCodes.length,
      }
    } catch (err) {
      setError(err.message)
      toast.error(`Lỗi khi đối soát mã cược: ${err.message}`)
      return {
        success: false,
        message: `Lỗi khi đối soát mã cược: ${err.message}`,
      }
    } finally {
      setLoading(false)
    }
  }, [
    checkResultExists,
    fetchUnverifiedBetCodes,
    importLatestResults,
    isAfter4PM,
  ])

  return {
    loading,
    error,
    verificationResults,
    isAfter4PM,
    verifyAllBetCodes,
    fetchUnverifiedBetCodes,
  }
}
