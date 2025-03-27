// src/components/bet/BetCodeDetailModal.jsx
import React from 'react'
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
import { Printer, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { formatMoney } from '@/utils/formatters'
import { useBetCode } from '@/contexts/BetCodeContext'
import { toast } from 'sonner'

const BetCodeDetailModal = ({ betCode, isOpen, onClose, onEdit, onPrint }) => {
  const { confirmDraftCode, removeBetCode, removeDraftCode } = useBetCode()

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Chi tiết mã cược
            {betCode.isDraft ? (
              <Badge
                variant='outline'
                className='bg-yellow-100 text-yellow-800'>
                Nháp
              </Badge>
            ) : (
              <Badge variant='outline' className='bg-green-100 text-green-800'>
                <CheckCircle2 className='h-3 w-3 mr-1' />
                Đã lưu
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='general'>
          <TabsList className='mb-4'>
            <TabsTrigger value='general'>Thông tin chung</TabsTrigger>
            <TabsTrigger value='lines'>Chi tiết dòng</TabsTrigger>
            <TabsTrigger value='calculation'>Tính toán</TabsTrigger>
          </TabsList>

          <TabsContent value='general'>
            <Card>
              <CardContent className='pt-6 space-y-4'>
                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                  <div>
                    <span className='font-medium text-sm'>ID:</span>
                    <div className='text-sm text-muted-foreground truncate'>
                      {betCode.id || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <span className='font-medium text-sm'>Ngày tạo:</span>
                    <div className='text-sm text-muted-foreground'>
                      {formattedDate}
                    </div>
                  </div>

                  <div>
                    <span className='font-medium text-sm'>Đài:</span>
                    <div className='text-sm text-muted-foreground'>
                      {betCode.station?.name || 'Không xác định'}
                    </div>
                  </div>

                  <div>
                    <span className='font-medium text-sm'>Vùng:</span>
                    <div className='text-sm text-muted-foreground'>
                      {mapRegionName(betCode.station?.region)}
                    </div>
                  </div>

                  {betCode.station?.multiStation && (
                    <div>
                      <span className='font-medium text-sm'>Số lượng đài:</span>
                      <div className='text-sm text-muted-foreground'>
                        {betCode.station.count || 1}
                      </div>
                    </div>
                  )}

                  {betCode.station?.stations && (
                    <div className='col-span-2'>
                      <span className='font-medium text-sm'>
                        Danh sách đài:
                      </span>
                      <div className='text-sm text-muted-foreground'>
                        {betCode.station.stations.map((s) => s.name).join(', ')}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className='font-medium text-sm'>Trạng thái:</span>
                    <div className='text-sm text-muted-foreground'>
                      {mapStatusName(betCode.status)}
                    </div>
                  </div>

                  <div>
                    <span className='font-medium text-sm'>Số dòng:</span>
                    <div className='text-sm text-muted-foreground'>
                      {betCode.lines?.length || 0}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 py-2'>
                  <div className='bg-blue-50 p-3 rounded'>
                    <span className='font-medium text-blue-800'>
                      Tiền cược:
                    </span>
                    <div className='text-xl font-semibold text-blue-900'>
                      {formatMoney(betCode.stakeAmount || 0)}đ
                    </div>
                  </div>

                  <div className='bg-green-50 p-3 rounded'>
                    <span className='font-medium text-green-800'>
                      Tiềm năng thắng:
                    </span>
                    <div className='text-xl font-semibold text-green-900'>
                      {formatMoney(betCode.potentialWinning || 0)}đ
                    </div>
                  </div>
                </div>

                <div>
                  <span className='font-medium text-sm'>Mã cược gốc:</span>
                  <pre className='mt-1 bg-muted p-2 rounded text-xs whitespace-pre-wrap break-all'>
                    {betCode.originalText || 'N/A'}
                  </pre>
                </div>

                {betCode.formattedText &&
                  betCode.formattedText !== betCode.originalText && (
                    <div>
                      <span className='font-medium text-sm'>
                        Mã cược đã định dạng:
                      </span>
                      <pre className='mt-1 bg-muted p-2 rounded text-xs whitespace-pre-wrap break-all'>
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
                    <CardContent className='pt-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <h3 className='font-medium'>Dòng {idx + 1}</h3>
                        <Badge variant='outline'>
                          {line.betType?.alias || 'N/A'}
                        </Badge>
                      </div>

                      <div className='text-sm space-y-1'>
                        <div className='grid grid-cols-2 gap-2'>
                          <div>
                            <span className='text-muted-foreground'>
                              Số cược:
                            </span>{' '}
                            {line.numbers?.join(', ') || 'N/A'}
                          </div>

                          <div>
                            <span className='text-muted-foreground'>
                              Số lượng:
                            </span>{' '}
                            {line.numbers?.length || 0}
                          </div>

                          <div>
                            <span className='text-muted-foreground'>
                              Kiểu cược:
                            </span>{' '}
                            {line.betType?.alias || 'N/A'} (
                            {line.betType?.name || 'N/A'})
                          </div>

                          <div>
                            <span className='text-muted-foreground'>
                              Tiền cược:
                            </span>{' '}
                            {formatMoney(line.amount || 0)}đ
                          </div>
                        </div>

                        <div className='mt-2 border-t pt-2'>
                          <span className='text-muted-foreground'>
                            Dòng gốc:
                          </span>{' '}
                          <code className='bg-muted px-1 py-0.5 rounded'>
                            {line.originalLine || 'N/A'}
                          </code>
                        </div>
                      </div>
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
              <CardContent className='pt-6 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <h3 className='font-medium text-sm mb-2'>
                      Tóm tắt tính toán
                    </h3>
                    <div className='bg-muted p-3 rounded-md text-sm'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <span className='font-medium'>Tiền cược gốc:</span>{' '}
                          {formatMoney(
                            betCode.stakeAmount ? betCode.stakeAmount / 0.8 : 0
                          )}
                          đ
                        </div>
                        <div>
                          <span className='font-medium'>
                            Tiền cược thực tế:
                          </span>{' '}
                          {formatMoney(betCode.stakeAmount || 0)}đ
                        </div>
                        <div>
                          <span className='font-medium'>Hệ số:</span> 0.8
                        </div>
                        <div>
                          <span className='font-medium'>Tiềm năng thắng:</span>{' '}
                          {formatMoney(betCode.potentialWinning || 0)}đ
                        </div>
                      </div>
                    </div>
                  </div>

                  {betCode.stakeDetails && betCode.stakeDetails.length > 0 && (
                    <div className='col-span-2'>
                      <h3 className='font-medium text-sm mb-2'>
                        Chi tiết tính tiền đặt
                      </h3>
                      <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                        {betCode.stakeDetails.map((detail, idx) => (
                          <div
                            key={idx}
                            className='bg-blue-50 p-3 rounded-md text-xs'>
                            <div className='grid grid-cols-2 gap-1'>
                              <div className='col-span-2'>
                                <span className='font-medium'>
                                  Dòng {idx + 1}:
                                </span>{' '}
                                {detail.originalLine || 'N/A'}
                              </div>

                              <div>
                                <span className='font-medium'>Kiểu cược:</span>{' '}
                                {detail.betTypeAlias || 'N/A'}
                              </div>

                              <div>
                                <span className='font-medium'>Số đài:</span>{' '}
                                {detail.stationCount || 1}
                              </div>

                              {detail.numberCount && (
                                <div>
                                  <span className='font-medium'>
                                    Số lượng số:
                                  </span>{' '}
                                  {detail.numberCount}
                                </div>
                              )}

                              {detail.combinationCount && (
                                <div>
                                  <span className='font-medium'>Tổ hợp:</span>{' '}
                                  {detail.combinationCount}
                                </div>
                              )}

                              <div>
                                <span className='font-medium'>Tiền cược:</span>{' '}
                                {formatMoney(detail.betAmount || 0)}đ
                              </div>

                              <div>
                                <span className='font-medium'>Hệ số:</span>{' '}
                                {detail.multiplier || 1}
                              </div>

                              <div className='col-span-2 mt-1 pt-1 border-t border-blue-100'>
                                <span className='font-medium'>Công thức:</span>{' '}
                                <code className='bg-blue-100 px-1 py-0.5 rounded'>
                                  {detail.formula || 'N/A'}
                                </code>
                              </div>

                              <div className='col-span-2 text-blue-800 font-medium'>
                                <span>Kết quả:</span>{' '}
                                {formatMoney(detail.stake || 0)}đ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {betCode.prizeDetails && betCode.prizeDetails.length > 0 && (
                    <div className='col-span-2'>
                      <h3 className='font-medium text-sm mb-2'>
                        Chi tiết tiềm năng thắng
                      </h3>
                      <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                        {betCode.prizeDetails.map((detail, idx) => (
                          <div
                            key={idx}
                            className='bg-green-50 p-3 rounded-md text-xs'>
                            <div className='grid grid-cols-2 gap-1'>
                              <div className='col-span-2'>
                                <span className='font-medium'>
                                  Dòng {idx + 1}:
                                </span>{' '}
                                {detail.originalLine || 'N/A'}
                              </div>

                              <div>
                                <span className='font-medium'>Kiểu cược:</span>{' '}
                                {detail.betTypeAlias || 'N/A'}
                              </div>

                              <div>
                                <span className='font-medium'>Số đài:</span>{' '}
                                {detail.stationCount || 1}
                              </div>

                              {detail.numberCount && (
                                <div>
                                  <span className='font-medium'>
                                    Số lượng số:
                                  </span>{' '}
                                  {detail.numberCount}
                                </div>
                              )}

                              <div>
                                <span className='font-medium'>Tiền cược:</span>{' '}
                                {formatMoney(detail.betAmount || 0)}đ
                              </div>

                              <div>
                                <span className='font-medium'>
                                  Tỉ lệ thắng:
                                </span>{' '}
                                {detail.payoutRate || 0}
                              </div>

                              <div className='col-span-2 mt-1 pt-1 border-t border-green-100'>
                                <span className='font-medium'>Công thức:</span>{' '}
                                <code className='bg-green-100 px-1 py-0.5 rounded'>
                                  {detail.formula || 'N/A'}
                                </code>
                              </div>

                              <div className='col-span-2 text-green-800 font-medium'>
                                <span>Tiềm năng thắng:</span>{' '}
                                {formatMoney(detail.potentialPrize || 0)}đ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className='flex gap-2 flex-wrap justify-end'>
            {betCode.isDraft ? (
              <>
                <Button variant='outline' size='sm' onClick={onEdit}>
                  <Edit className='h-4 w-4 mr-1' />
                  Sửa
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                  onClick={handleConfirm}>
                  <CheckCircle2 className='h-4 w-4 mr-1' />
                  Lưu
                </Button>
              </>
            ) : (
              <>
                <Button variant='outline' size='sm' onClick={onEdit}>
                  <Edit className='h-4 w-4 mr-1' />
                  Sửa
                </Button>
                <Button variant='outline' size='sm' onClick={onPrint}>
                  <Printer className='h-4 w-4 mr-1' />
                  In
                </Button>
              </>
            )}

            <Button
              variant='outline'
              size='sm'
              className='text-destructive hover:bg-destructive/10'
              onClick={handleDelete}>
              <Trash2 className='h-4 w-4 mr-1' />
              Xóa
            </Button>

            <Button variant='secondary' size='sm' onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BetCodeDetailModal
