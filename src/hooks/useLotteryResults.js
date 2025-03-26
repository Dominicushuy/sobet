// src/hooks/useLotteryResults.js
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/database/db'
import { toast } from 'sonner'
import {
  importLotteryResults,
  importLotteryResultsFromJson,
  cleanupOldResults,
} from '@/services/importers/resultImporter'

export function useLotteryResults() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  // Lấy tất cả kết quả xổ số từ database
  const fetchAllResults = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allResults = await db.lotteryResults.toArray()
      setResults(allResults)
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi lấy dữ liệu kết quả xổ số')
    } finally {
      setLoading(false)
    }
  }, [])

  // Lấy kết quả xổ số theo miền và ngày
  const fetchResultsByRegion = useCallback(async (region, date) => {
    setLoading(true)
    setError(null)
    try {
      // Nếu có date, chuyển đổi thành đối tượng Date
      let targetDate = date ? new Date(date) : null

      // Query dữ liệu
      let query = db.lotteryResults.where('region').equals(region)

      // Nếu có date, thêm điều kiện date
      if (targetDate) {
        // Reset time về 00:00:00 để so sánh chính xác ngày
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        query = query.and((result) => {
          const resultDate = new Date(result.date)
          return resultDate >= targetDate && resultDate < nextDay
        })
      }

      const resultsByRegion = await query.toArray()
      setResults(resultsByRegion)
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi lấy dữ liệu kết quả xổ số theo miền')
    } finally {
      setLoading(false)
    }
  }, [])

  // Lấy kết quả xổ số theo tỉnh và ngày
  const fetchResultsByStation = useCallback(async (station, date) => {
    setLoading(true)
    setError(null)
    try {
      // Nếu có date, chuyển đổi thành đối tượng Date
      let targetDate = date ? new Date(date) : null

      // Query dữ liệu
      let query = db.lotteryResults.where('station').equals(station)

      // Nếu có date, thêm điều kiện date
      if (targetDate) {
        // Reset time về 00:00:00 để so sánh chính xác ngày
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        query = query.and((result) => {
          const resultDate = new Date(result.date)
          return resultDate >= targetDate && resultDate < nextDay
        })
      }

      const resultsByStation = await query.toArray()
      setResults(resultsByStation)
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi lấy dữ liệu kết quả xổ số theo tỉnh')
    } finally {
      setLoading(false)
    }
  }, [])

  // Nhập kết quả xổ số mới nhất
  const importLatestResults = useCallback(async () => {
    setLoading(true)
    try {
      const result = await importLotteryResults()
      if (result.success) {
        toast.success(result.message)
        // Fetch lại dữ liệu
        await fetchAllResults()
      } else {
        toast.error(`Lỗi: ${result.error}`)
      }
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi nhập kết quả xổ số mới nhất')
    } finally {
      setLoading(false)
    }
  }, [fetchAllResults])

  // Nhập kết quả xổ số từ file JSON
  const importResultsFromJson = useCallback(
    async (jsonData) => {
      setLoading(true)
      try {
        const result = await importLotteryResultsFromJson(jsonData)
        if (result.success) {
          toast.success(result.message)
          // Fetch lại dữ liệu
          await fetchAllResults()
        } else {
          toast.error(`Lỗi: ${result.error}`)
        }
      } catch (err) {
        setError(err.message)
        toast.error('Lỗi khi nhập kết quả xổ số từ JSON')
      } finally {
        setLoading(false)
      }
    },
    [fetchAllResults]
  )

  // Xóa kết quả xổ số cũ
  const cleanup = useCallback(
    async (days) => {
      setLoading(true)
      try {
        const result = await cleanupOldResults(days)
        if (result.success) {
          toast.success(result.message)
          // Fetch lại dữ liệu
          await fetchAllResults()
        } else {
          toast.error(`Lỗi: ${result.error}`)
        }
      } catch (err) {
        setError(err.message)
        toast.error('Lỗi khi xóa kết quả xổ số cũ')
      } finally {
        setLoading(false)
      }
    },
    [fetchAllResults]
  )

  useEffect(() => {
    fetchAllResults()
  }, [fetchAllResults])

  return {
    results,
    loading,
    error,
    fetchAllResults,
    fetchResultsByRegion,
    fetchResultsByStation,
    importLatestResults,
    importResultsFromJson,
    cleanup,
  }
}
