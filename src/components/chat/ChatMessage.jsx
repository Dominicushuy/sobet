// src/components/chat/ChatMessage.jsx
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

const ChatMessage = ({ message, onUseFixedBetCode }) => {
  const isBot = message.sender === 'bot'
  const isError = message.type === 'error'
  const isSuccess = message.type === 'success'
  const [showDetails, setShowDetails] = useState(false)

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

        {/* Hiển thị chi tiết cách tính (nếu có) */}
        {isBot &&
          message.attachments?.parsedResult &&
          message.attachments?.stakeAmount > 0 && (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleDetails}
                className='flex items-center justify-center space-x-1 w-full mt-2 text-xs'>
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
                <div className='mt-2 border-t border-border pt-2'>
                  <div className='text-xs font-medium mb-1'>
                    Chi tiết tính tiền cược:
                  </div>
                  {message.attachments.stakeDetails?.map(
                    (detail, idx) =>
                      detail.valid && (
                        <div
                          key={idx}
                          className='text-xs mb-1 pl-2 border-l-2 border-primary/30'>
                          <div className='flex justify-between'>
                            <span>Dòng {detail.lineIndex + 1}:</span>
                            <span>{detail.stake.toLocaleString()}đ</span>
                          </div>
                          {detail.formula && (
                            <div className='text-muted-foreground'>
                              Công thức: {detail.formula}
                            </div>
                          )}
                        </div>
                      )
                  )}
                  <div className='text-xs font-medium mt-1 flex justify-between'>
                    <span>Tổng cược:</span>
                    <span>
                      {message.attachments.stakeAmount.toLocaleString()}đ
                    </span>
                  </div>

                  {message.attachments.potentialWinning > 0 && (
                    <>
                      <div className='text-xs font-medium mt-2 mb-1'>
                        Chi tiết tiềm năng thắng:
                      </div>
                      {message.attachments.potentialDetails?.map(
                        (detail, idx) =>
                          detail.valid && (
                            <div
                              key={idx}
                              className='text-xs mb-1 pl-2 border-l-2 border-green-500/30'>
                              <div className='flex justify-between'>
                                <span>Dòng {detail.lineIndex + 1}:</span>
                                <span>
                                  {detail.potentialPrize.toLocaleString()}đ
                                </span>
                              </div>
                              {detail.formula && (
                                <div className='text-muted-foreground'>
                                  Công thức: {detail.formula}
                                </div>
                              )}
                            </div>
                          )
                      )}
                      <div className='text-xs font-medium mt-1 flex justify-between text-green-500'>
                        <span>Tiềm năng thắng tối đa:</span>
                        <span>
                          {message.attachments.potentialWinning.toLocaleString()}
                          đ
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}

export default ChatMessage
