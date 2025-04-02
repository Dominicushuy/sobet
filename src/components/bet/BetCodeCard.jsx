// src/components/bet/BetCodeCard.jsx
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
  Clock,
  Hash,
  DollarSign,
  Award,
  Eye,
  Copy,
  Scissors,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { format } from 'date-fns'
import { toast } from 'sonner'
import PrintBetCode from './PrintBetCode'
import BetCodeDetailModal from './BetCodeDetailModal'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import { defaultBetTypes } from '@/config/defaults'

const BetCodeCard = ({
  betCode,
  isDraft = false,
  selectable = false,
  selected = false,
  onSelectChange = null,
}) => {
  const { removeDraftCode, removeBetCode, confirmDraftCode } = useBetCode()

  const [showDetails, setShowDetails] = useState(false)
  const [showFullCode, setShowFullCode] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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

  const handleCopyText = () => {
    try {
      // Sử dụng Clipboard API
      navigator.clipboard
        .writeText(betCode.originalText || betText)
        .then(() => {
          setIsCopied(true)
          toast.success('Đã sao chép mã cược')

          // Tự động reset lại trạng thái sau 2 giây
          setTimeout(() => {
            setIsCopied(false)
          }, 2000)
        })
    } catch (err) {
      toast.error('Sao chép thất bại')
      console.error('Copy failed', err)
    }
  }

  const handleOpenPrint = () => setIsPrintOpen(true)
  const handleClosePrint = () => setIsPrintOpen(false)
  const handleOpenDetail = () => setIsDetailOpen(true)
  const handleCloseDetail = () => setIsDetailOpen(false)

  // Format date
  const formattedDate = betCode.createdAt
    ? format(new Date(betCode.createdAt), 'HH:mm dd/MM/yyyy')
    : 'N/A'

  // Get station display name
  const getStationDisplayName = () => {
    if (!betCode.station) return 'Đài không xác định'

    let displayName = betCode.station.name || 'Đài không xác định'

    if (betCode.station.multiStation && betCode.station.count > 1) {
      displayName = `${displayName} (${betCode.station.count})`
    }

    if (betCode.station.stations && betCode.station.stations.length > 0) {
      displayName = betCode.station.stations.map((s) => s.name).join(', ')
    }

    return displayName
  }

  // Get original stake amount from the bet code
  const getOriginalStakeAmount = () => {
    if (!betCode.lines || !Array.isArray(betCode.lines)) return 0

    // console.log('Bet code lines:', betCode.lines)

    // Sum up the original amount from all lines
    return betCode.lines.reduce((total, line) => {
      // Original amount in bet code is the base amount × 1000
      return total + (line.amount || 0)
    }, 0)
  }

  // Get all bet numbers from all lines
  const getAllNumbers = () => {
    if (!betCode.lines || !Array.isArray(betCode.lines)) return []

    const allNumbers = []
    betCode.lines.forEach((line) => {
      if (line.numbers && Array.isArray(line.numbers)) {
        // Thêm các số cơ bản
        allNumbers.push(...line.numbers)

        // Thêm các số hoán vị nếu có
        line.numbers.forEach((number) => {
          // Kiểm tra xem số có permutations không
          const perms =
            (line.permutations && line.permutations[number]) ||
            (betCode.permutations && betCode.permutations[number]) ||
            []

          // Thêm tất cả các số hoán vị trừ số gốc (đã được thêm ở trên)
          perms.forEach((perm) => {
            if (perm !== number && !allNumbers.includes(perm)) {
              allNumbers.push(perm)
            }
          })
        })
      }
    })

    return allNumbers
  }

  // console.log('BetCodeCard - Bet Code:', betCode)

  // Lấy thông tin kiểu cược từ dòng đầu tiên
  const getBetTypeNames = () => {
    if (
      !betCode.lines ||
      !Array.isArray(betCode.lines) ||
      betCode.lines.length === 0 ||
      !betCode.lines[0].betType
    ) {
      return 'N/A'
    }

    const line = betCode.lines[0]
    const betTypeAlias = line.betType.alias?.toLowerCase() || ''

    // Tìm thông tin đầy đủ từ defaultBetTypes
    const betType = defaultBetTypes.find((type) =>
      type.aliases.some((a) => a.toLowerCase() === betTypeAlias)
    )

    if (betType) {
      return `${betTypeAlias} (${betType.name})`
    }

    return betTypeAlias || 'N/A'
  }

  const numbers = getAllNumbers()
  const betText = betCode.originalText || 'N/A'

  return (
    <>
      <Card
        className={cn(
          'transition-all hover:shadow-md',
          isDraft ? 'border-dashed border-yellow-300' : 'border-solid',
          selected ? 'ring-2 ring-primary' : ''
        )}>
        <CardHeader className='py-3 px-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-start gap-2'>
              {selectable && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={onSelectChange}
                  className='mt-1'
                />
              )}

              <div>
                <CardTitle className='text-base flex items-center gap-2'>
                  {getStationDisplayName()}
                  {isDraft ? (
                    <Badge className='bg-yellow-100 text-yellow-800 font-normal text-xs'>
                      Nháp
                    </Badge>
                  ) : (
                    <Badge className='bg-green-100 text-green-800 font-normal text-xs'>
                      <CheckCircle2 className='h-3 w-3 mr-1' />
                      Đã lưu
                    </Badge>
                  )}
                </CardTitle>
                <div className='text-xs text-muted-foreground mt-1 flex items-center'>
                  <Clock className='h-3 w-3 mr-1' />
                  {formattedDate}
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
          </div>
        </CardHeader>

        <CardContent className='px-4 py-0 pb-2 space-y-2'>
          {/* Simplified bet code - always visible */}
          <div className='text-xs bg-muted/50 p-2 rounded'>
            <div className='text-xs bg-muted/50 p-2 rounded relative group'>
              <pre
                className='whitespace-pre-wrap pr-8'
                onClick={handleCopyText}>
                {betText}
              </pre>

              {/* Nút copy */}
              <Button
                variant='ghost'
                size='icon'
                className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={handleCopyText}>
                {isCopied ? (
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
            {betText.length > 60 && (
              <Button
                variant='link'
                size='sm'
                className='px-1 h-5 text-xs'
                onClick={() => setShowFullCode(!showFullCode)}>
                {showFullCode ? 'Thu gọn' : 'Xem đầy đủ'}
              </Button>
            )}
          </div>

          {/* Key information in a compact form */}
          <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-sm'>
            <div className='flex items-center gap-1'>
              <Tag className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-muted-foreground'>Kiểu cược:</span>{' '}
              <span className='font-medium'>{getBetTypeNames()}</span>
            </div>
            <div className='flex items-center gap-1'>
              <DollarSign className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-muted-foreground'>Tiền đặt:</span>{' '}
              <span className='font-medium'>
                {formatMoney(getOriginalStakeAmount())}đ
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <DollarSign className='h-3.5 w-3.5 text-blue-500' />
              <span className='text-muted-foreground'>Tiền đóng:</span>{' '}
              <span className='font-medium text-blue-600'>
                {formatMoney(betCode.stakeAmount || 0)}đ
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Award className='h-3.5 w-3.5 text-green-500' />
              <span className='text-muted-foreground'>Thắng:</span>{' '}
              <span className='font-medium text-green-600'>
                {formatMoney(betCode.potentialWinning || 0)}đ
              </span>
            </div>
          </div>

          {/* Numbers list */}
          {numbers.length > 0 && (
            <div className='mt-2 mb-1'>
              <div className='flex items-center gap-1 mb-1'>
                <Tag className='h-3 w-3 text-blue-600' />
                <span className='text-xs text-muted-foreground'>
                  Số cược ({numbers.length}):
                </span>
              </div>
              <div className='flex flex-wrap gap-2 max-h-16 overflow-y-auto pr-1'>
                {numbers.map((number, idx) => (
                  <Badge
                    key={idx}
                    variant='outline'
                    className='font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 text-xs'>
                    {number}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Details - only visible when expanded */}
          {showDetails && (
            <div className='mt-2 pt-2 border-t text-sm space-y-3'>
              {betCode.lines && betCode.lines.length > 0 && (
                <div className='space-y-2'>
                  <div className='font-medium text-xs flex items-center gap-1'>
                    <Eye className='h-3.5 w-3.5' />
                    Chi tiết dòng:
                  </div>
                  <div className='grid gap-1.5 max-h-60 overflow-y-auto pr-1'>
                    {betCode.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className='bg-muted/50 p-2 rounded-md text-xs grid grid-cols-2 gap-x-2 gap-y-0.5'>
                        <div className='col-span-2 font-medium text-muted-foreground pb-1'>
                          Dòng {idx + 1}: {line.originalLine}
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Kiểu:</span>{' '}
                          <span className='font-medium'>
                            {line.betType?.alias || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Tiền:</span>{' '}
                          <span className='font-medium'>
                            {formatMoney(line.amount || 0)}đ
                          </span>
                        </div>
                        <div className='col-span-2'>
                          <span className='text-muted-foreground'>Số:</span>{' '}
                          <span className='font-medium'>
                            {line.numbers?.join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {betCode.formattedText &&
                betCode.formattedText !== betCode.originalText && (
                  <div>
                    <div className='font-medium text-xs flex items-center gap-1 mb-1'>
                      <FileText className='h-3.5 w-3.5' />
                      Mã cược đã định dạng:
                    </div>
                    <pre className='bg-muted/50 p-2 rounded-md text-xs overflow-x-auto whitespace-pre-wrap'>
                      {betCode.formattedText}
                    </pre>
                  </div>
                )}
            </div>
          )}
        </CardContent>

        <CardFooter className='px-4 py-2 gap-2 flex-wrap border-t'>
          {isDraft ? (
            <>
              <Button
                variant='outline'
                size='sm'
                className='bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                onClick={handleConfirm}>
                <CheckCircle2 className='h-3 w-3 mr-1' />
                Lưu
              </Button>
              <Button variant='outline' size='sm' onClick={handleOpenDetail}>
                <FileText className='h-3 w-3 mr-1' />
                Chi tiết
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='ml-auto text-rose-600 hover:bg-rose-50'
                onClick={handleRemove}>
                <Trash2 className='h-3 w-3 mr-1' />
                Xóa
              </Button>
            </>
          ) : (
            <>
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
                className='ml-auto text-rose-600 hover:bg-rose-50'
                onClick={handleRemove}>
                <Trash2 className='h-3 w-3 mr-1' />
                Xóa
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Modal dialogs */}
      {isPrintOpen && (
        <PrintBetCode
          betCode={betCode}
          isOpen={isPrintOpen}
          onClose={handleClosePrint}
        />
      )}
      {isDetailOpen && (
        <BetCodeDetailModal
          betCode={betCode}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onPrint={handleOpenPrint}
        />
      )}
    </>
  )
}

export default BetCodeCard
