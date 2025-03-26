import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useBetCodes } from '@/hooks/useBetCodes'
import { parseBetCode } from '@/services/betCodeParser/parser'
import { detectErrors } from '@/services/betCodeParser/errorDetector'
import { calculateStake } from '@/services/calculator/stakeCalculator'
import { calculatePotentialPrize } from '@/services/calculator/prizeCalculator'
import { toast } from 'sonner'

const BetCodeEditModal = ({ open, onOpenChange, betCode, onSuccess }) => {
  const [content, setContent] = useState(betCode?.content || '')
  const [analyzing, setAnalyzing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [errors, setErrors] = useState([])
  const { updateBetCode } = useBetCodes()

  useEffect(() => {
    if (betCode) {
      setContent(betCode.content)
    }
  }, [betCode])

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const analyzeContent = async () => {
    if (!content.trim()) {
      setErrors([{ message: 'Vui lòng nhập nội dung mã cược' }])
      return false
    }

    setAnalyzing(true)
    setErrors([])

    try {
      // Phân tích cú pháp
      const parsedResult = parseBetCode(content)

      // Phát hiện lỗi
      const errorResult = detectErrors(content, parsedResult)

      if (!parsedResult.success || errorResult.hasErrors) {
        setErrors(errorResult.errors)
        return false
      }

      return {
        parsedResult,
        errorResult,
      }
    } catch (error) {
      setErrors([{ message: 'Lỗi khi phân tích mã cược: ' + error.message }])
      return false
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    const analysisResult = await analyzeContent()

    if (!analysisResult) {
      return // Có lỗi, không tiếp tục
    }

    setUpdating(true)

    try {
      // Tính toán tiền cược và tiềm năng thắng
      const stakeResult = calculateStake(analysisResult.parsedResult)
      const potentialResult = calculatePotentialPrize(
        analysisResult.parsedResult
      )

      // Cập nhật mã cược
      const updateResult = await updateBetCode(betCode.id, {
        content,
        parsedContent: analysisResult.parsedResult.lines,
        stakeAmount: stakeResult.totalStake,
        potentialWinning: potentialResult.totalPotential,
        errors: [], // Không có lỗi
      })

      if (updateResult) {
        onSuccess && onSuccess()
      } else {
        toast.error('Không thể cập nhật mã cược')
      }
    } catch (error) {
      toast.error(`Lỗi khi cập nhật mã cược: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mã cược</DialogTitle>
          <DialogDescription>
            Chỉnh sửa nội dung mã cược. Hệ thống sẽ phân tích lại và tính toán
            tiền cược.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <div className='text-sm font-medium mb-1.5'>Nội dung mã cược:</div>
            <Textarea
              value={content}
              onChange={handleContentChange}
              rows={5}
              placeholder='Nhập nội dung mã cược...'
              disabled={analyzing || updating}
            />
          </div>

          {errors.length > 0 && (
            <div className='bg-destructive/10 p-3 rounded-md border border-destructive/20'>
              <div className='font-medium text-destructive mb-1'>Lỗi:</div>
              <ul className='list-disc pl-5 space-y-1'>
                {errors.map((error, index) => (
                  <li key={index} className='text-sm text-destructive'>
                    {error.message || 'Lỗi không xác định'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={analyzing || updating}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={analyzing || updating}>
            {analyzing || updating ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {analyzing ? 'Đang phân tích...' : 'Đang lưu...'}
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BetCodeEditModal
