// src/components/chat/ChatInterface.jsx
import React, { useRef, useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sparkles, Info, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const QUICK_INPUTS = [
  { label: 'Đầu Đuôi', value: 'dd' },
  { label: 'Bao Lô', value: 'b' },
  { label: 'Đầu', value: 'dau' },
  { label: 'Đuôi', value: 'duoi' },
  { label: 'Xỉu Chủ', value: 'xc' },
]

const ChatInterface = () => {
  const { messages, botTyping, sendMessage, useFixedBetCode, clearChat } =
    useChat()
  const messagesEndRef = useRef(null)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const scrollContainerRef = useRef(null)
  const [showGuideAlert, setShowGuideAlert] = useState(true)

  // Auto-scroll to bottom when new messages arrive if we're already at the bottom
  useEffect(() => {
    if (messagesEndRef.current && !isScrolledUp) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    } else if (messages.length > 0 && isScrolledUp) {
      setShowScrollToBottom(true)
    }
  }, [messages, botTyping, isScrolledUp])

  // Detect scroll position
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
    setIsScrolledUp(!isAtBottom)
    setShowScrollToBottom(!isAtBottom && messages.length > 2)
  }

  // Scroll to bottom manually
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollToBottom(false)
    setIsScrolledUp(false)
  }

  // Insert quick input into the chat input field
  const insertQuickInput = (value) => {
    // This actually sends the betType directly to the active ChatInput component
    // You would need to modify ChatInput to accept and handle this insertion
    const input = document.querySelector('textarea')
    if (input) {
      const cursorPos = input.selectionStart
      const textBefore = input.value.substring(0, cursorPos)
      const textAfter = input.value.substring(cursorPos, input.value.length)

      // Insert the value at cursor position with a space before if needed
      const needsSpace = textBefore.length > 0 && !textBefore.endsWith(' ')
      const newValue = textBefore + (needsSpace ? ' ' : '') + value + textAfter

      // Update the input value
      input.value = newValue

      // Set cursor position after the inserted text
      const newCursorPos = cursorPos + value.length + (needsSpace ? 1 : 0)
      input.setSelectionRange(newCursorPos, newCursorPos)

      // Focus the input
      input.focus()
    }
  }

  return (
    <div className='flex flex-col h-full relative'>
      {/* Main messages container with scroll */}
      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-y-auto p-4 space-y-4 pb-1'
        onScroll={handleScroll}>
        {/* Welcome guide that can be dismissed */}
        {showGuideAlert && messages.length <= 1 && (
          <Alert className='mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'>
            <div className='flex items-start gap-2'>
              <Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5' />
              <div className='flex-1'>
                <AlertTitle className='text-blue-700 dark:text-blue-300'>
                  Hướng dẫn nhanh
                </AlertTitle>
                <AlertDescription className='text-blue-600/90 dark:text-blue-400/90'>
                  <p className='mb-2'>
                    Nhập mã cược theo cú pháp: [đài] [số] [kiểu cược][tiền]
                  </p>
                  <p className='text-sm mb-1'>
                    Ví dụ:{' '}
                    <code className='px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded'>
                      mb 23 45 dd10
                    </code>
                  </p>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setShowGuideAlert(false)}>
                      Đóng
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='border-blue-300 dark:border-blue-700'
                      onClick={() =>
                        window.open('https://youtu.be/dQw4w9WgXcQ', '_blank')
                      }>
                      <BookOpen className='h-4 w-4 mr-1' />
                      Xem hướng dẫn chi tiết
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Messages list */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onUseFixedBetCode={useFixedBetCode}
          />
        ))}

        {/* Bot typing indicator */}
        {botTyping && (
          <div className='flex items-center space-x-2'>
            <div className='animate-pulse flex space-x-1 bg-card dark:bg-card/80 rounded-lg px-4 py-2 shadow-sm inline-flex items-center'>
              <div className='bg-primary/30 h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='bg-primary/30 h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='bg-primary/30 h-1.5 w-1.5 rounded-full animate-bounce'></div>
              <span className='ml-2 text-sm text-muted-foreground'>
                Bot đang phân tích...
              </span>
            </div>
          </div>
        )}

        {/* Invisible element for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick input buttons */}
      <div className='px-4'>
        <div
          className={cn(
            'flex flex-wrap gap-1.5 py-2 transition-all duration-300',
            messages.length <= 1
              ? 'opacity-100 max-h-16'
              : 'opacity-0 max-h-0 overflow-hidden'
          )}>
          {QUICK_INPUTS.map((item) => (
            <TooltipProvider key={item.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 bg-background'
                    onClick={() => insertQuickInput(item.value)}>
                    {item.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chèn "{item.value}" vào mã cược</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-xs h-7 text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:bg-blue-950/30'
                  onClick={() => sendMessage('Chỉ cho tôi các ví dụ mã cược')}>
                  <Sparkles className='h-3 w-3 mr-1' />
                  Gợi ý mã cược
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xem các ví dụ mã cược phổ biến</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Input area */}
      <div className='p-4 border-t bg-background pt-3'>
        <ChatInput
          onSendMessage={sendMessage}
          onClear={clearChat}
          disabled={botTyping}
          placeholder='Nhập mã cược (vd: mb 23 45 dd10)...'
        />
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          className='absolute bottom-[88px] right-6 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 transition-all'
          onClick={scrollToBottom}>
          <ChevronDown className='h-4 w-4' />
        </button>
      )}
    </div>
  )
}

export default ChatInterface
