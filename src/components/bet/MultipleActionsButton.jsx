// src/components/bet/MultipleActionsButton.jsx
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Download,
  BookmarkCheck,
  AlertTriangle,
  Loader2,
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
import { formatMoney } from '@/utils/formatters'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const MultipleActionsButton = ({ selectedIds, onClearSelection }) => {
  const { confirmDraftCode, removeBetCode, removeDraftCode, getBetCode } =
    useBetCode()

  const [printing, setPrinting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 })

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

  // Get selected bet codes summary
  const getSelectionSummary = () => {
    const betCodes = selectedIds
      .map((id) => getBetCode(id))
      .filter((code) => code !== undefined)

    // Calculate totals
    const totalStake = betCodes.reduce(
      (sum, code) => sum + (code.stakeAmount || 0),
      0
    )

    const totalPotential = betCodes.reduce(
      (sum, code) => sum + (code.potentialWinning || 0),
      0
    )

    return { count: betCodes.length, totalStake, totalPotential }
  }

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
    setShowDeleteConfirm(false)
    if (selectedIds.length === 0) {
      toast.info('Chưa có mã cược nào được chọn để xóa')
      return
    }

    try {
      setDeleteProgress({ current: 0, total: selectedIds.length })
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
        setDeleteProgress({ current: deletedCount, total: selectedIds.length })

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
    } finally {
      setDeleteProgress({ current: 0, total: 0 })
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

  const summary = getSelectionSummary()

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8'>
            <MoreHorizontal className='h-3.5 w-3.5 mr-1.5' />
            <span>
              {selectedIds.length} đã chọn
              {draftCount > 0 && confirmedCount > 0 && (
                <span className='hidden sm:inline'>
                  {' '}
                  ({draftCount} nháp, {confirmedCount} đã lưu)
                </span>
              )}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-64'>
          <DropdownMenuLabel className='flex justify-between items-center'>
            <span>Tác vụ hàng loạt</span>
            <Badge variant='outline' className='font-normal'>
              {selectedIds.length} mã
            </Badge>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <div className='px-2 py-1.5 text-xs'>
            <div className='grid grid-cols-2 gap-1 text-muted-foreground'>
              <div>Tiền đóng:</div>
              <div className='text-right font-medium text-blue-600'>
                {formatMoney(summary.totalStake)}đ
              </div>
              <div>Tiềm năng thắng:</div>
              <div className='text-right font-medium text-green-600'>
                {formatMoney(summary.totalPotential)}đ
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {draftCount > 0 && (
              <DropdownMenuItem
                onClick={handleConfirmSelected}
                disabled={saving}
                className='text-green-700 focus:text-green-800'>
                {saving ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
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
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
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
            onClick={() => setShowDeleteConfirm(true)}
            className='text-destructive focus:text-destructive'>
            <Trash2 className='h-4 w-4 mr-2' />
            Xóa {selectedIds.length} mã đã chọn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-destructive' />
              Xác nhận xóa {selectedIds.length} mã cược
            </DialogTitle>
            <DialogDescription>
              Bạn đang xóa {draftCount > 0 && `${draftCount} mã cược nháp`}
              {draftCount > 0 && confirmedCount > 0 && ' và '}
              {confirmedCount > 0 && `${confirmedCount} mã cược đã lưu`}. Thao
              tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deleteProgress.total > 0 && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Đang xóa...</span>
                <span>
                  {deleteProgress.current}/{deleteProgress.total}
                </span>
              </div>
              <div className='w-full bg-muted rounded-full h-2.5'>
                <div
                  className='bg-destructive h-2.5 rounded-full'
                  style={{
                    width: `${
                      (deleteProgress.current / deleteProgress.total) * 100
                    }%`,
                  }}></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteProgress.total > 0}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteSelected}
              disabled={deleteProgress.total > 0}>
              <Trash2 className='h-4 w-4 mr-1.5' />
              Xóa {selectedIds.length} mã cược
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MultipleActionsButton
