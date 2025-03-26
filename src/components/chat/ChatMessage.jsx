// src/components/chat/ChatMessage.jsx
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const ChatMessage = ({ message, onUseFixedBetCode }) => {
  const isBot = message.sender === 'bot'
  const isError = message.type === 'error'
  const isSuccess = message.type === 'success'

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm')
    } catch (e) {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-300',
        isBot ? 'justify-start' : 'justify-end'
      )}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-2 shadow-sm',
          isBot
            ? 'bg-card text-card-foreground'
            : 'bg-primary text-primary-foreground',
          isError && isBot && 'bg-destructive/10 border border-destructive/20',
          isSuccess && isBot && 'bg-green-500/10 border border-green-500/20'
        )}>
        <div className='flex items-center mb-1'>
          <div className='font-medium'>{isBot ? 'Bot' : 'Bạn'}</div>
          <div className='text-xs ml-2 opacity-70'>
            {formatTime(message.timestamp)}
          </div>
        </div>

        <div className='whitespace-pre-wrap text-sm'>{message.content}</div>

        {/* Hiển thị nút sửa lỗi nếu có */}
        {isBot &&
          message.attachments?.fixed &&
          message.attachments.fixed !== message.attachments.original && (
            <div className='mt-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onUseFixedBetCode(message.attachments.fixed)}
                className='text-xs'>
                Sử dụng mã đã sửa
              </Button>
            </div>
          )}

        {/* Hiển thị gợi ý sửa lỗi */}
        {isBot &&
          message.attachments?.suggestions &&
          message.attachments.suggestions.length > 0 && (
            <div className='mt-2 space-y-1'>
              <p className='text-xs font-medium'>Gợi ý sửa lỗi:</p>
              {message.attachments.suggestions
                .slice(0, 3)
                .map((suggestion, index) => (
                  <div key={index} className='text-xs'>
                    {suggestion.message}
                  </div>
                ))}
            </div>
          )}
      </div>
    </div>
  )
}

export default ChatMessage
