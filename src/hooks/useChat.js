// src/hooks/useChat.js
import { useState, useCallback, useContext, useEffect } from 'react'
import { db } from '@/database/db'
import { AuthContext } from '@/contexts/AuthContext'
import { useBetCodes } from './useBetCodes'
import { parseBetCode } from '@/services/betCodeParser/parser'
import { detectErrors } from '@/services/betCodeParser/errorDetector'
import { suggestFixes, fixBetCode } from '@/services/betCodeParser/errorFixer'
import { calculateStake } from '@/services/calculator/stakeCalculator'
import { calculatePotentialPrize } from '@/services/calculator/prizeCalculator'
import { toast } from 'sonner'

const BOT_TYPING_DELAY = 500 // Mô phỏng thời gian bot suy nghĩ

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [botTyping, setBotTyping] = useState(false)
  const { user } = useContext(AuthContext)
  const { addBetCode } = useBetCodes()

  // Load lịch sử chat từ localStorage khi component mount
  useEffect(() => {
    if (user) {
      try {
        const savedMessages = localStorage.getItem(`chatHistory_${user.id}`)
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        } else {
          // Khởi tạo chat với tin nhắn chào mừng
          const welcomeMessage = {
            id: Date.now(),
            content:
              'Xin chào! Tôi có thể giúp bạn phân tích mã cược. Hãy nhập mã cược của bạn.',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            type: 'text',
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch sử chat:', error)
      }
    }
  }, [user])

  // Lưu lịch sử chat vào localStorage khi có tin nhắn mới
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user])

  // Phân tích mã cược
  const analyzeBetCode = useCallback(async (betCode) => {
    try {
      // Phân tích cú pháp
      const parsedResult = parseBetCode(betCode)

      // Phát hiện lỗi
      const errorResult = detectErrors(betCode, parsedResult)

      // Gợi ý sửa lỗi
      const suggestionResult = suggestFixes(betCode, errorResult)

      // Fix lỗi tự động nếu có thể
      const fixResult = fixBetCode(betCode, errorResult)

      return {
        parsedResult,
        errorResult,
        suggestionResult,
        fixResult,
      }
    } catch (error) {
      console.error('Lỗi khi phân tích mã cược:', error)
      return {
        parsedResult: {
          success: false,
          errors: [{ message: 'Không thể phân tích mã cược' }],
        },
        errorResult: {
          hasErrors: true,
          errors: [
            {
              type: 'FATAL_ERROR',
              message: 'Lỗi hệ thống khi phân tích mã cược',
            },
          ],
        },
        suggestionResult: { hasSuggestions: false, suggestions: [] },
        fixResult: { success: false, fixed: betCode, changes: [] },
      }
    }
  }, [])

  // Gửi tin nhắn từ người dùng
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) return

      // Thêm tin nhắn người dùng vào state
      const userMessage = {
        id: Date.now(),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
        type: 'text',
      }

      setMessages((prev) => [...prev, userMessage])
      setBotTyping(true)

      try {
        // Phân tích mã cược
        const analysisResult = await analyzeBetCode(content)

        // Mô phỏng thời gian bot suy nghĩ
        await new Promise((resolve) => setTimeout(resolve, BOT_TYPING_DELAY))

        let botResponse = ''
        let messageType = 'text'
        let attachments = null

        if (analysisResult.parsedResult.success) {
          // Tính tiền cược
          const stakeResult = calculateStake(analysisResult.parsedResult)
          const stakeAmount = stakeResult.totalStake

          // Tính tiềm năng thắng cược
          const potentialResult = calculatePotentialPrize(
            analysisResult.parsedResult
          )
          const potentialWinning = potentialResult.totalPotential

          if (analysisResult.errorResult.hasErrors) {
            // Có lỗi, hiển thị gợi ý sửa
            botResponse = 'Tôi phát hiện một số lỗi trong mã cược của bạn:\n\n'

            analysisResult.errorResult.errors.forEach((error, index) => {
              botResponse += `${index + 1}. ${
                error.message || 'Lỗi không xác định'
              }\n`
            })

            if (analysisResult.fixResult.success) {
              botResponse += '\nĐề xuất sửa lỗi:\n'
              botResponse += `"${analysisResult.fixResult.fixed}"\n`
            }

            messageType = 'error'
            attachments = {
              original: content,
              fixed: analysisResult.fixResult.fixed,
              errors: analysisResult.errorResult.errors,
              suggestions: analysisResult.suggestionResult.suggestions,
            }
          } else {
            // Không có lỗi, hiển thị kết quả phân tích
            // Không có lỗi, hiển thị kết quả phân tích
            botResponse = 'Mã cược hợp lệ!\n\n'
            botResponse += `Tổng tiền cược: ${stakeAmount.toLocaleString()} đồng\n`
            botResponse += `Tiềm năng thắng: ${potentialWinning.toLocaleString()} đồng\n`
            botResponse += 'Chi tiết:\n'

            analysisResult.parsedResult.lines.forEach((line, index) => {
              if (line.valid) {
                const stationName = line.multiStation
                  ? line.station.name
                  : line.station?.name || 'Không xác định'

                const betTypeName = line.betType?.name || 'Không xác định'
                const amount = line.amount || 0

                botResponse += `- Dòng ${
                  index + 1
                }: ${stationName}, ${line.numbers.join(', ')} ${betTypeName} ${
                  amount / 1000
                }k (${amount.toLocaleString()}đ)\n`
              }
            })

            messageType = 'success'
            attachments = {
              parsedResult: analysisResult.parsedResult,
              stakeAmount,
              potentialWinning,
              stakeDetails: stakeResult.details,
              potentialDetails: potentialResult.details,
            }

            // Lưu mã cược vào database
            try {
              const savedBetCode = await addBetCode(
                content,
                analysisResult.parsedResult.lines,
                stakeAmount,
                potentialWinning,
                [] // errors - không có lỗi
              )

              if (savedBetCode) {
                botResponse += '\nĐã lưu mã cược thành công!'
              }
            } catch (error) {
              console.error('Lỗi khi lưu mã cược:', error)
              botResponse += '\nCó lỗi khi lưu mã cược. Vui lòng thử lại.'
            }
          }
        } else {
          // Không thể phân tích mã cược
          botResponse =
            'Tôi không thể phân tích mã cược của bạn. Vui lòng kiểm tra lại cú pháp.\n'
          botResponse +=
            'Ví dụ về mã cược hợp lệ: "vl 12 34 56 dd10", "mb 45 67 89 b5"'
          messageType = 'error'
        }

        // Thêm tin nhắn bot vào state
        const botMessage = {
          id: Date.now(),
          content: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: messageType,
          attachments,
        }

        setMessages((prev) => [...prev, botMessage])
      } catch (error) {
        console.error('Lỗi khi xử lý tin nhắn:', error)

        // Tin nhắn lỗi
        const errorMessage = {
          id: Date.now(),
          content: 'Có lỗi xảy ra khi xử lý mã cược. Vui lòng thử lại sau.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'error',
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setBotTyping(false)
      }
    },
    [analyzeBetCode, addBetCode]
  )

  // Sử dụng mã cược đã được sửa
  const useFixedBetCode = useCallback(
    (fixedCode) => {
      if (fixedCode) {
        sendMessage(fixedCode)
      }
    },
    [sendMessage]
  )

  // Xóa lịch sử chat
  const clearChat = useCallback(() => {
    if (user) {
      // Xóa từ localStorage
      localStorage.removeItem(`chatHistory_${user.id}`)

      // Khởi tạo lại với tin nhắn chào mừng
      const welcomeMessage = {
        id: Date.now(),
        content:
          'Lịch sử chat đã được xóa. Bạn có thể bắt đầu nhập mã cược mới.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text',
      }

      setMessages([welcomeMessage])
      toast.success('Đã xóa lịch sử chat')
    }
  }, [user])

  return {
    messages,
    loading,
    botTyping,
    sendMessage,
    useFixedBetCode,
    clearChat,
  }
}

export default useChat
