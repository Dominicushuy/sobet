// src/components/bet/BetCodeCard.jsx (cập nhật lần cuối)
import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  Edit,
  Trash2,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { format } from 'date-fns'
import { toast } from 'sonner'
import PrintBetCode from './PrintBetCode'
import EditBetCodeModal from './EditBetCodeModal'
import BetCodeDetailModal from './BetCodeDetailModal'

const BetCodeCard = ({
  betCode,
  isDraft = false,
  selectable = false,
  selected = false,
  onSelectChange = null,
}) => {
  const { removeDraftCode, removeBetCode, confirmDraftCode } = useBetCode()
  const [showDetails, setShowDetails] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleRemove = () => {
    if (isDraft) {
      removeDraftCode(betCode.id)
      toast.success('Đã xóa mã cược nháp')
    } else {
      if (confirm('Bạn có chắc chắn muốn xóa mã cược này?')) {
        removeBetCode(betCode.id)
        toast.success('Đã xóa mã cược')
      }
    }
  }

  const handleConfirm = () => {
    confirmDraftCode(betCode.id)
    toast.success('Đã lưu mã cược')
  }

  const handleOpenPrint = () => {
    setIsPrintOpen(true)
  }

  const handleClosePrint = () => {
    setIsPrintOpen(false)
  }

  const handleOpenEdit = () => {
    setIsEditOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
  }

  const handleOpenDetail = () => {
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
  }

  // Format creation date
  const formattedDate = betCode.createdAt
    ? format(new Date(betCode.createdAt), 'HH:mm:ss dd/MM/yyyy')
    : 'N/A'

  return (
    <>
      <Card
        className={`transition-all ${
          isDraft ? 'border-dashed border-yellow-500' : 'border-solid'
        } ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            {selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelectChange}
                className='mr-1'
              />
            )}

            <div>
              <CardTitle className='text-base flex items-center'>
                {betCode.station?.name || 'Đài không xác định'}
                {isDraft ? (
                  <Badge
                    variant='outline'
                    className='ml-2 bg-yellow-100 text-yellow-800'>
                    Nháp
                  </Badge>
                ) : (
                  <Badge
                    variant='outline'
                    className='ml-2 bg-green-100 text-green-800'>
                    <CheckCircle2 className='h-3 w-3 mr-1' />
                    Đã lưu
                  </Badge>
                )}
              </CardTitle>
              <div className='text-xs text-muted-foreground mt-1'>
                Ngày tạo: {formattedDate}
              </div>
            </div>
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>
        </CardHeader>

        <CardContent className='py-2'>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div>
              <span className='text-muted-foreground'>Số mã cược:</span>{' '}
              {betCode.lines?.length || 0}
            </div>
            <div>
              <span className='text-muted-foreground'>Tiền cược:</span>{' '}
              {(betCode.stakeAmount || 0).toLocaleString()}đ
            </div>
            <div className='col-span-2'>
              <span className='text-muted-foreground'>Tiềm năng thắng:</span>{' '}
              <span className='font-medium text-green-600'>
                {(betCode.potentialWinning || 0).toLocaleString()}đ
              </span>
            </div>
          </div>

          {showDetails && (
            <div className='mt-3 border-t pt-3 text-sm'>
              <div className='font-medium mb-1'>Nội dung mã cược:</div>
              <pre className='bg-muted p-2 rounded-md text-xs overflow-x-auto'>
                {betCode.formattedText || betCode.originalText}
              </pre>

              {betCode.lines && betCode.lines.length > 0 && (
                <div className='mt-3'>
                  <div className='font-medium mb-1'>Chi tiết:</div>
                  <div className='space-y-2'>
                    {betCode.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className='bg-muted p-2 rounded-md text-xs'>
                        <div>
                          <span className='text-muted-foreground'>
                            Dòng {idx + 1}:
                          </span>{' '}
                          {line.originalLine}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Kiểu cược:
                          </span>{' '}
                          {line.betType?.alias || 'N/A'}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Số lượng số:
                          </span>{' '}
                          {line.numbers?.length || 0}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Số tiền:
                          </span>{' '}
                          {line.amount?.toLocaleString() || 0}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className='pt-2 gap-2 flex-wrap'>
          {isDraft ? (
            <>
              <Button
                variant='outline'
                size='sm'
                className='bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                onClick={handleConfirm}>
                <CheckCircle2 className='h-3 w-3 mr-1' />
                Lưu
              </Button>
              <Button variant='outline' size='sm' onClick={handleOpenEdit}>
                <Edit className='h-3 w-3 mr-1' />
                Sửa
              </Button>
              <Button variant='outline' size='sm' onClick={handleOpenDetail}>
                <FileText className='h-3 w-3 mr-1' />
                Chi tiết
              </Button>
              <Button variant='outline' size='sm' onClick={handleRemove}>
                <Trash2 className='h-3 w-3 mr-1' />
                Xóa
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={handleOpenEdit}>
                <Edit className='h-3 w-3 mr-1' />
                Sửa
              </Button>
              <Button variant='outline' size='sm' onClick={handleOpenDetail}>
                <FileText className='h-3 w-3 mr-1' />
                Chi tiết
              </Button>
              <Button variant='outline' size='sm' onClick={handleOpenPrint}>
                <Printer className='h-3 w-3 mr-1' />
                In
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-destructive hover:bg-destructive/10'
                onClick={handleRemove}>
                <Trash2 className='h-3 w-3 mr-1' />
                Xóa
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Print Preview Dialog */}
      {isPrintOpen && (
        <PrintBetCode
          betCode={betCode}
          isOpen={isPrintOpen}
          onClose={handleClosePrint}
        />
      )}

      {/* Edit Dialog */}
      {isEditOpen && (
        <EditBetCodeModal
          betCode={betCode}
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
        />
      )}

      {/* Detail Dialog */}
      {isDetailOpen && (
        <BetCodeDetailModal
          betCode={betCode}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onEdit={handleOpenEdit}
          onPrint={handleOpenPrint}
        />
      )}
    </>
  )
}

export default BetCodeCard
