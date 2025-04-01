// src/components/chat/ChatMessage.jsx
import React from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

// Highlight error parts in bet code text
const HighlightErrors = ({ text, errors }) => {
  if (!text || !errors || errors.length === 0) return text

  // For simplicity, just highlight the whole line with the error
  const lines = text.split('\n')

  return (
    <div className='space-y-1'>
      {lines.map((line, index) => {
        const hasError = errors.some(
          (err) =>
            err.lineIndex === index ||
            (err.line && err.line.includes(`Dòng ${index + 1}`))
        )

        return (
          <div
            key={index}
            className={cn(
              'pl-2 border-l-2',
              hasError
                ? 'border-destructive bg-destructive/10'
                : 'border-primary-foreground/30'
            )}>
            {hasError && (
              <AlertTriangle className='h-3 w-3 inline-block mr-1 text-destructive' />
            )}
            {line}
          </div>
        )
      })}
    </div>
  )
}

const ChatMessage = ({ message }) => {
  const { text, sender, timestamp, error, betCodeInfo } = message
  const isUser = sender === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép nội dung!')
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
