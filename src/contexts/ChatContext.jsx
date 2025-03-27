import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react'
import { parseBetCode } from '../services/betCodeParser/parser'
import { detectErrors } from '../services/betCodeParser/errorDetector'
import { suggestFixes } from '../services/betCodeParser/errorFixer'
import { calculateStake } from '../services/calculator/stakeCalculator'
import { calculatePotentialPrize } from '../services/calculator/prizeCalculator'
import { useBetCode } from './BetCodeContext'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { addDraftCode } = useBetCode()

  // Load from session storage on mount
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem('chatMessages')
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      } else {
        // Add welcome message if no saved messages
        const welcomeMessage = {
          id: Date.now().toString(),
          text: 'Xin chào! Tôi có thể giúp bạn nhập mã cược. Hãy nhập mã cược vào ô bên dưới để bắt đầu.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error loading messages from session storage:', error)
    }
  }, [])

  // Save to session storage when messages change
  useEffect(() => {
    try {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving messages to session storage:', error)
    }
  }, [messages])

  const addMessage = (text, sender = 'user', additionalProps = {}) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString(),
      ...additionalProps,
    }

    setMessages((prev) => [...prev, newMessage])

    // If user message, process it
    if (sender === 'user') {
      processUserMessage(text)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const processUserMessage = async (text) => {
    setIsTyping(true)

    try {
      // Short delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Parse the bet code
      const parseResult = parseBetCode(text)

      // Detect any errors
      const errorResult = detectErrors(text, parseResult)

      if (parseResult.success && !errorResult.hasErrors) {
        // Calculate stake and potential prize
        const stakeResult = calculateStake(parseResult)
        const prizeResult = calculatePotentialPrize(parseResult)

        const totalStake = stakeResult.success ? stakeResult.totalStake : 0
        const totalPotential = prizeResult.success
          ? prizeResult.totalPotential
          : 0

        // Valid bet code
        addMessage('Mã cược hợp lệ! Đã thêm vào danh sách mã cược.', 'bot', {
          betCodeInfo: {
            station: parseResult.station.name,
            lineCount: parseResult.lines.length,
            totalStake,
            potentialWin: totalPotential,
          },
        })

        // Add to draft codes
        if (parseResult.lines && parseResult.lines.length > 0) {
          addDraftCode({
            station: parseResult.station,
            lines: parseResult.lines,
            originalText: text,
            stakeAmount: totalStake,
            potentialWinning: totalPotential,
          })
        }
      } else {
        // Check if we have any fix suggestions
        const fixSuggestions = suggestFixes(text, errorResult)

        // Invalid bet code
        const errorMessage =
          errorResult.errors?.[0]?.message || 'Mã cược không hợp lệ'
        const suggestion = fixSuggestions.hasSuggestions
          ? fixSuggestions.suggestions[0]?.suggestion
          : 'Vui lòng kiểm tra lại mã cược và thử lại.'

        addMessage(
          'Mã cược không đúng định dạng. Vui lòng kiểm tra lại.',
          'bot',
          {
            error: errorMessage,
            suggestion,
          }
        )
      }
    } catch (error) {
      console.error('Error processing message:', error)
      addMessage('Đã xảy ra lỗi khi xử lý mã cược.', 'bot')
    } finally {
      setIsTyping(false)
    }
  }

  const addSystemExample = () => {
    const exampleMessage = {
      id: Date.now().toString(),
      text: 'Dưới đây là một số ví dụ về mã cược:\n\n1. Cược đơn giản:\n```\nmb\n25.36.47dd10\n```\n\n2. Nhiều kiểu cược:\n```\nvl.ct\n25.36b10\n47.58da5\n```\n\n3. Cược nhiều đài:\n```\n2dmn\n123.456.789xc2\n```',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, exampleMessage])
  }

  const value = {
    messages,
    isTyping,
    addMessage,
    clearMessages,
    addSystemExample,
    messagesEndRef,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
