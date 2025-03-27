// src/contexts/ChatContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react'
import { parseBetCode } from '../services/betCodeParser/parser'
import { detectErrors } from '../services/betCodeParser/errorDetector'
import { suggestFixes, fixBetCode } from '../services/betCodeParser/errorFixer'
import { formatBetCode } from '../services/betCodeParser/formatter'
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

  // Generate examples for common error types
  const generateHelpExamples = (errorType, errorMessage, region = 'south') => {
    const examples = {
      INVALID_STATION: {
        example: region === 'south' ? 'vl' : region === 'central' ? 'dn' : 'mb',
        message: 'Sử dụng tên đài hợp lệ. Ví dụ: vl (Vĩnh Long), mb (Miền Bắc)',
      },
      STATION_NOT_AVAILABLE: {
        example:
          region === 'south' ? '2dmn' : region === 'central' ? '2dmt' : 'mb',
        message:
          'Sử dụng đài có lịch xổ trong ngày. Ví dụ: 2dmn (2 đài miền Nam)',
      },
      NO_BET_TYPE: {
        example: '23.45.67dd10',
        message:
          'Thêm kiểu cược. Ví dụ: dd (đầu đuôi), b (bao lô), xc (xỉu chủ)',
      },
      INVALID_BET_TYPE: {
        example: '23.45.67dd10',
        message: 'Sử dụng kiểu cược hợp lệ. Ví dụ: dd, b, xc, dau, duoi',
      },
      INCOMPATIBLE_BET_TYPE: {
        example: region === 'north' ? '23.45b8l10' : '23.45dd10',
        message:
          'Sử dụng kiểu cược phù hợp với miền. Ví dụ: b8l chỉ dùng cho miền Bắc',
      },
      NO_NUMBERS: {
        example: '23.45.67dd10',
        message: 'Thêm số cược. Ví dụ: 23.45.67',
      },
      INVALID_NUMBER_FORMAT: {
        example: '23.45.67dd10',
        message: 'Đảm bảo số cược là số. Ví dụ: 23, 45, 67',
      },
      INVALID_DIGIT_COUNT: {
        example: '123xc10',
        message:
          'Đảm bảo số chữ số phù hợp với kiểu cược. Ví dụ: 123 cho xỉu chủ',
      },
      INVALID_AMOUNT: {
        example: '23.45.67dd10',
        message: 'Thêm số tiền cược. Ví dụ: dd10 (10.000đ)',
      },
      MIXED_REGIONS: {
        example: 'vl.dn',
        message:
          'Chỉ kết hợp các đài cùng miền. Ví dụ: vl.ct (Vĩnh Long, Cần Thơ)',
      },
      DEFAULT: {
        example: 'mb\n23.45.67dd10',
        message: 'Mẫu mã cược hợp lệ',
      },
    }

    const errorKey =
      Object.keys(examples).find(
        (key) => errorMessage.includes(key) || errorType === key
      ) || 'DEFAULT'

    return examples[errorKey]
  }

  /**
   * Tách và hiển thị các trường hợp đặc biệt trong mã cược
   */
  const extractSpecialCases = (betCode, parseResult) => {
    const specialCases = {
      groupedNumbers: [],
      multipleBetTypes: [],
    }

    // Kiểm tra trường hợp số gộp thành nhóm (ví dụ: 1234.4567da1)
    if (parseResult && parseResult.lines) {
      parseResult.lines.forEach((line, index) => {
        // Kiểm tra số gộp thành nhóm
        const groupedNumbers = line.originalLine.match(/\d{4,}/g)
        if (
          groupedNumbers &&
          groupedNumbers.some((num) => num.length % 2 === 0)
        ) {
          const separateLines = []
          const processedGroups = []

          groupedNumbers.forEach((group) => {
            if (group.length % 2 === 0) {
              // For each 4-digit group, create a pair of the first 2 and last 2 digits
              for (let i = 0; i < group.length; i += 4) {
                if (i + 4 <= group.length) {
                  const firstDigits = group.substring(i, i + 2)
                  const lastDigits = group.substring(i + 2, i + 4)
                  processedGroups.push(`${firstDigits}.${lastDigits}`)
                } else if (i + 2 <= group.length) {
                  // Handle leftover 2 digits
                  processedGroups.push(group.substring(i, i + 2))
                }
              }
            }
          })

          // Add bet type to each processed group - FIXED: Divide amount by 1000
          const formattedAmount = Math.floor((line.amount || 10000) / 1000)
          const betTypeStr = `${line.betType.alias}${formattedAmount}`
          processedGroups.forEach((group) => {
            separateLines.push(`${group}${betTypeStr}`)
          })

          if (separateLines.length > 0) {
            specialCases.groupedNumbers.push({
              originalLine: line.originalLine,
              explanation: `Số ${groupedNumbers.join(
                ', '
              )} được tách thành ${processedGroups.join(', ')}`,
              separateLines,
            })
          }
        }

        // Kiểm tra nhiều kiểu cược (ví dụ: 23.45.67dd10.dau20.duoi5)
        if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
          // Extract the numbers (everything before the first bet type)
          const numbersPart = line.numbers ? line.numbers.join('.') : ''

          // Create separate lines for the main bet type and each additional bet type
          // FIXED: Divide amount by 1000
          const formattedMainAmount = Math.floor((line.amount || 10000) / 1000)
          const mainBetType = `${line.betType.alias}${formattedMainAmount}`
          const additionalTypes = line.additionalBetTypes.map(
            (bt) =>
              `${bt.betType.alias}${Math.floor((bt.amount || 10000) / 1000)}`
          )

          const allBetTypes = [mainBetType, ...additionalTypes]
          let separateLines = []

          // Special handling for "da" bet type with multiple numbers
          if (
            (line.betType.alias === 'da' || line.betType.alias === 'dv') &&
            line.numbers &&
            line.numbers.length >= 2
          ) {
            // For da bet type, keep all numbers together
            separateLines.push(`${numbersPart}${mainBetType}`)

            // For other bet types, create separate lines for each number
            for (const betType of additionalTypes) {
              for (const num of line.numbers) {
                separateLines.push(`${num}${betType}`)
              }
            }
          } else {
            // For other bet types, just create a line for each bet type with all numbers
            for (const betType of allBetTypes) {
              separateLines.push(`${numbersPart}${betType}`)
            }
          }

          specialCases.multipleBetTypes.push({
            originalLine: line.originalLine,
            explanation: `Kiểu cược ${allBetTypes.join(
              ', '
            )} được tách thành dòng riêng biệt`,
            separateLines,
          })
        }
      })
    }

    return specialCases
  }

  const processUserMessage = async (text) => {
    setIsTyping(true)

    try {
      // Short delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Format the bet code first for better parsing
      const formattedBetCode = formatBetCode(text)

      // Parse the bet code
      const parseResult = parseBetCode(formattedBetCode)

      // Detect any errors
      const errorResult = detectErrors(formattedBetCode, parseResult)

      if (parseResult.success && !errorResult.hasErrors) {
        // Calculate stake and potential prize
        const stakeResult = calculateStake(parseResult)
        const prizeResult = calculatePotentialPrize(parseResult)

        const totalStake = stakeResult.success ? stakeResult.totalStake : 0
        const totalPotential = prizeResult.success
          ? prizeResult.totalPotential
          : 0

        // Phát hiện và xử lý các trường hợp đặc biệt
        const specialCases = extractSpecialCases(formattedBetCode, parseResult)
        const hasSpecialCases =
          specialCases.groupedNumbers.length > 0 ||
          specialCases.multipleBetTypes.length > 0

        // Tạo thông báo giải thích các trường hợp đặc biệt
        let specialCasesMessage = ''
        if (hasSpecialCases) {
          specialCasesMessage = '\n\n**Thông tin bổ sung về mã cược:**\n\n'

          if (specialCases.groupedNumbers.length > 0) {
            specialCasesMessage += '- **Số gộp thành nhóm:**\n'
            specialCases.groupedNumbers.forEach((group, idx) => {
              specialCasesMessage += `  + Dòng ${idx + 1}: ${
                group.explanation
              }\n`
              specialCasesMessage += `    Tách thành: ${group.separateLines.join(
                ', '
              )}\n`
            })
          }

          if (specialCases.multipleBetTypes.length > 0) {
            specialCasesMessage += '- **Nhiều kiểu cược:**\n'
            specialCases.multipleBetTypes.forEach((betTypes, idx) => {
              specialCasesMessage += `  + Dòng ${idx + 1}: ${
                betTypes.explanation
              }\n`
              specialCasesMessage += `    Tách thành:\n    ${betTypes.separateLines.join(
                '\n    '
              )}\n`
            })
          }
        }

        // Valid bet code
        addMessage(
          `Mã cược hợp lệ! Đã thêm vào danh sách mã cược.${
            formattedBetCode !== text
              ? '\n\nMã cược đã được tối ưu định dạng.'
              : ''
          }${specialCasesMessage}`,
          'bot',
          {
            betCodeInfo: {
              station: parseResult.station.name,
              lineCount: parseResult.lines.length,
              totalStake,
              potentialWin: totalPotential,
              formattedCode:
                formattedBetCode !== text ? formattedBetCode : null,
            },
            detailedCalculations: {
              stakeDetails: stakeResult.details || [],
              prizeDetails: prizeResult.details || [],
            },
            specialCases: hasSpecialCases ? specialCases : null,
          }
        )

        // Add to draft codes
        if (parseResult.lines && parseResult.lines.length > 0) {
          addDraftCode({
            station: parseResult.station,
            lines: parseResult.lines,
            originalText: text,
            formattedText: formattedBetCode !== text ? formattedBetCode : text,
            stakeAmount: totalStake,
            potentialWinning: totalPotential,
            stakeDetails: stakeResult.details || [],
            prizeDetails: prizeResult.details || [],
            specialCases: hasSpecialCases ? specialCases : null,
          })
        }
      } else {
        // Check if we have any fix suggestions
        const fixSuggestions = suggestFixes(formattedBetCode, errorResult)

        // Try to auto-fix the errors
        const fixResult = fixBetCode(formattedBetCode, errorResult)

        let responseMessage = 'Mã cược không đúng định dạng.'
        let detailedErrors = []

        // Format detailed error messages
        if (errorResult.errors && errorResult.errors.length > 0) {
          // Group errors by line if possible
          const errorsByLine = {}

          errorResult.errors.forEach((error) => {
            const lineKey =
              error.lineIndex !== undefined
                ? `Dòng ${error.lineIndex + 1}`
                : 'Chung'
            if (!errorsByLine[lineKey]) {
              errorsByLine[lineKey] = []
            }

            // Add examples and more helpful suggestions
            const helpExample = generateHelpExamples(
              error.type,
              error.message,
              parseResult.station?.region || 'south'
            )

            errorsByLine[lineKey].push({
              ...error,
              suggestion:
                helpExample.message ||
                fixSuggestions.suggestions.find(
                  (s) => s.message === error.message
                )?.suggestion ||
                null,
              example: helpExample.example || null,
            })
          })

          // Format errors into a structured list
          Object.entries(errorsByLine).forEach(([lineKey, errors]) => {
            const lineErrors = {
              line: lineKey,
              errors: errors.map((error) => ({
                message: error.message,
                type: error.type,
                suggestion: error.suggestion,
                example: error.example,
              })),
            }
            detailedErrors.push(lineErrors)
          })

          // Generate main error message with a helpful tone
          const primaryError = errorResult.errors[0]
          responseMessage = `Mã cược chưa đúng định dạng. ${primaryError.message}`

          // Add a more helpful suggestion based on the error type
          const helpExample = generateHelpExamples(
            primaryError.type,
            primaryError.message,
            parseResult.station?.region || 'south'
          )
          if (helpExample.message) {
            responseMessage += `\n\n${helpExample.message}`
          }
        }

        // Add fix suggestion if available
        let fixedCodeMessage = ''
        if (fixResult.success) {
          fixedCodeMessage =
            '\n\nĐề xuất mã cược sửa lỗi:\n```\n' + fixResult.fixed + '\n```'

          // Try parsing the fixed code
          const fixedParseResult = parseBetCode(fixResult.fixed)
          if (fixedParseResult.success) {
            // Calculate fixed code details
            const fixedStakeResult = calculateStake(fixedParseResult)
            const fixedPrizeResult = calculatePotentialPrize(fixedParseResult)

            const fixedTotalStake = fixedStakeResult.success
              ? fixedStakeResult.totalStake
              : 0
            const fixedTotalPotential = fixedPrizeResult.success
              ? fixedPrizeResult.totalPotential
              : 0

            // Phát hiện các trường hợp đặc biệt trong mã đã sửa
            const fixedSpecialCases = extractSpecialCases(
              fixResult.fixed,
              fixedParseResult
            )
            const hasFixedSpecialCases =
              fixedSpecialCases.groupedNumbers.length > 0 ||
              fixedSpecialCases.multipleBetTypes.length > 0

            let fixedSpecialCasesMessage = ''
            if (hasFixedSpecialCases) {
              fixedSpecialCasesMessage = '\n\n**Lưu ý về mã cược đã sửa:**\n'

              if (fixedSpecialCases.groupedNumbers.length > 0) {
                fixedSpecialCasesMessage +=
                  '\n- Mã cược chứa số gộp thành nhóm sẽ được tách thành các dòng riêng biệt.'
              }

              if (fixedSpecialCases.multipleBetTypes.length > 0) {
                fixedSpecialCasesMessage +=
                  '\n- Mã cược chứa nhiều kiểu cược sẽ được tách thành các dòng riêng biệt.'
              }
            }

            fixedCodeMessage +=
              `\n\nTiền cược: ${fixedTotalStake.toLocaleString()}đ | ` +
              `Tiềm năng thắng: ${fixedTotalPotential.toLocaleString()}đ` +
              `${fixedSpecialCasesMessage}\n\n` +
              'Bạn có thể sao chép mã trên và thử lại hoặc nhấn nút "Áp dụng mã đã sửa" bên dưới.'
          } else {
            fixedCodeMessage += '\n\nBạn có thể sao chép mã trên và thử lại.'
          }
        }

        // Response with error details and fix suggestions
        addMessage(
          `${responseMessage}\n\nVui lòng kiểm tra lại mã cược và thử lại.${fixedCodeMessage}`,
          'bot',
          {
            error: true,
            detailedErrors,
            original: text,
            formatted: formattedBetCode !== text ? formattedBetCode : null,
            fixedCode: fixResult.success ? fixResult.fixed : null,
            changes: fixResult.success ? fixResult.changes : [],
            suggestions: fixSuggestions.hasSuggestions
              ? fixSuggestions.suggestions
              : [],
          }
        )
      }
    } catch (error) {
      console.error('Error processing message:', error)
      addMessage(
        'Đã xảy ra lỗi khi xử lý mã cược. ' +
          error.message +
          '\n\nVui lòng thử lại với một mã cược khác hoặc kiểm tra định dạng mã cược.',
        'bot',
        {
          error: true,
        }
      )
    } finally {
      setIsTyping(false)
    }
  }

  const addSystemExample = () => {
    const exampleMessage = {
      id: Date.now().toString(),
      text: 'Dưới đây là một số ví dụ về mã cược:\n\n1. Cược đơn giản:\nmb\n25.36.47dd10\n\n\n2. Nhiều kiểu cược:\nvl.ct\n25.36b10\n47.58da5\n\n\n3. Cược nhiều đài:\n2dmn\n123.456.789xc2\n\n\n4. Định dạng đặc biệt:\ntp\n1234.5678da10 (Viết gọn cho 12.34 và 56.78)\n66.88da1.b5 (Đặt cược đá và bao lô cho cùng số)\n\n\n**Cấu trúc mã cược:**\n- Dòng đầu: Tên đài (vd: mb, vl.ct, 2dmn)\n- Các dòng sau: Số cược + Kiểu cược + Tiền cược\n\nKiểu cược phổ biến:\n- dd: Đầu đuôi\n- b: Bao lô\n- xc: Xỉu chủ\n- dau: Đầu\n- duoi: Đuôi\n- da: Đá',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, exampleMessage])
  }

  // Add function to handle fix suggestion click
  const applyFixSuggestion = (fixedCode) => {
    if (fixedCode) {
      addMessage(fixedCode, 'user')
    }
  }

  const value = {
    messages,
    isTyping,
    addMessage,
    clearMessages,
    addSystemExample,
    applyFixSuggestion,
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
