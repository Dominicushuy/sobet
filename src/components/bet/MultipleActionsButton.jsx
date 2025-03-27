// src/components/bet/MultipleActionsButton.jsx
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Download,
  BookmarkCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'
import { useState } from 'react'
import { exportMultipleBetCodesToPDF } from '@/services/export/pdfExporter'

const MultipleActionsButton = ({ selectedIds, onClearSelection }) => {
  const {
    confirmDraftCode,
    removeBetCode,
    removeDraftCode,
    getBetCode,
    getStatistics,
  } = useBetCode()
  const [printing, setPrinting] = useState(false)
  const [saving, setSaving] = useState(false)

  const getDraftIds = () => {
    return selectedIds.filter((id) => {
      const code = getBetCode(id)
      return code && code.isDraft
    })
  }

  const getConfirmedIds = () => {
    return selectedIds.filter((id) => {
      const code = getBetCode(id)
      return code && !code.isDraft
    })
  }

  const draftCount = getDraftIds().length
  const confirmedCount = getConfirmedIds().length

  const handleConfirmSelected = async () => {
    if (draftCount === 0) {
      toast.info('Không có mã cược nháp nào được chọn để lưu')
      return
    }

    try {
      setSaving(true)
      const draftIds = getDraftIds()
      let confirmedCount = 0

      for (const id of draftIds) {
        confirmDraftCode(id)
        confirmedCount++

        // Nếu có nhiều mã cược, thêm delay nhỏ để không block UI
        if (draftIds.length > 10) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      if (confirmedCount > 0) {
        toast.success(`Đã lưu ${confirmedCount} mã cược`)
        onClearSelection()
      }
    } catch (error) {
      console.error('Lỗi khi lưu nhiều mã cược:', error)
      toast.error('Lỗi: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info('Chưa có mã cược nào được chọn để xóa')
      return
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} mã cược đã chọn?`
      )
    ) {
      return
    }

    try {
      let deletedCount = 0

      for (const id of selectedIds) {
        const code = getBetCode(id)
        if (!code) continue

        if (code.isDraft) {
          removeDraftCode(id)
        } else {
          removeBetCode(id)
        }
        deletedCount++

        // Nếu có nhiều mã cược, thêm delay nhỏ để không block UI
        if (selectedIds.length > 10) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      if (deletedCount > 0) {
        toast.success(`Đã xóa ${deletedCount} mã cược`)
        onClearSelection()
      }
    } catch (error) {
      console.error('Lỗi khi xóa nhiều mã cược:', error)
      toast.error('Lỗi: ' + error.message)
    }
  }

  const handlePrintSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info('Chưa có mã cược nào được chọn để in')
      return
    }

    try {
      setPrinting(true)

      // Get selected bet codes
      const betCodes = selectedIds
        .map((id) => getBetCode(id))
        .filter((code) => code !== undefined)

      if (betCodes.length === 0) {
        toast.error('Không tìm thấy mã cược đã chọn')
        return
      }

      // Tính tổng tiền và tiềm năng
      const totalStake = betCodes.reduce(
        (sum, code) => sum + (code.stakeAmount || 0),
        0
      )
      const totalPotential = betCodes.reduce(
        (sum, code) => sum + (code.potentialWinning || 0),
        0
      )

      // Create PDF with multiple bet codes
      const pdfBlob = await exportMultipleBetCodesToPDF(
        betCodes,
        `Danh sách ${betCodes.length} mã cược (${totalStake.toLocaleString()}đ)`
      )

      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `DanhSachMaCuoc_${betCodes.length}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Free up URL object
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success(`Đã tạo PDF cho ${betCodes.length} mã cược`)
    } catch (error) {
      console.error('Lỗi khi in nhiều mã cược:', error)
      toast.error('Lỗi khi tạo PDF: ' + error.message)
    } finally {
      setPrinting(false)
    }
  }

  // Hiển thị số lượng mã đã lưu/chưa lưu đã chọn
  const selectionSummary = () => {
    if (draftCount > 0 && confirmedCount > 0) {
      return `${selectedIds.length} (${draftCount} nháp, ${confirmedCount} đã lưu)`
    }
    return selectedIds.length
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-2'>
          <MoreHorizontal className='h-4 w-4 mr-1' />
          {selectionSummary()} đã chọn
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Thao tác hàng loạt</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {draftCount > 0 && (
            <DropdownMenuItem
              onClick={handleConfirmSelected}
              disabled={saving}
              className='text-green-700 focus:text-green-800'>
              {saving ? (
                <>
                  <span className='h-4 w-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin mr-2'></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <BookmarkCheck className='h-4 w-4 mr-2' />
                  Lưu {draftCount} mã cược nháp
                </>
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handlePrintSelected} disabled={printing}>
            {printing ? (
              <>
                <span className='h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2'></span>
                Đang tạo PDF...
              </>
            ) : (
              <>
                <Download className='h-4 w-4 mr-2' />
                Tải PDF {selectedIds.length} mã cược
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onClearSelection}>
          <RotateCcw className='h-4 w-4 mr-2' />
          Bỏ chọn tất cả
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDeleteSelected}
          className='text-destructive focus:text-destructive'>
          <Trash2 className='h-4 w-4 mr-2' />
          Xóa {selectedIds.length} mã đã chọn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultipleActionsButton
