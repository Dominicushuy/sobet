// Update src/components/bet/MultipleActionsButton.jsx
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Save,
  Trash2,
  RotateCcw,
  PrinterCheck,
  Download,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'
import { useState } from 'react'
import { exportMultipleBetCodesToPDF } from '@/services/export/pdfExporter'

const MultipleActionsButton = ({ selectedIds, onClearSelection }) => {
  const { confirmDraftCode, removeBetCode, removeDraftCode, getBetCode } =
    useBetCode()
  const [printing, setPrinting] = useState(false)

  const handleConfirmSelected = () => {
    let confirmedCount = 0

    selectedIds.forEach((id) => {
      const code = getBetCode(id)
      if (code && code.isDraft) {
        confirmDraftCode(id)
        confirmedCount++
      }
    })

    if (confirmedCount > 0) {
      toast.success(`Đã lưu ${confirmedCount} mã cược`)
      onClearSelection()
    } else {
      toast.info('Không có mã cược nháp nào được chọn để lưu')
    }
  }

  const handleDeleteSelected = () => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} mã cược đã chọn?`
      )
    ) {
      return
    }

    let deletedCount = 0

    selectedIds.forEach((id) => {
      const code = getBetCode(id)
      if (!code) return

      if (code.isDraft) {
        removeDraftCode(id)
      } else {
        removeBetCode(id)
      }
      deletedCount++
    })

    if (deletedCount > 0) {
      toast.success(`Đã xóa ${deletedCount} mã cược`)
      onClearSelection()
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

      // Create PDF with multiple bet codes
      const pdfBlob = await exportMultipleBetCodesToPDF(
        betCodes,
        `Danh sách ${betCodes.length} mã cược`
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

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-2'>
          <MoreHorizontal className='h-4 w-4 mr-1' />
          {selectedIds.length} đã chọn
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Thao tác hàng loạt</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleConfirmSelected}>
          <Save className='h-4 w-4 mr-2' />
          Lưu các mã đã chọn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrintSelected} disabled={printing}>
          {printing ? (
            <>
              <span className='h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2'></span>
              Đang tạo PDF...
            </>
          ) : (
            <>
              <Download className='h-4 w-4 mr-2' />
              Tải PDF các mã đã chọn
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClearSelection}>
          <RotateCcw className='h-4 w-4 mr-2' />
          Bỏ chọn tất cả
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteSelected}
          className='text-destructive focus:text-destructive'>
          <Trash2 className='h-4 w-4 mr-2' />
          Xóa các mã đã chọn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultipleActionsButton
