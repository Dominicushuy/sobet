// src/contexts/ChatContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react'
import { parseBetCode } from '../services/betCodeParser/parser'
import { formatBetCode } from '../services/betCodeParser/formatter'
import { calculateStake } from '../services/calculator/stakeCalculator'
import { calculatePotentialPrize } from '../services/calculator/prizeCalculator'
import { useBetCode } from './BetCodeContext'
import betCodeService from '@/services/betCodeService'
import { uid } from 'uid'
import { defaultBetTypes, defaultStations } from '@/config/defaults'

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

  /**
   * Phát hiện các trường hợp đặc biệt trong mã cược
   */
  function extractSpecialCases(betCode, parseResult) {
    const specialCases = {
      groupedNumbers: [],
      multipleBetTypes: [],
      type: null, // Thêm trường để xác định loại cụ thể
      description: '', // Thêm mô tả chi tiết
    }

    if (!parseResult || !parseResult.lines) {
      return specialCases
    }

    parseResult.lines.forEach((line, index) => {
      // 1. Kiểm tra số gộp thành nhóm (vd: 1234.5678da1)
      const groupedNumbers = line.originalLine.match(/\d{4,}/g)
      if (
        groupedNumbers &&
        groupedNumbers.some((num) => num.length % 2 === 0)
      ) {
        const separateLines = []

        if (line.betType?.alias === 'da' || line.betType?.alias === 'dv') {
          // Xử lý đặc biệt cho kiểu đá (da/dv)
          // Phân tích từng nhóm 4 chữ số thành cặp để đá với nhau
          const pairs = []

          for (const group of groupedNumbers) {
            if (group.length % 4 === 0) {
              // Tách nhóm 4 chữ số thành các cặp 2 chữ số để đá
              for (let i = 0; i < group.length; i += 4) {
                if (i + 4 <= group.length) {
                  const firstPair = group.substring(i, i + 2)
                  const secondPair = group.substring(i + 2, i + 4)
                  pairs.push(`${firstPair}.${secondPair}`)
                }
              }
            } else if (group.length % 2 === 0) {
              // Tách thành các số 2 chữ số riêng lẻ
              const singleNumbers = []
              for (let i = 0; i < group.length; i += 2) {
                singleNumbers.push(group.substring(i, i + 2))
              }
              if (singleNumbers.length >= 2) {
                // Tạo cặp từ các số này
                for (let i = 0; i < singleNumbers.length; i += 2) {
                  if (i + 1 < singleNumbers.length) {
                    pairs.push(`${singleNumbers[i]}.${singleNumbers[i + 1]}`)
                  }
                }
              }
            }
          }

          // Nếu có cặp đá sẵn (nhưng không phải là cặp đá gộp)
          const lineWithoutGroups = line.originalLine
            .split(/[a-zA-Z]/)[0] // Lấy phần trước kiểu cược
            .split('.')
            .filter((part) => !groupedNumbers.includes(part)) // Lọc bỏ các số gộp

          for (const part of lineWithoutGroups) {
            if (part.match(/^\d+\.\d+$/)) {
              // Đây là cặp đá có sẵn
              pairs.push(part)
            }
          }

          // Thêm betType và amount vào mỗi cặp
          const formattedAmount = Math.floor((line.amount || 10000) / 1000)
          const betTypeStr = `${line.betType.alias}${formattedAmount}`

          // Tạo ra một dòng cược riêng biệt cho mỗi cặp đá
          // Quan trọng: Thêm đài vào mỗi dòng cược
          const stationText = parseResult.station.name || 'mb'

          pairs.forEach((pair) => {
            separateLines.push(`${stationText}\n${pair}${betTypeStr}`)
          })

          // Cập nhật mô tả cho loại này
          if (specialCases.type === null) {
            specialCases.type = 'da_grouped'
            specialCases.description = `Mã đá gộp ${groupedNumbers.join(
              ', '
            )} được tách thành ${pairs.length} cặp đá riêng biệt`
          }
        } else {
          // Các kiểu cược khác - tách mỗi số 4 chữ số thành hai số 2 chữ số
          const expandedNumbers = []

          for (const group of groupedNumbers) {
            if (group.length % 2 === 0) {
              for (let i = 0; i < group.length; i += 2) {
                expandedNumbers.push(group.substring(i, i + 2))
              }
            }
          }

          // Tạo lại dòng với tất cả các số đã tách
          const existingNumbers = line.originalLine
            .split(/[a-zA-Z]/)[0]
            .split('.')
            .filter((n) => !groupedNumbers.includes(n))
          const allNumbers = [...existingNumbers, ...expandedNumbers].filter(
            Boolean
          )

          // Thêm betType và amount
          const formattedAmount = Math.floor((line.amount || 10000) / 1000)
          const betTypeStr = `${line.betType.alias}${formattedAmount}`

          // Không cần tách thành nhiều dòng cho các kiểu cược không phải đá
          separateLines.push(`${allNumbers.join('.')}${betTypeStr}`)

          // Cập nhật mô tả cho loại này
          if (specialCases.type === null) {
            specialCases.type = 'number_grouped'
            specialCases.description = `Số gộp ${groupedNumbers.join(
              ', '
            )} được tách thành các số 2 chữ số riêng biệt`
          }
        }

        if (separateLines.length > 0) {
          specialCases.groupedNumbers.push({
            originalLine: line.originalLine,
            explanation: `Số ${groupedNumbers.join(
              ', '
            )} sẽ được tách thành các cặp 2 chữ số`,
            separateLines,
          })
        }
      }

      // 2. Kiểm tra nhiều kiểu cược (vd: 23.45.67dd10.dau20.duoi5)
      if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
        const numbersPart = line.numbers ? line.numbers.join('.') : ''
        const separateLines = []

        // Tạo dòng cho kiểu cược chính
        const formattedMainAmount = Math.floor((line.amount || 10000) / 1000)
        const mainBetType = `${line.betType.alias}${formattedMainAmount}`

        // Quan trọng: Thêm đài vào mỗi dòng cược
        const stationText = parseResult.station.name || 'mb'

        // Tạo một dòng cược hoàn chỉnh bao gồm đài
        separateLines.push(`${stationText}\n${numbersPart}${mainBetType}`)

        // Tạo dòng cho mỗi kiểu cược bổ sung
        line.additionalBetTypes.forEach((additionalBet) => {
          const formattedAmount = Math.floor(
            (additionalBet.amount || 10000) / 1000
          )
          const betTypeStr = `${additionalBet.betType.alias}${formattedAmount}`
          separateLines.push(`${stationText}\n${numbersPart}${betTypeStr}`)
        })

        if (separateLines.length > 0) {
          specialCases.multipleBetTypes.push({
            originalLine: line.originalLine,
            explanation: `Nhiều kiểu cược sẽ được tách thành dòng riêng biệt`,
            separateLines,
          })

          // Cập nhật mô tả cho loại này nếu chưa có type nào được set
          if (specialCases.type === null) {
            const betTypes = [
              line.betType.alias,
              ...line.additionalBetTypes.map((b) => b.betType.alias),
            ]
            specialCases.type = 'multiple_bet_types'
            specialCases.description = `Nhiều kiểu cược (${betTypes.join(
              ', '
            )}) cho cùng dãy số được tách thành các dòng riêng biệt`
          }
        }
      }
    })

    return specialCases
  }

  // Kiểm tra xem một dòng có phải là dòng chỉ chứa đài không
  const isStationLine = (line) => {
    const cleanLine = line.trim().toLowerCase()

    // Kiểm tra các mẫu đài miền (mb, mt, mn, 2dmn, 3dmt, etc.)
    if (/^(mb|mt|mn|hn|hanoi)$/i.test(cleanLine)) return true
    if (/^\d+d(mn|mt|n|t|nam|trung)$/i.test(cleanLine)) return true

    // Kiểm tra từng đài trong danh sách đài
    for (const station of defaultStations) {
      if (
        station.name.toLowerCase() === cleanLine ||
        station.aliases.some((alias) => alias === cleanLine)
      ) {
        return true
      }
    }

    // Kiểm tra các đài ghép (vl.ct, etc.)
    if (cleanLine.includes('.')) {
      const parts = cleanLine.split('.')
      const allPartsAreStations = parts.every((part) => {
        return defaultStations.some(
          (station) =>
            station.name.toLowerCase() === part ||
            station.aliases.some((alias) => alias === part)
        )
      })

      if (allPartsAreStations) return true
    }

    return false
  }

  const processMultiStationBetCode = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return null

    const betCodesByStation = []
    let currentStation = null
    let isNewStation = true

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Detect if this line is a station line
      if (isStationLine(line)) {
        currentStation = line
        isNewStation = true
        continue
      }

      // If we have a station and this is a bet line
      if (currentStation) {
        // Create a new station-betcode pair
        betCodesByStation.push({
          station: currentStation,
          betLine: line,
          betCode: `${currentStation}\n${line}`,
        })

        // Only mark as new station for the first bet line after a station
        isNewStation = false
      }
    }

    return betCodesByStation.length > 0 ? betCodesByStation : null
  }

  const ensureCorrectBetCodeFormat = (betCode) => {
    if (!betCode || typeof betCode !== 'string') {
      return betCode
    }

    const lines = betCode.split('\n')
    if (lines.length <= 1) return betCode

    // Lấy danh sách alias từ defaultBetTypes
    const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)

    // Chỉ xử lý các dòng từ dòng thứ 2 trở đi (sau dòng đài)
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i]

      // Loại bỏ dấu chấm trước kiểu cược
      for (const alias of betTypeAliases) {
        const betTypeRegex = new RegExp(`\\.(${alias}\\d*(?:[,.n]\\d+)?)`, 'gi')
        line = line.replace(betTypeRegex, '$1')
      }

      lines[i] = line
    }

    return lines.join('\n')
  }

  const processUserMessage = async (text) => {
    setIsTyping(true)

    console.log('Processing user message:', text)

    try {
      // Short delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Format the bet code first for better parsing
      const formattedBetCode = formatBetCode(text)

      // NEW: Kiểm tra nếu có nhiều đài trong một mã cược
      const multiStationBetCodes = processMultiStationBetCode(formattedBetCode)

      console.log('multiStationBetCodes:', multiStationBetCodes)

      if (multiStationBetCodes) {
        // Xử lý từng cặp đài-dòng cược riêng biệt
        let successCount = 0
        let totalStake = 0
        let totalPotential = 0

        for (const item of multiStationBetCodes) {
          const betCodeResult = betCodeService.analyzeBetCode(item.betCode)

          if (betCodeResult.success) {
            const stakeAmount =
              betCodeResult.calculationResults.stakeResult?.totalStake || 0
            const potentialWinning =
              betCodeResult.calculationResults.prizeResult?.totalPotential || 0

            // Thêm vào danh sách nháp
            addDraftCode({
              id: uid(),
              station: betCodeResult.parseResult.station,
              lines: betCodeResult.parseResult.lines,
              originalText: item.betCode,
              formattedText:
                betCodeResult.formattedText !== item.betCode
                  ? betCodeResult.formattedText
                  : item.betCode,
              stakeAmount,
              potentialWinning,
              stakeDetails:
                betCodeResult.calculationResults.stakeResult?.details || [],
              prizeDetails:
                betCodeResult.calculationResults.prizeResult?.details || [],
              // Add permutation information if available
              permutations: betCodeResult.parseResult.permutations || {},
            })

            successCount++
            totalStake += stakeAmount
            totalPotential += potentialWinning
          }
        }

        if (successCount > 0) {
          // Hiển thị thông báo thành công
          addMessage(
            `Đã xử lý thành công ${successCount} mã cược từ ${multiStationBetCodes.length} dòng.`,
            'bot',
            {
              betCodeInfo: {
                multiStations: true,
                stationCount: new Set(
                  multiStationBetCodes.map((item) => item.station)
                ).size,
                lineCount: successCount,
                totalStake,
                potentialWin: totalPotential,
              },
            }
          )
        } else {
          // Không có mã cược nào thành công
          addMessage(
            'Không có mã cược hợp lệ nào được tìm thấy. Vui lòng kiểm tra lại định dạng của các dòng cược.',
            'bot',
            { error: true }
          )
        }

        setIsTyping(false)
        return
      }

      // Parse the bet code
      const parseResult = parseBetCode(formattedBetCode)

      console.log('Parsed result:', parseResult)

      // Xử lý khi parse result không thành công
      if (!parseResult.success) {
        // Trích xuất thông báo lỗi từ parseResult
        let errorMessage = 'Mã cược không hợp lệ. '

        // NEW: Handle calculation errors first (more specific)
        if (parseResult.calculationErrors) {
          errorMessage = `Mã cược có lỗi liên quan đến kiểu đặt cược:\n\n${parseResult.calculationErrors}`
        }
        // NEW: Handle line-specific errors
        else if (parseResult.lineErrors) {
          errorMessage = `Mã cược có lỗi ở các dòng cụ thể:\n\n${parseResult.lineErrors}`
        }
        // Handle existing errors
        else if (parseResult.errors && parseResult.errors.length > 0) {
          const detailedErrors = parseResult.errors
            .map((err) => err.message || err)
            .join(', ')
          errorMessage += `Chi tiết lỗi: ${detailedErrors}`
        }

        // Nếu có station nhưng không có dòng cược
        if (
          parseResult.station &&
          (!parseResult.lines || parseResult.lines.length === 0)
        ) {
          errorMessage = `Đã xác định đài ${parseResult.station.name}, nhưng không tìm thấy dòng cược hợp lệ. Vui lòng kiểm tra định dạng mã cược.`
        }

        // Nếu có lỗi ở các dòng cụ thể
        if (parseResult.lines && parseResult.lines.length > 0) {
          const lineErrors = []

          parseResult.lines.forEach((line, index) => {
            if (!line.valid && line.error) {
              // Định dạng rõ ràng hơn cho lỗi độ dài không nhất quán
              if (
                line.error.includes(
                  'Tất cả các số trong một dòng cược phải có cùng độ dài'
                )
              ) {
                lineErrors.push(
                  `Dòng ${index + 1}: ${
                    line.error
                  } - Không thể kết hợp các số có độ dài khác nhau (VD: 11 và 222)`
                )
              } else {
                lineErrors.push(`Dòng ${index + 1}: ${line.error}`)
              }
            }
          })

          if (lineErrors.length > 0) {
            errorMessage += `\n\nLỗi cụ thể:\n${lineErrors.join('\n')}`
          }
        }

        // Hiển thị thông báo lỗi
        addMessage(errorMessage, 'bot', {
          error: true,
          errors: parseResult.errors,
          parseResult: parseResult,
        })

        setIsTyping(false)
        return
      }

      if (parseResult.success) {
        // Calculate stake and potential prize
        const stakeResult = calculateStake(parseResult)
        const prizeResult = calculatePotentialPrize(parseResult)

        const totalStake = stakeResult.success ? stakeResult.totalStake : 0
        const totalPotential = prizeResult.success
          ? prizeResult.totalPotential
          : 0

        // Phát hiện các trường hợp đặc biệt
        const specialCases = extractSpecialCases(formattedBetCode, parseResult)

        // THAY ĐỔI: Kiểm tra xem có trường hợp đặc biệt cần tách không
        if (
          specialCases.groupedNumbers.length > 0 ||
          specialCases.multipleBetTypes.length > 0
        ) {
          // CÓ TRƯỜNG HỢP ĐẶC BIỆT -> TỰ ĐỘNG TÁCH

          // Get original station text
          const originalLines = text.split('\n')
          const originalStationText = originalLines[0].trim()

          // Thu thập tất cả các dòng đã tách
          const separateLines = [
            ...specialCases.groupedNumbers.flatMap(
              (group) => group.separateLines
            ),
            ...specialCases.multipleBetTypes.flatMap(
              (betTypes) => betTypes.separateLines
            ),
          ]

          // Thêm từng mã cược đã tách vào hệ thống
          let successCount = 0
          let totalStakeAmount = 0
          let totalPotentialWinAmount = 0
          const addedCodes = []

          for (let i = 0; i < separateLines.length; i++) {
            const line = separateLines[i]
            const separateCode = `${originalStationText}\n${line}`
            const separateResult = betCodeService.analyzeBetCode(separateCode)

            if (separateResult.success) {
              const codeId = uid()
              const stakeAmount =
                separateResult.calculationResults.stakeResult?.totalStake || 0
              const potentialWinning =
                separateResult.calculationResults.prizeResult?.totalPotential ||
                0

              addDraftCode({
                id: codeId,
                station: separateResult.parseResult.station,
                lines: separateResult.parseResult.lines,
                originalText: separateCode,
                formattedText:
                  separateResult.formattedText !== separateCode
                    ? separateResult.formattedText
                    : separateCode,
                stakeAmount,
                potentialWinning,
                stakeDetails:
                  separateResult.calculationResults.stakeResult?.details || [],
                prizeDetails:
                  separateResult.calculationResults.prizeResult?.details || [],
                autoExpanded: true,
                specialCase: specialCases.type,
              })

              successCount++
              totalStakeAmount += stakeAmount
              totalPotentialWinAmount += potentialWinning

              // Lưu thông tin mã cược đã thêm
              addedCodes.push({
                id: codeId,
                line,
                stakeAmount,
                potentialWinning,
              })
            }
          }

          // Thêm thông báo thành công cho người dùng
          if (successCount > 0) {
            let message = `Mã cược hợp lệ! Đã tự động tách thành ${successCount} mã cược và thêm vào danh sách.`

            // Thêm mô tả chi tiết về loại trường hợp đặc biệt
            if (specialCases.description) {
              message += `\n\n${specialCases.description}.`
            }

            if (formattedBetCode !== text) {
              // Đảm bảo định dạng hiển thị cho người dùng là đúng
              const correctedFormat =
                ensureCorrectBetCodeFormat(formattedBetCode)
              message +=
                '\n\nMã cược đã được tối ưu định dạng:\n```\n' +
                correctedFormat +
                '\n```'
            }

            // Thêm thông tin về tổng tiền cược và tiềm năng thắng
            addMessage(message, 'bot', {
              betCodeInfo: {
                station: parseResult.station.name,
                lineCount: successCount,
                totalStake: totalStakeAmount,
                potentialWin: totalPotentialWinAmount,
                formattedCode:
                  formattedBetCode !== text
                    ? ensureCorrectBetCodeFormat(formattedBetCode)
                    : null,
                isAutoExpanded: true,
                specialCasesType: specialCases.type,
                addedCodes, // Thêm thông tin các mã cược đã thêm
              },
              detailedCalculations: {
                totalStakeAmount,
                totalPotentialWinAmount,
                separateLines: separateLines.length,
                successfulLines: successCount,
              },
            })
          } else {
            addMessage(
              'Có lỗi xảy ra khi tách mã cược. Vui lòng kiểm tra lại định dạng mã cược.',
              'bot',
              { error: true }
            )
          }
        } else {
          // KHÔNG CÓ TRƯỜNG HỢP ĐẶC BIỆT -> XỬ LÝ BÌNH THƯỜNG

          // Update the multi-line handling (without special cases)
          if (parseResult.lines.length > 1) {
            // Multiple lines - split into individual bet codes

            // Get original station text (first line of input)
            const originalLines = text.split('\n')
            const originalStationText = originalLines[0].trim()

            // For each line, create and add an individual bet code
            for (let i = 0; i < parseResult.lines.length; i++) {
              const line = parseResult.lines[i]

              // Create a new bet code text with just this line
              const singleLineBetCode = `${originalStationText}\n${line.originalLine}`

              // Analyze this new bet code
              const singleLineResult =
                betCodeService.analyzeBetCode(singleLineBetCode)

              if (singleLineResult.success) {
                // Add the individual bet code to drafts with a unique ID
                addDraftCode({
                  id: `${Date.now()}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}-${i}`, // Ensure uniqueness
                  station: singleLineResult.parseResult.station,
                  lines: singleLineResult.parseResult.lines,
                  originalText: singleLineBetCode,
                  formattedText:
                    singleLineResult.formattedText !== singleLineBetCode
                      ? singleLineResult.formattedText
                      : singleLineBetCode,
                  stakeAmount:
                    singleLineResult.calculationResults.stakeResult
                      ?.totalStake || 0,
                  potentialWinning:
                    singleLineResult.calculationResults.prizeResult
                      ?.totalPotential || 0,
                  stakeDetails:
                    singleLineResult.calculationResults.stakeResult?.details ||
                    [],
                  prizeDetails:
                    singleLineResult.calculationResults.prizeResult?.details ||
                    [],
                })
              }
            }
          } else {
            // Single line - keep existing logic
            let message = `Mã cược hợp lệ! Đã thêm vào danh sách mã cược.`

            if (formattedBetCode !== text) {
              // Đảm bảo định dạng hiển thị cho người dùng là đúng
              const correctedFormat =
                ensureCorrectBetCodeFormat(formattedBetCode)
              message +=
                '\n\nMã cược đã được tối ưu định dạng:\n```\n' +
                correctedFormat +
                '\n```'
            }

            addMessage(message, 'bot', {
              betCodeInfo: {
                station: parseResult.station.name,
                lineCount: parseResult.lines.length,
                totalStake,
                potentialWin: totalPotential,
                formattedCode:
                  formattedBetCode !== text
                    ? ensureCorrectBetCodeFormat(formattedBetCode)
                    : null,
              },
              detailedCalculations: {
                stakeDetails: stakeResult.details || [],
                prizeDetails: prizeResult.details || [],
              },
            })

            // Add to draft codes
            addDraftCode({
              station: parseResult.station,
              lines: parseResult.lines,
              originalText: text,
              formattedText:
                formattedBetCode !== text ? formattedBetCode : text,
              stakeAmount: totalStake,
              potentialWinning: totalPotential,
              stakeDetails: stakeResult.details || [],
              prizeDetails: prizeResult.details || [],
            })
          }
        }
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
      text: 'Dưới đây là một số ví dụ về mã cược:\n\n1. Cược đơn giản:\nmb\n25.36.47dd10\n\n\n2. Nhiều kiểu cược:\nvl.ct\n25.36b10\n47.58da5\n\n\n3. Cược nhiều đài:\n2dmn\n123.456.789xc2\n\n\n4. Định dạng đặc biệt:\ntp\n1234.5678da10 (Viết gọn cho 12.34 và 56.78)\n66.88da1.b5 (Đặt cược đá và bao lô cho cùng số)\n\n\n5. Đặt cược nhiều đài trong một lần:\nmb\n763b2\n3dmn\n25.42da1\n2dmn\n28b5\n\n\n**Cấu trúc mã cược:**\n- Đài đặt ở mỗi dòng (vd: mb, vl.ct, 2dmn)\n- Các dòng sau: Số cược + Kiểu cược + Tiền cược\n\nKiểu cược phổ biến:\n- dd: Đầu đuôi\n- b: Bao lô\n- xc: Xỉu chủ\n- dau: Đầu\n- duoi: Đuôi\n- da: Đá',
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
