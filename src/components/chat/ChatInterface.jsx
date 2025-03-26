// src/components/chat/ChatInterface.jsx
import React, { useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const ChatInterface = () => {
  const { messages, botTyping, sendMessage, useFixedBetCode, clearChat } =
    useChat()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, botTyping])

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onUseFixedBetCode={useFixedBetCode}
          />
        ))}

        {botTyping && (
          <div className='flex items-center space-x-2 mb-4'>
            <div className='bg-card rounded-lg px-4 py-2 shadow-sm inline-flex items-center'>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              <span className='text-sm'>Bot đang nhập...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className='p-4 border-t bg-background'>
        <ChatInput
          onSendMessage={sendMessage}
          onClear={clearChat}
          disabled={botTyping}
          placeholder='Nhập mã cược (vd: mb 23 45 dd10)...'
        />
      </div>
    </div>
  )
}

export default ChatInterface
