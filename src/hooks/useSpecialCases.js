// src/hooks/useSpecialCases.js
import { useState, useCallback } from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'

export function useSpecialCases() {
  const { expandSpecialCases, getBetCode } = useBetCode()
  const [expanding, setExpanding] = useState(false)

  const handleExpandGroupedNumbers = useCallback(
    async (codeId) => {
      try {
        const betCode = getBetCode(codeId)
        if (
          !betCode ||
          !betCode.specialCases ||
          betCode.specialCases.groupedNumbers.length === 0
        ) {
          toast.error('Không tìm thấy số gộp thành nhóm để tách')
          return false
        }

        setExpanding(true)
        await expandSpecialCases(codeId, 'groupedNumbers')
        toast.success('Đã tách số gộp thành các mã cược riêng biệt')
        return true
      } catch (error) {
        console.error('Error expanding grouped numbers:', error)
        toast.error('Lỗi khi tách số gộp: ' + error.message)
        return false
      } finally {
        setExpanding(false)
      }
    },
    [expandSpecialCases, getBetCode]
  )

  const handleExpandMultipleBetTypes = useCallback(
    async (codeId) => {
      try {
        const betCode = getBetCode(codeId)
        if (
          !betCode ||
          !betCode.specialCases ||
          betCode.specialCases.multipleBetTypes.length === 0
        ) {
          toast.error('Không tìm thấy nhiều kiểu cược để tách')
          return false
        }

        setExpanding(true)
        await expandSpecialCases(codeId, 'multipleBetTypes')
        toast.success('Đã tách nhiều kiểu cược thành các mã cược riêng biệt')
        return true
      } catch (error) {
        console.error('Error expanding multiple bet types:', error)
        toast.error('Lỗi khi tách nhiều kiểu cược: ' + error.message)
        return false
      } finally {
        setExpanding(false)
      }
    },
    [expandSpecialCases, getBetCode]
  )

  const hasSpecialCases = useCallback((betCode) => {
    if (!betCode || !betCode.specialCases) return false

    return (
      betCode.specialCases.groupedNumbers.length > 0 ||
      betCode.specialCases.multipleBetTypes.length > 0
    )
  }, [])

  const getSpecialCasesCount = useCallback((betCode) => {
    if (!betCode || !betCode.specialCases) return 0

    return (
      betCode.specialCases.groupedNumbers.length +
      betCode.specialCases.multipleBetTypes.length
    )
  }, [])

  return {
    expanding,
    handleExpandGroupedNumbers,
    handleExpandMultipleBetTypes,
    hasSpecialCases,
    getSpecialCasesCount,
  }
}
