// src/components/bet/BetCodeDetailModal.jsx
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Printer,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Info,
  Calculator,
  DollarSign,
  Award,
  Building,
  Hash,
  ListChecks,
} from 'lucide-react'
import { format } from 'date-fns'
import { formatMoney } from '@/utils/formatters'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const BetCodeDetailModal = ({ betCode, isOpen, onClose, onEdit, onPrint }) => {
  const { confirmDraftCode, removeBetCode, removeDraftCode } = useBetCode()

  // console.log('BetCodeDetailModal betCode:', betCode)

  const [activeTab, setActiveTab] = useState('general')

  if (!betCode) return null

  const formattedDate = betCode.createdAt
    ? format(new Date(betCode.createdAt), 'HH:mm:ss dd/MM/yyyy')
    : 'N/A'

  const handleConfirm = () => {
    confirmDraftCode(betCode.id)
    toast.success('Đã lưu mã cược')
    onClose()
  }

  const handleDelete = () => {
    if (betCode.isDraft) {
      removeDraftCode(betCode.id)
      toast.success('Đã xóa mã cược nháp')
    } else {
      if (confirm('Bạn có chắc chắn muốn xóa mã cược này?')) {
        removeBetCode(betCode.id)
        toast.success('Đã xóa mã cược')
      }
    }
    onClose()
  }

  const mapRegionName = (region) => {
    const regionMap = {
      north: 'Miền Bắc',
      central: 'Miền Trung',
      south: 'Miền Nam',
    }
    return regionMap[region] || region || 'Không xác định'
  }

  const mapStatusName = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      verified: 'Đã đối soát',
      deleted: 'Đã xóa',
    }
    return statusMap[status] || status || 'Chờ xử lý'
  }

  // Calculate original stake amount (before applying coefficient)
  const getOriginalStakeAmount = () => {
    if (!betCode.stakeAmount) return 0
    return Math.round(betCode.stakeAmount / 0.8) // Divide by 0.8 to get original amount
  }

  // Get all bet numbers from all lines
  const getAllNumbers = () => {
    if (!betCode.lines || !Array.isArray(betCode.lines)) return []

    const allNumbers = []
    betCode.lines.forEach((line) => {
      if (line.numbers && Array.isArray(line.numbers)) {
        allNumbers.push(...line.numbers)
      }
    })

    return allNumbers // Remove duplicates
  }

  const numbers = getAllNumbers()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='space-y-1'>
          <DialogTitle className='flex items-center gap-2'>
            <Info className='h-5 w-5 text-primary' />
            Chi tiết mã cược
            {betCode.isDraft ? (
              <Badge
                variant='outline'
                className='bg-yellow-100 text-yellow-800 ml-2'>
                Nháp
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='bg-green-100 text-green-800 ml-2'>
                <CheckCircle2 className='h-3 w-3 mr-1' />
                Đã lưu
              </Badge>
            )}
          </DialogTitle>
          <div className='text-sm text-muted-foreground flex items-center gap-1'>
            <Clock className='h-3.5 w-3.5' />
            {formattedDate}
            <span className='mx-1'>•</span>
            <span className='font-medium text-primary'>
              {betCode.id?.substring(0, 8) || 'N/A'}
            </span>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue='general'
          value={activeTab}
          onValueChange={setActiveTab}>
          <TabsList className='grid grid-cols-3 mb-4'>
            <TabsTrigger value='general' className='flex items-center gap-1.5'>
              <FileText className='h-3.5 w-3.5' />
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger value='lines' className='flex items-center gap-1.5'>
              <ListChecks className='h-3.5 w-3.5' />
              Chi tiết dòng
            </TabsTrigger>
            <TabsTrigger
              value='calculation'
              className='flex items-center gap-1.5'>
              <Calculator className='h-3.5 w-3.5' />
              Tính toán
            </TabsTrigger>
          </TabsList>

          <TabsContent value='general'>
            <Card>
              <CardContent className='p-6 space-y-5'>
                {/* Basic info */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <h3 className='text-sm font-medium flex items-center gap-1.5'>
                      <Building className='h-4 w-4 text-muted-foreground' />
                      Thông tin đài
                    </h3>
                    <div className='space-y-2 text-sm'>
                      <div className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='text-muted-foreground'>Đài:</div>
                        <div className='font-medium'>
                          {betCode.station?.name || 'Không xác định'}
                        </div>
                      </div>

                      <div className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='text-muted-foreground'>Vùng:</div>
                        <div className='font-medium'>
                          {mapRegionName(betCode.station?.region)}
                        </div>
                      </div>

                      {betCode.station?.multiStation && (
                        <div className='grid grid-cols-[120px_1fr] gap-2'>
                          <div className='text-muted-foreground'>
                            Số lượng đài:
                          </div>
                          <div className='font-medium'>
                            {betCode.station.count || 1}
                          </div>
                        </div>
                      )}

                      {betCode.station?.stations && (
                        <div className='grid grid-cols-[120px_1fr] gap-2'>
                          <div className='text-muted-foreground'>
                            Danh sách đài:
                          </div>
                          <div className='font-medium'>
                            {betCode.station.stations
                              .map((s) => s.name)
                              .join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <h3 className='text-sm font-medium flex items-center gap-1.5'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      Trạng thái
                    </h3>
                    <div className='space-y-2 text-sm'>
                      <div className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='text-muted-foreground'>Trạng thái:</div>
                        <div className='font-medium'>
                          {mapStatusName(betCode.status)}
                        </div>
                      </div>

                      <div className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='text-muted-foreground'>Loại:</div>
                        <div className='font-medium'>
                          {betCode.isDraft ? 'Nháp' : 'Đã lưu'}
                        </div>
                      </div>

                      <div className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='text-muted-foreground'>Số mã cược:</div>
                        <div className='font-medium'>
                          {betCode.lines?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Money summary */}
                <div className='grid grid-cols-3 gap-4 py-2'>
                  <div className='bg-muted p-3 rounded-lg'>
                    <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1.5'>
                      <DollarSign className='h-3.5 w-3.5' />
                      Tiền đặt
                    </div>
                    <div className='text-lg font-semibold'>
                      {formatMoney(getOriginalStakeAmount())}đ
                    </div>
                  </div>

                  <div className='bg-blue-50 p-3 rounded-lg'>
                    <div className='text-sm text-blue-700 mb-1 flex items-center gap-1.5'>
                      <DollarSign className='h-3.5 w-3.5' />
                      Tiền đóng
                    </div>
                    <div className='text-lg font-semibold text-blue-900'>
                      {formatMoney(betCode.stakeAmount || 0)}đ
                    </div>
                  </div>

                  <div className='bg-green-50 p-3 rounded-lg'>
                    <div className='text-sm text-green-700 mb-1 flex items-center gap-1.5'>
                      <Award className='h-3.5 w-3.5' />
                      Tiềm năng thắng
                    </div>
                    <div className='text-lg font-semibold text-green-900'>
                      {formatMoney(betCode.potentialWinning || 0)}đ
                    </div>
                  </div>
                </div>

                {/* Numbers list */}
                {numbers.length > 0 && (
                  <div className='space-y-3'>
                    <h3 className='text-sm font-medium flex items-center gap-1.5'>
                      <Hash className='h-4 w-4 text-muted-foreground' />
                      Tất cả số cược ({numbers.length})
                    </h3>
                    <div className='flex flex-wrap gap-1.5'>
                      {numbers.map((number, idx) => (
                        <Badge
                          key={idx}
                          variant='secondary'
                          className='font-medium bg-blue-50 text-blue-700 hover:bg-blue-100'>
                          {number}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Original bet code */}
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium flex items-center gap-1.5'>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                    Mã cược gốc
                  </h3>
                  <pre className='bg-muted p-3 rounded-lg text-xs whitespace-pre-wrap break-all'>
                    {betCode.originalText || 'N/A'}
                  </pre>
                </div>

                {betCode.formattedText &&
                  betCode.formattedText !== betCode.originalText && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-medium flex items-center gap-1.5'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        Mã cược đã định dạng
                      </h3>
                      <pre className='bg-muted p-3 rounded-lg text-xs whitespace-pre-wrap break-all'>
                        {betCode.formattedText}
                      </pre>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='lines'>
            <div className='space-y-4'>
              {betCode.lines && betCode.lines.length > 0 ? (
                betCode.lines.map((line, idx) => (
                  <Card key={idx}>
                    <CardContent className='p-4'>
                      <div className='flex justify-between items-center mb-3'>
                        <h3 className='font-medium flex items-center gap-1.5'>
                          <span className='inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs'>
                            {idx + 1}
                          </span>
                          Dòng {idx + 1}
                        </h3>
                        <Badge variant='outline' className='font-normal'>
                          {line.betType?.alias || 'N/A'}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm'>
                        <div>
                          <div className='text-muted-foreground mb-1'>
                            Nội dung dòng:
                          </div>
                          <div className='font-mono font-medium bg-muted px-2.5 py-1.5 rounded text-xs'>
                            {line.originalLine || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <div className='text-muted-foreground mb-1'>
                            Thông tin số:
                          </div>
                          <div className='flex flex-wrap gap-1'>
                            {line.numbers?.map((number, numIdx) => (
                              <Badge
                                key={numIdx}
                                variant='secondary'
                                className='bg-blue-50 text-blue-700'>
                                {number}
                              </Badge>
                            ))}
                            <Badge variant='outline' className='font-normal'>
                              {line.numbers?.length || 0} số
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <div className='text-muted-foreground mb-1'>
                            Kiểu cược:
                          </div>
                          <div className='font-medium'>
                            {line.betType?.alias || 'N/A'} (
                            {line.betType?.name || 'N/A'})
                          </div>
                        </div>

                        <div>
                          <div className='text-muted-foreground mb-1'>
                            Tiền cược:
                          </div>
                          <div className='font-medium text-blue-600'>
                            {formatMoney(line.amount || 0)}đ
                          </div>
                        </div>
                      </div>

                      {/* Additional bet types if available */}
                      {line.additionalBetTypes &&
                        line.additionalBetTypes.length > 0 && (
                          <div className='mt-4 pt-4 border-t'>
                            <h4 className='text-sm font-medium mb-2'>
                              Kiểu cược bổ sung:
                            </h4>
                            <div className='space-y-2'>
                              {line.additionalBetTypes.map((addBet, addIdx) => (
                                <div
                                  key={addIdx}
                                  className='grid grid-cols-2 gap-2 text-sm bg-muted p-2 rounded'>
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Kiểu cược:
                                    </span>{' '}
                                    <span className='font-medium'>
                                      {addBet.betType?.alias || 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className='text-muted-foreground'>
                                      Tiền cược:
                                    </span>{' '}
                                    <span className='font-medium'>
                                      {formatMoney(addBet.amount || 0)}đ
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  Không có thông tin chi tiết về các dòng cược.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='calculation'>
            <Card>
              <CardContent className='p-6 space-y-5'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-medium flex items-center gap-1.5'>
                    <Calculator className='h-4 w-4 text-muted-foreground' />
                    Tóm tắt tính toán
                  </h3>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='grid grid-cols-2 gap-y-2 gap-x-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>
                          Tiền đặt gốc:
                        </span>{' '}
                        <span className='font-medium'>
                          {formatMoney(getOriginalStakeAmount())}đ
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Tiền đóng thực tế:
                        </span>{' '}
                        <span className='font-medium text-blue-600'>
                          {formatMoney(betCode.stakeAmount || 0)}đ
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Hệ số nhân:
                        </span>{' '}
                        <span className='font-medium'>0.8</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Tiềm năng thắng:
                        </span>{' '}
                        <span className='font-medium text-green-600'>
                          {formatMoney(betCode.potentialWinning || 0)}đ
                        </span>
                      </div>
                      <div className='col-span-2 mt-1 pt-2 border-t border-muted-foreground/20'>
                        <span className='text-muted-foreground'>
                          Tỉ lệ thắng trên vốn:
                        </span>{' '}
                        <span className='font-medium text-amber-600'>
                          {betCode.stakeAmount
                            ? (
                                betCode.potentialWinning / betCode.stakeAmount
                              ).toFixed(2) + 'x'
                            : '0x'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {betCode.stakeDetails && betCode.stakeDetails.length > 0 && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-medium flex items-center gap-1.5'>
                      <DollarSign className='h-4 w-4 text-blue-600' />
                      Chi tiết tính tiền đặt
                    </h3>
                    <div className='space-y-3 max-h-60 overflow-y-auto pr-1'>
                      {betCode.stakeDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className='p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm'>
                          <div className='font-medium pb-2 text-blue-800'>
                            Dòng {idx + 1}: {detail.betTypeAlias || 'N/A'}
                          </div>

                          <div className='grid grid-cols-2 gap-2 mb-2'>
                            <div>
                              <span className='text-blue-700'>Số đài:</span>{' '}
                              <span className='font-medium'>
                                {detail.stationCount || 1}
                              </span>
                            </div>

                            {detail.numberCount && (
                              <div>
                                <span className='text-blue-700'>
                                  Số lượng số:
                                </span>{' '}
                                <span className='font-medium'>
                                  {detail.numberCount}
                                </span>
                              </div>
                            )}

                            {detail.combinationCount && (
                              <div>
                                <span className='text-blue-700'>Tổ hợp:</span>{' '}
                                <span className='font-medium'>
                                  {detail.combinationCount}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className='text-blue-700'>Tiền cược:</span>{' '}
                              <span className='font-medium'>
                                {formatMoney(detail.betAmount || 0)}đ
                              </span>
                            </div>

                            <div>
                              <span className='text-blue-700'>Hệ số:</span>{' '}
                              <span className='font-medium'>
                                {detail.betMultiplier || 0.8}
                              </span>
                            </div>
                          </div>

                          <div className='bg-blue-100 p-2 rounded text-xs'>
                            <span className='text-blue-700'>Công thức:</span>{' '}
                            <code className='font-mono'>
                              {detail.formula || 'N/A'}
                            </code>
                          </div>

                          <div className='mt-2 font-medium text-blue-800'>
                            <span>Kết quả:</span>{' '}
                            {formatMoney(detail.stake || 0)}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {betCode.prizeDetails && betCode.prizeDetails.length > 0 && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-medium flex items-center gap-1.5'>
                      <Award className='h-4 w-4 text-green-600' />
                      Chi tiết tiềm năng thắng
                    </h3>
                    <div className='space-y-3 max-h-60 overflow-y-auto pr-1'>
                      {betCode.prizeDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className='p-3 bg-green-50 border border-green-100 rounded-lg text-sm'>
                          <div className='font-medium pb-2 text-green-800'>
                            Dòng {idx + 1}: {detail.betTypeAlias || 'N/A'}
                          </div>

                          <div className='grid grid-cols-2 gap-2 mb-2'>
                            <div>
                              <span className='text-green-700'>Số đài:</span>{' '}
                              <span className='font-medium'>
                                {detail.stationCount || 1}
                              </span>
                            </div>

                            {detail.numberCount && (
                              <div>
                                <span className='text-green-700'>
                                  Số lượng số:
                                </span>{' '}
                                <span className='font-medium'>
                                  {detail.numberCount}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className='text-green-700'>Tiền cược:</span>{' '}
                              <span className='font-medium'>
                                {formatMoney(detail.betAmount || 0)}đ
                              </span>
                            </div>

                            <div>
                              <span className='text-green-700'>
                                Tỉ lệ thắng:
                              </span>{' '}
                              <span className='font-medium'>
                                {detail.payoutRate || 0}
                              </span>
                            </div>
                          </div>

                          <div className='bg-green-100 p-2 rounded text-xs'>
                            <span className='text-green-700'>Công thức:</span>{' '}
                            <code className='font-mono'>
                              {detail.formula || 'N/A'}
                            </code>
                          </div>

                          <div className='mt-2 font-medium text-green-800'>
                            <span>Tiềm năng thắng:</span>{' '}
                            {formatMoney(detail.potentialPrize || 0)}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className='space-x-2'>
          {betCode.isDraft ? (
            <>
              <Button variant='outline' size='sm' onClick={onEdit}>
                <Edit className='h-3.5 w-3.5 mr-1.5' />
                Sửa
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                onClick={handleConfirm}>
                <CheckCircle2 className='h-3.5 w-3.5 mr-1.5' />
                Lưu
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-destructive hover:bg-destructive/10'
                onClick={handleDelete}>
                <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                Xóa
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={onEdit}>
                <Edit className='h-3.5 w-3.5 mr-1.5' />
                Sửa
              </Button>
              <Button variant='outline' size='sm' onClick={onPrint}>
                <Printer className='h-3.5 w-3.5 mr-1.5' />
                In
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-destructive hover:bg-destructive/10'
                onClick={handleDelete}>
                <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                Xóa
              </Button>
            </>
          )}

          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            className={cn('ml-auto', activeTab !== 'general' && 'bg-muted')}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BetCodeDetailModal
