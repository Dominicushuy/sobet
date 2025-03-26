// src/components/chat/ChatMessage.jsx
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  ChevronDown,
  ChevronUp,
  CopyCheck,
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Share2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const ChatMessage = ({ message, onUseFixedBetCode }) => {
  const isBot = message.sender === 'bot'
  const isError = message.type === 'error'
  const isSuccess = message.type === 'success'
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm')
    } catch (e) {
      return ''
    }
  }

  const toggleDetails = () => {
    setShowDetails((prev) => !prev)
  }

  const copyContent = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Đã sao chép vào clipboard')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const printDetails = () => {
    const printWindow = window.open('', '_blank')

    // Format the content for printing
    const content = `
      <html>
        <head>
          <title>Chi tiết mã cược</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; margin-bottom: 5px; }
            .content { background-color: #f5f5f5; padding: 10px; border-radius: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Chi tiết mã cược</h2>
            <p>Thời gian: ${format(new Date(), 'HH:mm:ss dd/MM/yyyy')}</p>
          </div>
          
          <div class="section">
            <div class="label">Nội dung mã cược:</div>
            <div class="content">${message.content}</div>
          </div>
          
          ${
            message.attachments?.stakeAmount
              ? `
          <div class="section">
            <div class="label">Tổng tiền cược:</div>
            <div>${message.attachments.stakeAmount.toLocaleString()} đồng</div>
          </div>
          
          <div class="section">
            <div class="label">Tiềm năng thắng:</div>
            <div>${message.attachments.potentialWinning.toLocaleString()} đồng</div>
          </div>
          `
              : ''
          }
          
          <div class="footer">
            In ngày ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
          </div>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(content)
    printWindow.document.close()

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-300',
        isBot ? 'justify-start' : 'justify-end'
      )}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-3 shadow-sm',
          isBot
            ? 'bg-card text-card-foreground dark:bg-card/80'
            : 'bg-primary text-primary-foreground',
          isError && isBot && 'bg-destructive/10 border border-destructive/20',
          isSuccess && isBot && 'bg-green-500/10 border border-green-500/20'
        )}>
        <div className='flex items-center mb-2 justify-between'>
          <div className='flex items-center'>
            <div className='font-medium'>{isBot ? 'Bot' : 'Bạn'}</div>
            <div className='text-xs ml-2 opacity-70'>
              {formatTime(message.timestamp)}
            </div>

            {isError && (
              <Badge variant='destructive' className='ml-2 py-0 h-5'>
                <AlertTriangle className='h-3 w-3 mr-1' />
                Lỗi
              </Badge>
            )}

            {isSuccess && (
              <Badge
                variant='outline'
                className='bg-green-500/20 border-green-500/20 text-green-700 dark:text-green-400 ml-2 py-0 h-5'>
                <Check className='h-3 w-3 mr-1' />
                Hợp lệ
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          {isBot && message.type === 'success' && (
            <div className='flex space-x-1'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 text-muted-foreground hover:text-foreground'
                      onClick={() => copyContent(message.content)}>
                      {copied ? (
                        <CopyCheck className='h-3.5 w-3.5' />
                      ) : (
                        <Copy className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sao chép</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 text-muted-foreground hover:text-foreground'
                      onClick={printDetails}>
                      <Printer className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>In chi tiết</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        <div className='whitespace-pre-wrap text-sm'>{message.content}</div>

        {/* Display suggested correction if available */}
        {isBot &&
          message.attachments?.fixed &&
          message.attachments.fixed !== message.attachments.original && (
            <div className='mt-3 p-2 bg-primary/5 dark:bg-primary/10 rounded-md border border-primary/10'>
              <div className='text-xs font-medium mb-1 text-primary'>
                Gợi ý sửa lỗi:
              </div>
              <code className='text-xs font-mono p-1 bg-background/80 dark:bg-background/40 rounded block break-all'>
                {message.attachments.fixed}
              </code>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onUseFixedBetCode(message.attachments.fixed)}
                className='text-xs mt-2 h-7'>
                <Check className='h-3 w-3 mr-1' />
                Sử dụng mã đã sửa
              </Button>
            </div>
          )}

        {/* Display error details */}
        {isBot &&
          message.attachments?.errors &&
          message.attachments.errors.length > 0 && (
            <div className='mt-3 p-2 bg-destructive/5 dark:bg-destructive/10 rounded-md border border-destructive/10'>
              <div className='text-xs font-medium mb-1 text-destructive'>
                Lỗi phát hiện:
              </div>
              <ul className='list-disc pl-5 space-y-1'>
                {message.attachments.errors.slice(0, 3).map((error, index) => (
                  <li key={index} className='text-xs text-destructive/90'>
                    {error.message || 'Lỗi không xác định'}
                  </li>
                ))}
                {message.attachments.errors.length > 3 && (
                  <li className='text-xs text-destructive/70'>
                    ... và {message.attachments.errors.length - 3} lỗi khác
                  </li>
                )}
              </ul>
            </div>
          )}

        {/* Display calculation details */}
        {isBot &&
          message.attachments?.parsedResult &&
          message.attachments?.stakeAmount > 0 && (
            <>
              <div className='mt-3 p-2 bg-card dark:bg-card/30 rounded-md border border-border/50'>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Tổng tiền cược:</span>
                  <span className='font-medium'>
                    {message.attachments.stakeAmount.toLocaleString()}đ
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Tiềm năng thắng:</span>
                  <span className='font-medium text-green-600 dark:text-green-400'>
                    {message.attachments.potentialWinning.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={toggleDetails}
                className='flex items-center justify-center space-x-1 w-full mt-2 text-xs h-7'>
                <span>
                  {showDetails ? 'Ẩn chi tiết' : 'Hiển thị chi tiết cách tính'}
                </span>
                {showDetails ? (
                  <ChevronUp className='h-3 w-3' />
                ) : (
                  <ChevronDown className='h-3 w-3' />
                )}
              </Button>

              {showDetails && (
                <div className='mt-2 border-t border-border pt-2 text-sm'>
                  <div className='flex justify-between items-center text-xs font-medium mb-2'>
                    <span>Chi tiết tính tiền cược:</span>
                    <div className='flex gap-1'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 text-muted-foreground hover:text-foreground'
                              onClick={() => {
                                // Implement export functionality
                                toast.success('Đã xuất chi tiết')
                              }}>
                              <FileSpreadsheet className='h-3.5 w-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xuất chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 text-muted-foreground hover:text-foreground'
                              onClick={() => {
                                // Implement share functionality
                                toast.success('Đã sao chép liên kết')
                              }}>
                              <Share2 className='h-3.5 w-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chia sẻ</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    {message.attachments.stakeDetails?.map(
                      (detail, idx) =>
                        detail.valid && (
                          <div
                            key={idx}
                            className='text-xs p-2 rounded bg-background dark:bg-background/40 border border-border/50'>
                            <div className='flex justify-between'>
                              <span className='font-medium'>
                                Dòng {detail.lineIndex + 1}:
                              </span>
                              <span>{detail.stake.toLocaleString()}đ</span>
                            </div>
                            <div className='text-muted-foreground mt-1 text-[11px]'>
                              {detail.originalLine}
                            </div>
                            {detail.formula && (
                              <div className='bg-muted/50 text-muted-foreground p-1 rounded mt-1 text-[11px] font-mono'>
                                {detail.formula}
                              </div>
                            )}
                          </div>
                        )
                    )}
                  </div>

                  <div className='text-xs font-medium mt-3 mb-2'>
                    Chi tiết tiềm năng thắng:
                  </div>
                  <div className='space-y-2'>
                    {message.attachments.potentialDetails?.map(
                      (detail, idx) =>
                        detail.valid && (
                          <div
                            key={idx}
                            className='text-xs p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50'>
                            <div className='flex justify-between'>
                              <span className='font-medium'>
                                Dòng {detail.lineIndex + 1}:
                              </span>
                              <span className='text-green-600 dark:text-green-400'>
                                {detail.potentialPrize.toLocaleString()}đ
                              </span>
                            </div>
                            {detail.formula && (
                              <div className='bg-green-100/50 dark:bg-green-900/20 p-1 rounded mt-1 text-[11px] font-mono'>
                                {detail.formula}
                              </div>
                            )}
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}

export default ChatMessage
