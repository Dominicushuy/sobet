import React from 'react'
import BetCodeList from './bet/BetCodeList'
import ChatContainer from './chat/ChatContainer'
import { BetCodeProvider } from '@/contexts/BetCodeContext'
import { ChatProvider } from '@/contexts/ChatContext'

const BetManagementLayout = () => {
  return (
    <BetCodeProvider>
      <ChatProvider>
        <div className='h-screen flex flex-col'>
          <div className='flex-1 flex overflow-hidden'>
            {/* Left Panel - Bet Codes */}
            <div className='w-1/2 border-r'>
              <BetCodeList />
            </div>

            {/* Right Panel - Chat */}
            <div className='w-1/2'>
              <ChatContainer />
            </div>
          </div>
        </div>
      </ChatProvider>
    </BetCodeProvider>
  )
}

export default BetManagementLayout
