// src/components/chat/ChatMessage.jsx
import React from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useChat } from '@/contexts/ChatContext'

// Định dạng mã cược để hiển thị đẹp hơn
const formatBetCode = (text) => {
  if (!text) return text

  // Tách dòng đầu tiên (tên đài) và các dòng còn lại
  const lines = text.split('\n')
  if (lines.length <= 1) return text

  const stationLine = lines[0]
  const betLines = lines.slice(1)

  return (
    <div className='space-y-1'>
      <div className='font-semibold'>{stationLine}</div>
      {betLines.map((line, index) => (
        <div
          key={index}
          className='pl-2 border-l-2 border-primary-foreground/30'>
          {line}
        </div>
      ))}
    </div>
  )
}

const ChatMessage = ({ message }) => {
  const {
    text,
    sender,
    timestamp,
    error,
    detailedErrors,
    betCodeInfo,
    fixedCode,
    suggestions,
    formatted,
  } = message
  const isUser = sender === 'user'
  const { applyFixSuggestion } = useChat()

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép nội dung!')
  }

  const handleApplyFix = () => {
    applyFixSuggestion(fixedCode)
    toast.success('Đã áp dụng sửa lỗi!')
  }

  return (
    <div
      className={cn(
        'flex w-full mb-4 group',
        isUser ? 'justify-end' : 'justify-start'
      )}>
      {!isUser && (
        <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-2'>
          B
        </div>
      )}

      <Card
        className={cn(
          'max-w-[85%]',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card',
          error && !isUser ? 'border-destructive' : ''
        )}>
        <CardContent className='p-3'>
          <div className='text-sm whitespace-pre-wrap'>
            {isUser ? formatBetCode(text) : text}

            {/* Format optimization notice */}
            {formatted && !isUser && (
              <div className='mt-2 border-t pt-2'>
                <Badge variant='outline' className='bg-blue-100 text-blue-800'>
                  Tối ưu định dạng
                </Badge>
                <div className='mt-1 text-xs bg-blue-50 p-2 rounded'>
                  <p>Mã cược đã được tối ưu định dạng:</p>
                  <pre className='mt-1 bg-blue-100 p-2 rounded text-blue-800 overflow-x-auto'>
                    {formatted}
                  </pre>
                </div>
              </div>
            )}

            {/* Error details */}
            {detailedErrors && detailedErrors.length > 0 && !isUser && (
              <div className='mt-2 border-t pt-2'>
                <Badge variant='destructive'>Lỗi</Badge>
                <div className='mt-1 space-y-2'>
                  {detailedErrors.map((lineError, idx) => (
                    <div key={idx} className='bg-red-50 p-2 rounded'>
                      <p className='font-medium text-red-800'>
                        {lineError.line}:
                      </p>
                      <ul className='list-disc pl-5 mt-1 space-y-1 text-xs'>
                        {lineError.errors.map((err, errIdx) => (
                          <li key={errIdx} className='text-red-700'>
                            {err.message}
                            {err.suggestion && (
                              <p className='mt-0.5 text-red-600 italic'>
                                Gợi ý: {err.suggestion}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fix suggestions */}
            {fixedCode && !isUser && (
              <div className='mt-2 border-t pt-2'>
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800'>
                  Đề xuất sửa lỗi
                </Badge>
                <div className='mt-1 text-xs bg-green-50 p-2 rounded'>
                  <pre className='bg-green-100 p-2 rounded text-green-800 overflow-x-auto'>
                    {fixedCode}
                  </pre>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2 bg-green-200 text-green-800 hover:bg-green-300'
                    onClick={handleApplyFix}>
                    <Check className='h-3 w-3 mr-1' />
                    Áp dụng sửa lỗi
                  </Button>
                </div>
              </div>
            )}

            {/* Valid bet code info */}
            {betCodeInfo && !isUser && (
              <div className='mt-2 border-t pt-2'>
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800 hover:bg-green-200'>
                  <Check className='h-3 w-3 mr-1' />
                  Mã cược hợp lệ
                </Badge>
                <div className='mt-1 grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='font-medium'>Đài:</span>{' '}
                    {betCodeInfo.station}
                  </div>
                  <div>
                    <span className='font-medium'>Số lượng dòng:</span>{' '}
                    {betCodeInfo.lineCount}
                  </div>
                  <div>
                    <span className='font-medium'>Tiền cược:</span>{' '}
                    {betCodeInfo.totalStake.toLocaleString()}đ
                  </div>
                  <div>
                    <span className='font-medium'>Tiềm năng thắng:</span>{' '}
                    {betCodeInfo.potentialWin.toLocaleString()}đ
                  </div>
                </div>

                {betCodeInfo.formattedCode && (
                  <div className='mt-2 text-xs bg-green-50 p-2 rounded'>
                    <p>Mã cược đã được tối ưu định dạng:</p>
                    <pre className='mt-1 bg-green-100 p-2 rounded text-green-800 overflow-x-auto'>
                      {betCodeInfo.formattedCode}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='flex justify-between items-center mt-1'>
            <div className='text-xs opacity-70'>
              {format(new Date(timestamp), 'HH:mm:ss')}
            </div>

            <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCopy}
                className='h-6 w-6'>
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isUser && (
        <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground ml-2'>
          U
        </div>
      )}
    </div>
  )
}

export default ChatMessage
