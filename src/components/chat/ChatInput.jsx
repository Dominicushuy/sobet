// src/components/chat/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Eraser } from 'lucide-react'

const ChatInput = ({ onSendMessage, onClear, disabled, placeholder }) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px' // Reset height
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px'
      }
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='relative'>
      <div className='relative'>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Nhập mã cược...'}
          disabled={disabled}
          className='pr-24 min-h-[56px] max-h-[200px] resize-none'
          rows={1}
        />

        <div className='absolute right-2 bottom-2 flex gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClear}
            title='Xóa lịch sử'
            disabled={disabled}>
            <Eraser className='h-4 w-4' />
          </Button>

          <Button
            type='submit'
            size='icon'
            disabled={!input.trim() || disabled}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
