import React from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { BET_CODE_STATUS } from '@/config/constants'
import { exportToPdf } from '@/services/export/pdfExporter'

const BetCodeDetailModal = ({ open, onOpenChange, betCode }) => {
  if (!betCode) return null

  const getStatusText = (status) => {
    switch (status) {
      case BET_CODE_STATUS.PENDING:
        return 'Chờ xử lý'
      case BET_CODE_STATUS.VERIFIED:
        return 'Đã đối soát'
      case BET_CODE_STATUS.DELETED:
        return 'Đã xóa'
      default:
        return 'Không xác định'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = () => {
    exportToPdf([betCode], `MaCuoc_${betCode.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Chi tiết mã cược #{betCode.id}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về mã cược và kết quả xử lý
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <div>
              <span className='text-sm font-medium'>Trạng thái: </span>
              <span
                className={`text-sm ${
                  betCode.status === BET_CODE_STATUS.VERIFIED
                    ? 'text-green-600'
                    : betCode.status === BET_CODE_STATUS.DELETED
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                {getStatusText(betCode.status)}
              </span>
            </div>
            <div className='text-sm text-muted-foreground'>
              {format(new Date(betCode.createdAt), 'HH:mm - EEEE, dd/MM/yyyy', {
                locale: vi,
              })}
            </div>
          </div>

          <div className='bg-muted p-3 rounded-md'>
            <div className='font-medium mb-1'>Nội dung mã cược:</div>
            <div className='whitespace-pre-wrap'>{betCode.content}</div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium mb-1'>Tổng tiền cược:</div>
              <div className='text-lg font-semibold'>
                {betCode.stakeAmount?.toLocaleString() || 0} đ
              </div>
            </div>
            <div>
              <div className='text-sm font-medium mb-1'>Tiềm năng thắng:</div>
              <div className='text-lg font-semibold text-green-600'>
                {betCode.potentialWinning?.toLocaleString() || 0} đ
              </div>
            </div>
          </div>

          {betCode.parsedContent && betCode.parsedContent.length > 0 && (
            <div>
              <div className='font-medium mb-2'>Chi tiết các dòng cược:</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đài</TableHead>
                    <TableHead>Số</TableHead>
                    <TableHead>Kiểu</TableHead>
                    <TableHead className='text-right'>Tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {betCode.parsedContent.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {line.multiStation
                          ? line.station?.name
                          : line.station?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{line.numbers?.join(', ') || 'N/A'}</TableCell>
                      <TableCell>{line.betType?.name || 'N/A'}</TableCell>
                      <TableCell className='text-right'>
                        {line.amount?.toLocaleString() || 0} đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {betCode.errors && betCode.errors.length > 0 && (
            <div>
              <div className='font-medium mb-2 text-red-600'>
                Lỗi phát hiện:
              </div>
              <ul className='list-disc pl-5 space-y-1'>
                {betCode.errors.map((error, index) => (
                  <li key={index} className='text-sm text-red-600'>
                    {error.message || 'Lỗi không xác định'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='flex justify-end space-x-2 pt-2'>
            <Button variant='outline' size='sm' onClick={handlePrint}>
              <Printer className='h-4 w-4 mr-2' />
              In
            </Button>
            <Button variant='outline' size='sm' onClick={handleExportPdf}>
              <Download className='h-4 w-4 mr-2' />
              Xuất PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BetCodeDetailModal
