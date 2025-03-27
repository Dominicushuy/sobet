// src/components/bet/PrintBetCode.jsx
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, Download, CheckCircle2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { exportBetCodeToPDF } from '@/services/export/pdfExporter'
import { toast } from 'sonner'
import { formatMoney } from '@/utils/formatters'

const PrintBetCode = ({ betCode, isOpen, onClose }) => {
  const [printing, setPrinting] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handlePrint = async () => {
    if (!betCode) return

    try {
      setPrinting(true)
      const pdfBlob = await exportBetCodeToPDF(betCode)

      // Create a download link and trigger download
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `MaCuoc_${betCode.id?.substring(0, 8) || 'unknown'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Free the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success('Đã tạo PDF thành công!')
      onClose()
    } catch (error) {
      console.error('Lỗi khi in mã cược:', error)
      toast.error('Lỗi khi tạo PDF: ' + error.message)
    } finally {
      setPrinting(false)
    }
  }

  if (!betCode) return null

  const formattedDate = betCode.createdAt
    ? format(new Date(betCode.createdAt), 'HH:mm:ss dd/MM/yyyy')
    : 'N/A'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>In mã cược</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue='preview'
          value={activeTab}
          onValueChange={setActiveTab}>
          <TabsList className='mb-4'>
            <TabsTrigger value='preview'>Xem trước</TabsTrigger>
            <TabsTrigger value='details'>Chi tiết</TabsTrigger>
          </TabsList>

          <TabsContent value='preview' className='min-h-[400px]'>
            <div className='border rounded-md p-4 mb-4 bg-white'>
              <div className='text-center mb-6'>
                <h2 className='text-lg font-bold uppercase'>PHIẾU MÃ CƯỢC</h2>
                <div className='flex justify-between text-xs mt-2'>
                  <div>Mã phiếu: {betCode.id?.substring(0, 8) || 'N/A'}</div>
                  <div>Ngày tạo: {formattedDate}</div>
                </div>
              </div>

              <div className='mb-4'>
                <h3 className='text-sm font-semibold mb-2'>Thông tin cược:</h3>
                <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                  <div>
                    <span className='font-medium'>Đài:</span>{' '}
                    {betCode.station?.name || 'Không xác định'}
                  </div>
                  {betCode.station?.multiStation && betCode.station?.count && (
                    <div>
                      <span className='font-medium'>Số lượng đài:</span>{' '}
                      {betCode.station.count}
                    </div>
                  )}
                  {betCode.station?.stations &&
                    betCode.station?.stations.length > 0 && (
                      <div className='col-span-2'>
                        <span className='font-medium'>Đài:</span>{' '}
                        {betCode.station.stations.map((s) => s.name).join(', ')}
                      </div>
                    )}
                  <div>
                    <span className='font-medium'>Tổng Số mã cược:</span>{' '}
                    {betCode.lines?.length || 0}
                  </div>
                  <div>
                    <span className='font-medium'>Tiền cược:</span>{' '}
                    {formatMoney(betCode.stakeAmount || 0)}đ
                  </div>
                  <div>
                    <span className='font-medium'>Tiềm năng thắng:</span>{' '}
                    {formatMoney(betCode.potentialWinning || 0)}đ
                  </div>
                </div>
              </div>

              <hr className='my-4' />

              <div>
                <h3 className='text-sm font-semibold mb-2'>
                  Chi tiết các dòng cược:
                </h3>
                <table className='w-full text-xs'>
                  <thead>
                    <tr className='bg-muted'>
                      <th className='p-1 text-left'>STT</th>
                      <th className='p-1 text-left'>Số cược</th>
                      <th className='p-1 text-left'>Kiểu</th>
                      <th className='p-1 text-right'>Tiền cược</th>
                      <th className='p-1 text-right'>Tiềm năng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {betCode.lines &&
                      betCode.lines.map((line, index) => (
                        <tr key={index} className='border-b'>
                          <td className='p-1'>{index + 1}</td>
                          <td className='p-1'>
                            {line.numbers?.join(', ') || 'N/A'}
                          </td>
                          <td className='p-1'>
                            {line.betType?.alias || 'N/A'}
                          </td>
                          <td className='p-1 text-right'>
                            {formatMoney(line.amount || 0)}đ
                          </td>
                          <td className='p-1 text-right'>
                            {formatMoney(
                              calculatePotential(
                                line.betType?.alias,
                                line.amount
                              )
                            )}
                            đ
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-6'>
                <h3 className='text-sm font-semibold mb-1'>Mã cược gốc:</h3>
                <pre className='text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all'>
                  {betCode.formattedText || betCode.originalText || ''}
                </pre>
              </div>

              <div className='flex justify-between mt-6 text-xs text-muted-foreground'>
                <div>Phiếu này chỉ có giá trị tham khảo.</div>
                <div>In lúc: {format(new Date(), 'HH:mm:ss dd/MM/yyyy')}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='details'>
            <Card>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-sm font-semibold mb-2'>
                      Thông tin cược chi tiết:
                    </h3>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div>
                        <span className='font-medium'>ID:</span>{' '}
                        {betCode.id || 'N/A'}
                      </div>
                      <div>
                        <span className='font-medium'>Ngày tạo:</span>{' '}
                        {formattedDate}
                      </div>
                      <div>
                        <span className='font-medium'>Đài:</span>{' '}
                        {betCode.station?.name || 'Không xác định'}
                      </div>
                      <div>
                        <span className='font-medium'>Vùng:</span>{' '}
                        {mapRegionName(betCode.station?.region)}
                      </div>
                      <div>
                        <span className='font-medium'>Trạng thái:</span>{' '}
                        {mapStatusName(betCode.status)}
                      </div>
                      <div>
                        <span className='font-medium'>Loại:</span>{' '}
                        {betCode.isDraft ? 'Nháp' : 'Đã lưu'}
                      </div>
                      <div className='col-span-2'>
                        <span className='font-medium'>Tiền cược:</span>{' '}
                        {formatMoney(betCode.stakeAmount || 0)}đ
                      </div>
                      <div className='col-span-2'>
                        <span className='font-medium'>Tiềm năng thắng:</span>{' '}
                        {formatMoney(betCode.potentialWinning || 0)}đ
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-semibold mb-2'>Mã cược gốc:</h3>
                    <pre className='text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all'>
                      {betCode.originalText || ''}
                    </pre>
                  </div>

                  {betCode.formattedText &&
                    betCode.formattedText !== betCode.originalText && (
                      <div>
                        <h3 className='text-sm font-semibold mb-2'>
                          Mã cược đã định dạng:
                        </h3>
                        <pre className='text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all'>
                          {betCode.formattedText}
                        </pre>
                      </div>
                    )}

                  <div>
                    <h3 className='text-sm font-semibold mb-2'>
                      Chi tiết dòng ({betCode.lines?.length || 0}):
                    </h3>
                    {betCode.lines &&
                      betCode.lines.map((line, idx) => (
                        <div
                          key={idx}
                          className='bg-muted p-2 rounded mb-2 text-xs'>
                          <div className='font-medium'>Dòng {idx + 1}:</div>
                          <div className='grid grid-cols-2 gap-1 mt-1'>
                            <div>
                              <span className='font-medium'>Số cược:</span>{' '}
                              {line.numbers?.join(', ') || 'N/A'}
                            </div>
                            <div>
                              <span className='font-medium'>Kiểu cược:</span>{' '}
                              {line.betType?.alias || 'N/A'}
                            </div>
                            <div>
                              <span className='font-medium'>Tiền cược:</span>{' '}
                              {formatMoney(line.amount || 0)}đ
                            </div>
                            <div>
                              <span className='font-medium'>Tiềm năng:</span>{' '}
                              {formatMoney(
                                calculatePotential(
                                  line.betType?.alias,
                                  line.amount
                                )
                              )}
                              đ
                            </div>
                          </div>
                          <div className='mt-1'>
                            <span className='font-medium'>Dòng gốc:</span>{' '}
                            {line.originalLine || 'N/A'}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className='flex justify-between'>
          <div>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setActiveTab(activeTab === 'preview' ? 'details' : 'preview')
              }
              className='mr-2'>
              <FileText className='h-4 w-4 mr-1' />
              {activeTab === 'preview' ? 'Xem chi tiết' : 'Xem trước'}
            </Button>
          </div>

          <div>
            <Button
              variant='outline'
              size='sm'
              onClick={onClose}
              className='mr-2'>
              Đóng
            </Button>

            <Button onClick={handlePrint} disabled={printing} size='sm'>
              {printing ? (
                <span className='flex items-center'>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1'></span>
                  Đang tạo...
                </span>
              ) : (
                <>
                  <Download className='h-4 w-4 mr-1' />
                  Tải PDF
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Tính tiềm năng thắng dựa trên kiểu cược và số tiền
 */
function calculatePotential(betType, amount) {
  if (!betType || !amount) return 0

  // Tỉ lệ thắng cược dựa trên kiểu cược
  const rates = {
    dd: 75, // Đầu đuôi
    b: 75, // Bao lô (2 chữ số)
    xc: 650, // Xỉu chủ
    dau: 75, // Đầu
    duoi: 75, // Đuôi
    da: 750, // Đá
    xien: 350, // Xiên (2 số)
    nt: 75, // Nhất to
    b7l: 75, // Bao lô 7
    b8l: 75, // Bao lô 8
  }

  // Lấy tỉ lệ dựa trên kiểu cược, mặc định = 75
  const rate = rates[betType.toLowerCase()] || 75

  // Tính tiềm năng thắng
  return amount * rate
}

/**
 * Map trạng thái thành tên hiển thị
 */
function mapStatusName(status) {
  const statusMap = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    verified: 'Đã đối soát',
    deleted: 'Đã xóa',
  }

  return statusMap[status] || status || 'Chờ xử lý'
}

/**
 * Map vùng thành tên hiển thị
 */
function mapRegionName(region) {
  const regionMap = {
    north: 'Miền Bắc',
    central: 'Miền Trung',
    south: 'Miền Nam',
  }

  return regionMap[region] || region || 'Không xác định'
}

export default PrintBetCode
