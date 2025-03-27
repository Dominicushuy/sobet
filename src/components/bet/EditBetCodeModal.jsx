// src/components/bet/EditBetCodeModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'
import { formatMoney } from '@/utils/formatters'
import { betCodeService } from '@/services/betCodeService'

const EditBetCodeModal = ({ betCode, isOpen, onClose }) => {
  const { updateBetCode, editDraftCode } = useBetCode()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formState, setFormState] = useState({
    originalText: '',
    stakeAmount: 0,
    potentialWinning: 0,
  })
  const [analysisResult, setAnalysisResult] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState([])

  // Initialize form with bet code data
  useEffect(() => {
    if (betCode) {
      setFormState({
        originalText: betCode.originalText || '',
        stakeAmount: betCode.stakeAmount || 0,
        potentialWinning: betCode.potentialWinning || 0,
      })
    }
  }, [betCode])

  // Analyze bet code when text changes
  useEffect(() => {
    const analyzeCode = async () => {
      if (!formState.originalText.trim()) {
        setAnalysisResult(null)
        setErrors([])
        return
      }

      try {
        setIsProcessing(true)
        const result = await betCodeService.analyzeBetCode(
          formState.originalText
        )
        setAnalysisResult(result)

        if (!result.success) {
          setErrors(
            result.errorResult?.errors?.map((err) => err.message) || [
              'Mã cược không hợp lệ',
            ]
          )
        } else {
          setErrors([])
          // Update calculated values
          setFormState((prev) => ({
            ...prev,
            stakeAmount: result.calculationResults.stakeResult?.totalStake || 0,
            potentialWinning:
              result.calculationResults.prizeResult?.totalPotential || 0,
          }))
        }
      } catch (error) {
        console.error('Error analyzing bet code:', error)
        setErrors([`Lỗi phân tích: ${error.message}`])
      } finally {
        setIsProcessing(false)
      }
    }

    // Use debounce to avoid too many analyses
    const timer = setTimeout(() => {
      if (
        formState.originalText !== betCode?.originalText &&
        formState.originalText.trim()
      ) {
        analyzeCode()
        setHasChanges(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formState.originalText, betCode])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (errors.length > 0) {
      toast.error('Vui lòng sửa các lỗi trước khi lưu')
      return
    }

    try {
      const updatedBetCode = {
        ...betCode,
        originalText: formState.originalText,
        stakeAmount: formState.stakeAmount,
        potentialWinning: formState.potentialWinning,
      }

      // If we have analysis result, update with parsed data
      if (analysisResult && analysisResult.success) {
        updatedBetCode.formattedText = analysisResult.formattedText
        updatedBetCode.station = analysisResult.parseResult.station
        updatedBetCode.lines = analysisResult.parseResult.lines
        updatedBetCode.stakeDetails =
          analysisResult.calculationResults.stakeResult?.details || []
        updatedBetCode.prizeDetails =
          analysisResult.calculationResults.prizeResult?.details || []
      }

      if (betCode.isDraft) {
        editDraftCode(betCode.id, updatedBetCode)
      } else {
        updateBetCode(betCode.id, updatedBetCode)
      }

      toast.success('Đã cập nhật mã cược')
      onClose()
    } catch (error) {
      console.error('Error updating bet code:', error)
      toast.error(`Lỗi cập nhật: ${error.message}`)
    }
  }

  if (!betCode) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mã cược</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div>
            <Label htmlFor='originalText'>Nội dung mã cược</Label>
            <Textarea
              id='originalText'
              name='originalText'
              value={formState.originalText}
              onChange={handleInputChange}
              placeholder='Nhập mã cược...'
              className='h-32 font-mono'
            />
          </div>

          {isProcessing && (
            <div className='text-center py-2'>
              <div className='inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1'></div>
              <span className='text-sm text-muted-foreground'>
                Đang phân tích...
              </span>
            </div>
          )}

          {errors.length > 0 && (
            <div className='bg-red-50 p-3 rounded-md border border-red-200'>
              <h3 className='text-sm font-medium text-red-800 mb-1'>
                Lỗi mã cược:
              </h3>
              <ul className='list-disc pl-5 text-xs text-red-700 space-y-1'>
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult?.success && (
            <div className='bg-green-50 p-3 rounded-md border border-green-200'>
              <h3 className='text-sm font-medium text-green-800 mb-1'>
                Thông tin phân tích:
              </h3>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='font-medium'>Đài:</span>{' '}
                  {analysisResult.parseResult.station?.name || 'Không xác định'}
                </div>
                <div>
                  <span className='font-medium'>Số mã cược:</span>{' '}
                  {analysisResult.parseResult.lines?.length || 0}
                </div>
                <div>
                  <span className='font-medium'>Tiền cược:</span>{' '}
                  {formatMoney(
                    analysisResult.calculationResults.stakeResult?.totalStake ||
                      0
                  )}
                  đ
                </div>
                <div>
                  <span className='font-medium'>Tiềm năng thắng:</span>{' '}
                  {formatMoney(
                    analysisResult.calculationResults.prizeResult
                      ?.totalPotential || 0
                  )}
                  đ
                </div>
              </div>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='stakeAmount'>Tiền cược (đ)</Label>
              <Input
                id='stakeAmount'
                name='stakeAmount'
                value={formState.stakeAmount}
                onChange={handleInputChange}
                disabled={!analysisResult?.success}
              />
            </div>
            <div>
              <Label htmlFor='potentialWinning'>Tiềm năng thắng (đ)</Label>
              <Input
                id='potentialWinning'
                name='potentialWinning'
                value={formState.potentialWinning}
                onChange={handleInputChange}
                disabled={!analysisResult?.success}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} className='mr-2'>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={errors.length > 0 || !hasChanges || isProcessing}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditBetCodeModal
