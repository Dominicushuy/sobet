// src/components/bet/MultipleActionsButton.jsx
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Save,
  Trash2,
  RotateCcw,
  PrinterCheck,
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

const MultipleActionsButton = ({ selectedIds, onClearSelection }) => {
  const { confirmDraftCode, removeBetCode, removeDraftCode, getBetCode } =
    useBetCode()

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

  const handlePrintSelected = () => {
    toast.info('Chức năng in đang được phát triển')
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
        <DropdownMenuItem onClick={handlePrintSelected}>
          <PrinterCheck className='h-4 w-4 mr-2' />
          In các mã đã chọn
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
