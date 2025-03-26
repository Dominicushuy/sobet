// src/hooks/useStations.js
import { useState, useCallback, useEffect } from 'react'
import { db } from '@/database/db'
import { toast } from 'sonner'

export function useStations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stations, setStations] = useState([])

  // Lấy tất cả đài
  const fetchStations = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)
    try {
      let query = db.stations
      if (!includeInactive) {
        query = query.where('isActive').equals(true)
      }
      const allStations = await query.toArray()
      setStations(allStations)
      return allStations
    } catch (err) {
      setError(err.message)
      toast.error('Lỗi khi tải danh sách đài')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Lấy đài theo vùng
  const fetchStationsByRegion = useCallback(
    async (region, includeInactive = false) => {
      setLoading(true)
      setError(null)
      try {
        let query = db.stations.where('region').equals(region)
        if (!includeInactive) {
          query = query.and((station) => station.isActive)
        }
        const regionStations = await query.toArray()
        return regionStations
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi tải đài cho vùng ${region}`)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Lấy đài theo lịch
  const fetchStationsBySchedule = useCallback(
    async (day, includeInactive = false) => {
      setLoading(true)
      setError(null)
      try {
        let allStations = await db.stations.toArray()
        let filteredStations = allStations.filter((station) => {
          if (!includeInactive && !station.isActive) return false
          return (
            station.schedule.day === day || station.schedule.day === 'daily'
          )
        })

        // Sắp xếp theo thứ tự
        filteredStations.sort((a, b) => a.schedule.order - b.schedule.order)

        return filteredStations
      } catch (err) {
        setError(err.message)
        toast.error(`Lỗi khi tải đài cho ngày ${day}`)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Tìm đài theo alias
  const findStationByAlias = useCallback(async (alias) => {
    setLoading(true)
    setError(null)
    try {
      const allStations = await db.stations
        .where('isActive')
        .equals(true)
        .toArray()
      const normalizedAlias = alias.toLowerCase().trim()

      // Tìm đài theo tên chính xác
      const exactMatch = allStations.find(
        (station) => station.name.toLowerCase() === normalizedAlias
      )
      if (exactMatch) return exactMatch

      // Tìm đài theo alias
      const aliasMatch = allStations.find((station) =>
        station.aliases.some((a) => a.toLowerCase() === normalizedAlias)
      )
      return aliasMatch || null
    } catch (err) {
      setError(err.message)
      toast.error(`Lỗi khi tìm đài với alias ${alias}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Lấy tất cả đài khi component mount
  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  return {
    loading,
    error,
    stations,
    fetchStations,
    fetchStationsByRegion,
    fetchStationsBySchedule,
    findStationByAlias,
  }
}
