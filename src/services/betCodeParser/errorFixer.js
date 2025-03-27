// src/services/betCodeParser/errorFixer.js
import { defaultStations, defaultBetTypes } from '@/config/defaults'

/**
 * Gợi ý sửa lỗi cho mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Gợi ý sửa lỗi
 */
export function suggestFixes(betCode, errorResult) {
  if (!errorResult || !errorResult.hasErrors) {
    return {
      hasSuggestions: false,
      suggestions: [],
    }
  }

  const suggestions = []

  for (const error of errorResult.errors) {
    const suggestion = generateSuggestion(error, betCode)
    if (suggestion) {
      suggestions.push(suggestion)
    }
  }

  return {
    hasSuggestions: suggestions.length > 0,
    suggestions,
  }
}

/**
 * Sửa lỗi tự động cho mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Kết quả sửa lỗi
 */
export function fixBetCode(betCode, errorResult) {
  if (!betCode || !errorResult || !errorResult.hasErrors) {
    return {
      success: false,
      fixed: betCode,
      changes: [],
    }
  }

  // Phân tách các dòng
  let lines = betCode.split(/\r?\n/)
  const changes = []

  // Sắp xếp lỗi theo dòng và thứ tự xuất hiện
  const sortedErrors = [...errorResult.errors].sort((a, b) => {
    if (a.lineIndex !== b.lineIndex) {
      return a.lineIndex - b.lineIndex
    }
    return a.scope === 'station' ? -1 : 1
  })

  for (const error of sortedErrors) {
    const fix = generateFix(error, lines)
    if (fix && fix.newLine) {
      const lineIndex = error.lineIndex !== undefined ? error.lineIndex : 0
      changes.push({
        lineIndex,
        oldLine: lines[lineIndex],
        newLine: fix.newLine,
        errorType: error.type,
      })
      lines[lineIndex] = fix.newLine
    }
  }

  // Sau khi sửa các lỗi cơ bản, thực hiện sửa lỗi đặc biệt
  lines = fixSpecialCases(lines, changes)

  return {
    success: changes.length > 0,
    fixed: lines.join('\n'),
    changes,
  }
}

/**
 * Sửa các trường hợp đặc biệt
 * @param {Array} lines - Các dòng mã cược
 * @param {Array} changes - Danh sách thay đổi
 * @returns {Array} Các dòng đã được sửa
 */
function fixSpecialCases(lines, changes) {
  // Sửa trường hợp đài có dấu chấm cuối cùng
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Đài kết thúc bằng dấu chấm
    if (/^\s*[a-z]+\.+\s*$/i.test(line)) {
      // Dòng chỉ có tên đài và dấu chấm
      const newLine = line.replace(/\.+\s*$/, '')
      changes.push({
        lineIndex: i,
        oldLine: line,
        newLine,
        errorType: 'TRAILING_DOTS',
      })
      lines[i] = newLine
    }

    // Dấu chấm ở đầu dòng
    if (/^\s*\./.test(line)) {
      const newLine = line.replace(/^\s*\./, '')
      changes.push({
        lineIndex: i,
        oldLine: line,
        newLine,
        errorType: 'LEADING_DOTS',
      })
      lines[i] = newLine
    }

    // Sửa trường hợp "xcdui" thành "xcduoi"
    if (line.includes('xcdui')) {
      const newLine = line.replace(/xcdui/g, 'xcduoi')
      changes.push({
        lineIndex: i,
        oldLine: line,
        newLine,
        errorType: 'INVALID_BET_TYPE_ALIAS',
      })
      lines[i] = newLine
    }

    // Sửa dấu gạch ngang thành dấu chấm
    if (line.includes('-') && !/^\s*[a-z]+\s*$/i.test(line)) {
      const newLine = line.replace(/-/g, '.')
      changes.push({
        lineIndex: i,
        oldLine: line,
        newLine,
        errorType: 'HYPHEN_SEPARATOR',
      })
      lines[i] = newLine
    }

    // Handle grouped numbers with "da" bet type specifically
    if (/\d{4,}/.test(line) && line.match(/da\d+/i)) {
      const parts = line.split(/([a-z]+\d+(?:[,.]\d+)?)/i)

      if (parts.length >= 2) {
        const numbersPart = parts[0]
        const betTypePart = parts[1] || ''

        // Find all 4+ digit numbers
        const allParts = numbersPart.split('.')

        // Process each part
        const processedLines = []

        for (const part of allParts) {
          if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
            // For "da" bet type, create pairs
            for (let j = 0; j < part.length; j += 4) {
              if (j + 4 <= part.length) {
                const firstPair = part.substr(j, 2)
                const secondPair = part.substr(j + 2, 2)
                processedLines.push(`${firstPair}.${secondPair}${betTypePart}`)
              }
            }
          }
        }

        if (processedLines.length > 0) {
          changes.push({
            lineIndex: i,
            oldLine: line,
            newLine: processedLines[0], // Replace with the first processed line
            additionalLines: processedLines.slice(1), // Store additional lines if needed
            errorType: 'GROUPED_NUMBERS_SPECIAL',
          })

          lines[i] = processedLines[0]
          // If we need to add more lines, we'd need to expand the lines array
          // This would require modifying the return structure
        }
      }
    }

    // Thêm tiền mặc định nếu thiếu (vd: dd, b, da)
    const betTypeWithoutAmount = /([a-z]+)(?!\d)(\s|$)/i.exec(line)
    if (betTypeWithoutAmount) {
      const betTypeAlias = betTypeWithoutAmount[1].toLowerCase()
      const validBetType = defaultBetTypes.some((bt) =>
        bt.aliases.includes(betTypeAlias)
      )

      if (validBetType) {
        const newLine = line.replace(
          new RegExp(`${betTypeAlias}(\\s|$)`, 'i'),
          `${betTypeAlias}10$1`
        )
        changes.push({
          lineIndex: i,
          oldLine: line,
          newLine,
          errorType: 'MISSING_AMOUNT',
        })
        lines[i] = newLine
      }
    }

    // Cải tiến: Xử lý số dạng nhóm (vd: 1234 -> 12.34)
    if (/\d{4,}/.test(line)) {
      const parts = line.split(/([a-z]+\d+(?:[,.]\d+)?)/i)

      if (parts.length >= 2) {
        const numbersPart = parts[0]
        const betTypePart = parts[1] || ''

        const processedNumbers = []
        const numParts = numbersPart.split('.')

        let hasChanges = false

        for (const part of numParts) {
          if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
            // Tách thành các cặp 2 chữ số
            for (let j = 0; j < part.length; j += 2) {
              if (j + 2 <= part.length) {
                processedNumbers.push(part.substr(j, 2))
              }
            }
            hasChanges = true
          } else if (/^\d+$/.test(part)) {
            processedNumbers.push(part)
          }
        }

        if (hasChanges) {
          const newLine = `${processedNumbers.join('.')}${betTypePart}`
          changes.push({
            lineIndex: i,
            oldLine: line,
            newLine,
            errorType: 'GROUPED_NUMBERS',
          })
          lines[i] = newLine
        }
      }
    }
  }

  // Tìm tên đài ghép liền nhau và thêm dấu chấm
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const mergedStations = findMergedStations(line)
    if (mergedStations.match) {
      changes.push({
        lineIndex: i,
        oldLine: line,
        newLine: mergedStations.newLine,
        errorType: 'MERGED_STATIONS',
      })
      lines[i] = mergedStations.newLine
    }
  }

  // Cải tiến: Tách dòng có nhiều kiểu cược (vd: 23.45dd10.dau5)
  // Lưu ý: Khi tách dòng, chúng ta cần phải cập nhật toàn bộ mảng dòng
  let newLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const multipleBetTypes = extractMultipleBetTypes(line)

    if (multipleBetTypes.length > 1) {
      // Trích xuất phần số cược
      const parts = splitLineIntoParts(line)

      if (parts.numbersPart) {
        // Báo cáo thay đổi - chỉ lưu dòng đầu tiên thay thế
        changes.push({
          lineIndex: i,
          oldLine: line,
          newLine: `${parts.numbersPart}${multipleBetTypes[0]}`,
          errorType: 'MULTIPLE_BET_TYPES',
        })

        // Thêm dòng đầu tiên vào newLines
        newLines.push(`${parts.numbersPart}${multipleBetTypes[0]}`)

        // Thêm các dòng còn lại
        for (let j = 1; j < multipleBetTypes.length; j++) {
          newLines.push(`${parts.numbersPart}${multipleBetTypes[j]}`)
        }
      } else {
        newLines.push(line)
      }
    } else {
      newLines.push(line)
    }
  }

  // Nếu đã có sự thay đổi, cập nhật lại mảng lines
  if (newLines.length !== lines.length) {
    lines = newLines
  }

  return lines
}

/**
 * Trích xuất nhiều kiểu cược từ một dòng
 */
function extractMultipleBetTypes(line) {
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  const result = []

  // Chuẩn hóa line
  const normalizedLine = line
    .replace(/xcdui/g, 'xcduoi')
    .replace(/(\b|[^a-z])dui(\d+|$)/g, '$1duoi$2')
    .replace(/[,\- ]+/g, '.')

  // Tạo pattern với word boundary (\b) để đảm bảo tìm đúng kiểu cược
  // Sắp xếp alias theo độ dài (dài nhất trước)
  const betTypePattern = betTypeAliases
    .sort((a, b) => b.length - a.length)
    .map((alias) => `\\b${alias}\\b`)
    .join('|')

  // Tìm tất cả các kiểu cược
  const betTypeRegex = new RegExp(
    `(${betTypePattern})(\\d+(?:[,.n]\\d+)?)`,
    'gi'
  )

  let match
  while ((match = betTypeRegex.exec(normalizedLine)) !== null) {
    result.push(match[0])
  }

  return result
}

/**
 * Tách dòng thành phần số và phần kiểu cược
 */
function splitLineIntoParts(line) {
  // Chuẩn hóa dòng
  const normalizedLine = line
    .replace(/xcdui/g, 'xcduoi')
    .replace(/(\b|[^a-z])dui(\d+|$)/g, '$1duoi$2')
    .replace(/[,\- ]+/g, '.')

  // Tạo pattern từ tất cả các alias kiểu cược
  const betTypeAliases = defaultBetTypes
    .flatMap((bt) => bt.aliases)
    .sort((a, b) => b.length - a.length)
    .join('|')

  // Tìm vị trí kiểu cược đầu tiên
  const regex = new RegExp(`\\b(${betTypeAliases})\\d*`, 'i')
  const match = regex.exec(normalizedLine)

  if (match) {
    return {
      numbersPart: normalizedLine.substring(0, match.index),
      firstBetTypePos: match.index,
    }
  }

  return { numbersPart: '', firstBetTypePos: -1 }
}

/**
 * Kiểm tra xem ký tự có phải là chữ cái hay không
 */
function isAlphabetChar(char) {
  return /[a-z]/i.test(char)
}

/**
 * Tìm các đài ghép liền nhau trong một dòng
 * @param {string} line - Dòng cược
 * @returns {object} Kết quả tìm kiếm
 */
function findMergedStations(line) {
  // Chỉ xét dòng đầu tiên
  if (line.includes(' ') || line.includes('.') || !containsLetters(line)) {
    return { match: false }
  }

  const stationAliases = getAllStationAliases()
  const line_lower = line.toLowerCase()

  // Tìm trường hợp đặc biệt như dnaictho, tpho.dongthap
  for (const station1 of defaultStations) {
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      if (line_lower.startsWith(alias1)) {
        const remainingText = line_lower.substring(alias1.length)

        for (const station2 of defaultStations) {
          // Không xét ghép với chính nó
          if (station1.name === station2.name) continue

          for (const alias2 of [
            station2.name.toLowerCase(),
            ...station2.aliases,
          ]) {
            if (remainingText === alias2 || remainingText.startsWith(alias2)) {
              return {
                match: true,
                newLine: line.replace(alias1 + alias2, `${alias1}.${alias2}`),
              }
            }
          }
        }
      }
    }
  }

  // Tìm 2 đài ghép liền nhau
  for (let i = 0; i < stationAliases.length; i++) {
    for (let j = 0; j < stationAliases.length; j++) {
      if (i === j) continue

      const alias1 = stationAliases[i]
      const alias2 = stationAliases[j]

      // Regex tìm 2 đài liền nhau không có dấu phân cách
      const regex = new RegExp(`^(${alias1})(${alias2})(.*)$`, 'i')
      const match = line.match(regex)

      if (match) {
        const newLine = `${match[1]}.${match[2]}${match[3]}`
        return { match: true, newLine }
      }
    }
  }

  return { match: false }
}

/**
 * Kiểm tra xem chuỗi có chứa chữ cái không
 */
function containsLetters(str) {
  return /[a-z]/i.test(str)
}

/**
 * Lấy tất cả các alias của đài
 * @returns {Array} Danh sách alias
 */
function getAllStationAliases() {
  const aliases = []
  for (const station of defaultStations) {
    aliases.push(station.name.toLowerCase())
    aliases.push(...station.aliases)
  }
  // Sắp xếp để ưu tiên các alias dài hơn trước
  return aliases.sort((a, b) => b.length - a.length)
}

/**
 * Tạo gợi ý sửa lỗi
 * @param {object} error - Thông tin lỗi
 * @param {string} betCode - Mã cược gốc
 * @returns {object} Gợi ý
 */
function generateSuggestion(error, betCode) {
  switch (error.type) {
    case 'INVALID_STATION':
      return {
        message: `Đài "${
          error.message.split('"')[1] || error.message.split(' ')[1]
        }" không hợp lệ. Hãy kiểm tra chính tả hoặc chọn một đài khác.`,
        suggestion: 'Kiểm tra chính tả hoặc chọn một đài khác.',
      }
    case 'STATION_NOT_AVAILABLE':
      return {
        message: error.message,
        suggestion: 'Hãy chọn đài khác hoặc đặt cược vào ngày khác.',
      }
    case 'INVALID_STATION_COUNT':
      return {
        message: error.message,
        suggestion:
          'Điều chỉnh số lượng đài cho phù hợp với lịch xổ số hôm nay.',
      }
    case 'NO_BET_TYPE':
      return {
        message: 'Thiếu kiểu cược.',
        suggestion: 'Thêm kiểu cược vào cuối dòng. Ví dụ: dd10, b5, xc2...',
      }
    case 'INVALID_BET_TYPE':
      return {
        message: error.message,
        suggestion:
          'Sử dụng các kiểu cược phổ biến như: dd, b, xc, dau, duoi...',
      }
    case 'INCOMPATIBLE_BET_TYPE':
      return {
        message: error.message,
        suggestion: 'Chọn kiểu cược khác phù hợp với miền đã chọn.',
      }
    case 'NO_NUMBERS':
      return {
        message: 'Thiếu số cược.',
        suggestion: 'Thêm số cược vào dòng. Ví dụ: 23.45.67dd10',
      }
    case 'INVALID_NUMBER_FORMAT':
      return {
        message: error.message,
        suggestion: 'Số cược phải là các chữ số. Ví dụ: 23, 45, 678...',
      }
    case 'INVALID_DIGIT_COUNT':
      return {
        message: error.message,
        suggestion: 'Điều chỉnh số chữ số phù hợp với kiểu cược.',
      }
    case 'INVALID_AMOUNT':
      return {
        message: 'Số tiền cược không hợp lệ.',
        suggestion: 'Thêm số tiền cược vào sau kiểu cược. Ví dụ: dd10, b5...',
      }
    case 'MERGED_STATIONS':
      return {
        message: 'Các đài ghép liền nhau, nên sử dụng dấu chấm để phân cách.',
        suggestion: 'Sử dụng dấu chấm để phân cách các đài. Ví dụ: vl.ct',
      }
    case 'TRAILING_DOTS':
      return {
        message: 'Đài có dấu chấm ở cuối, có thể gây nhầm lẫn.',
        suggestion: 'Loại bỏ dấu chấm ở cuối tên đài.',
      }
    case 'MIXED_REGIONS':
      return {
        message: 'Không thể kết hợp các đài từ các miền khác nhau.',
        suggestion: 'Chỉ kết hợp các đài cùng miền với nhau.',
      }
    case 'LEADING_DOTS':
      return {
        message: 'Dòng có dấu chấm ở đầu, có thể gây nhầm lẫn.',
        suggestion: 'Loại bỏ dấu chấm ở đầu dòng.',
      }
    case 'HYPHEN_SEPARATOR':
      return {
        message: 'Dấu gạch ngang được sử dụng làm dấu phân cách.',
        suggestion:
          'Sử dụng dấu chấm thay cho dấu gạch ngang. Ví dụ: 12.34 thay vì 12-34',
      }
    case 'MISSING_AMOUNT':
      return {
        message: 'Thiếu số tiền cược cho kiểu cược.',
        suggestion: 'Thêm số tiền cược sau kiểu cược. Ví dụ: dd10 thay vì dd',
      }
    case 'GROUPED_NUMBERS':
      return {
        message: 'Các số được viết liền nhau cần được tách ra.',
        suggestion: 'Tách các số thành cặp 2 chữ số. Ví dụ: 1234 thành 12.34',
      }
    case 'MULTIPLE_BET_TYPES':
      return {
        message: 'Nhiều kiểu cược trong một dòng nên được tách riêng.',
        suggestion: 'Tách thành nhiều dòng riêng biệt cho mỗi kiểu cược.',
      }
    default:
      return {
        message: error.message,
        suggestion: 'Kiểm tra lại mã cược.',
      }
  }
}

/**
 * Tạo sửa lỗi cho một lỗi cụ thể
 * @param {object} error - Thông tin lỗi
 * @param {Array} lines - Các dòng mã cược
 * @returns {object} Sửa lỗi
 */
function generateFix(error, lines) {
  const lineIndex = error.lineIndex !== undefined ? error.lineIndex : 0
  const line = lines[lineIndex]

  switch (error.type) {
    case 'INVALID_STATION': {
      // Sửa tên đài
      const invalidStation =
        error.message.split('"')[1] || error.message.split(' ')[1]
      const suggestedStation = findSimilarStation(invalidStation)
      if (suggestedStation) {
        return {
          newLine: suggestedStation,
        }
      }
      break
    }
    case 'INVALID_STATION_COUNT': {
      // Điều chỉnh số lượng đài
      const stationCount = parseInt(line.match(/^(\d+)/)?.[1], 10)
      if (!stationCount) return null

      const region =
        line.toLowerCase().includes('nam') || line.toLowerCase().includes('dmn')
          ? 'south'
          : 'central'
      const currentDay = new Date().getDay()
      const maxCount = getMaxStationsForRegionOnDay(region, currentDay)

      if (stationCount > maxCount) {
        // Tạo mẫu với số lượng đài điều chỉnh
        return {
          newLine: line.replace(/^(\d+)/, maxCount),
        }
      }
      break
    }
    case 'NO_BET_TYPE':
      // Thêm kiểu cược mặc định
      if (line && !line.includes('dd')) {
        return {
          newLine: `${line}dd10`,
        }
      }
      break
    case 'INVALID_BET_TYPE':
      // Sửa kiểu cược không hợp lệ
      if (line) {
        const betTypeRegex = /([a-z]+)(\d+(?:[,.]\d+)?)?$/i
        const match = line.match(betTypeRegex)
        if (match) {
          const invalidBetType = match[1]
          const amount = match[2] || '10'
          const suggestedBetType = findSimilarBetType(invalidBetType)
          if (suggestedBetType) {
            return {
              newLine: line.replace(
                betTypeRegex,
                `${suggestedBetType}${amount}`
              ),
            }
          }
        }
      }
      break
    case 'INVALID_NUMBER_FORMAT':
      // Sửa số không hợp lệ
      if (line && error.number) {
        const cleanedNumber = error.number.replace(/\D/g, '')
        if (cleanedNumber && cleanedNumber !== error.number) {
          return {
            newLine: line.replace(error.number, cleanedNumber),
          }
        }
      }
      break
    case 'INVALID_DIGIT_COUNT':
      // Sửa số chữ số không hợp lệ
      if (line && error.number) {
        const match = error.message.match(/yêu cầu (\d+)/)
        if (match) {
          const requiredDigits = parseInt(match[1], 10)
          const paddedNumber = error.number.padStart(requiredDigits, '0')
          if (paddedNumber && paddedNumber !== error.number) {
            return {
              newLine: line.replace(error.number, paddedNumber),
            }
          }
        }
      }
      break
    case 'INVALID_AMOUNT':
      // Thêm số tiền mặc định
      if (line) {
        const lastChar = line.charAt(line.length - 1)
        if (!/\d/.test(lastChar)) {
          return {
            newLine: `${line}10`,
          }
        } else {
          const betTypeRegex = /([a-z]+)$/i
          const match = line.match(betTypeRegex)
          if (match) {
            return {
              newLine: `${line}10`,
            }
          }
        }
      }
      break
    case 'TRAILING_DOTS':
      // Loại bỏ dấu chấm ở cuối
      if (line) {
        return {
          newLine: line.replace(/\.+$/, ''),
        }
      }
      break
    case 'LEADING_DOTS':
      // Loại bỏ dấu chấm ở đầu
      if (line) {
        return {
          newLine: line.replace(/^\s*\./, ''),
        }
      }
      break
    case 'HYPHEN_SEPARATOR':
      // Đổi dấu gạch ngang thành dấu chấm
      if (line) {
        return {
          newLine: line.replace(/-/g, '.'),
        }
      }
      break
    case 'MISSING_AMOUNT':
      // Thêm số tiền mặc định 10
      if (line) {
        const betTypeRegex = /([a-z]+)(?!\d)(\s|$)/i
        const match = line.match(betTypeRegex)
        if (match) {
          const betType = match[1]
          const validBetType = defaultBetTypes.some((bt) =>
            bt.aliases.includes(betType.toLowerCase())
          )

          if (validBetType) {
            return {
              newLine: line.replace(
                new RegExp(`${betType}(\\s|$)`, 'i'),
                `${betType}10$1`
              ),
            }
          }
        }
      }
      break
    case 'MIXED_REGIONS':
      // Không thể sửa tự động, chỉ gợi ý
      break
    case 'GROUPED_NUMBERS':
      // Xử lý số nhóm (vd: 1234 -> 12.34)
      if (line) {
        const parts = line.split(/([a-z]+\d+(?:[,.]\d+)?)/i)

        if (parts.length >= 2) {
          const numbersPart = parts[0]
          const betTypePart = parts[1] || ''

          const processedNumbers = []
          const numParts = numbersPart.split('.')

          let hasChanges = false

          for (const part of numParts) {
            if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
              // Tách thành các cặp 2 chữ số
              for (let i = 0; i < part.length; i += 2) {
                if (i + 2 <= part.length) {
                  processedNumbers.push(part.substr(i, 2))
                }
              }
              hasChanges = true
            } else if (/^\d+$/.test(part)) {
              processedNumbers.push(part)
            }
          }

          if (hasChanges) {
            return {
              newLine: `${processedNumbers.join('.')}${betTypePart}`,
            }
          }
        }
      }
      break
    case 'MULTIPLE_BET_TYPES':
      // Xử lý nhiều kiểu cược trong một dòng
      if (line) {
        const multipleBetTypes = extractMultipleBetTypes(line)

        if (multipleBetTypes.length > 1) {
          const parts = splitLineIntoParts(line)

          if (parts.numbersPart) {
            return {
              newLine: `${parts.numbersPart}${multipleBetTypes[0]}`,
            }
          }
        }
      }
      break
  }

  return null
}

/**
 * Lấy số lượng đài tối đa cho miền vào ngày cụ thể
 * @param {string} region - Miền
 * @param {number} day - Ngày trong tuần
 * @returns {number} Số lượng đài tối đa
 */
function getMaxStationsForRegionOnDay(region, day) {
  // Số lượng đài xổ mỗi ngày theo miền
  const stationCounts = {
    south: {
      0: 3, // Chủ nhật
      1: 3, // Thứ hai
      2: 3, // Thứ ba
      3: 3, // Thứ tư
      4: 3, // Thứ năm
      5: 3, // Thứ sáu
      6: 4, // Thứ bảy
    },
    central: {
      0: 3, // Chủ nhật
      1: 2, // Thứ hai
      2: 2, // Thứ ba
      3: 2, // Thứ tư
      4: 3, // Thứ năm
      5: 2, // Thứ sáu
      6: 3, // Thứ bảy
    },
    north: {
      0: 1, // Chủ nhật
      1: 1, // Thứ hai
      2: 1, // Thứ ba
      3: 1, // Thứ tư
      4: 1, // Thứ năm
      5: 1, // Thứ sáu
      6: 1, // Thứ bảy
    },
  }

  return stationCounts[region]?.[day] || 1
}

/**
 * Tìm đài tương tự với đài không hợp lệ
 * @param {string} invalidStation - Tên đài không hợp lệ
 * @returns {string} Tên đài gợi ý
 */
function findSimilarStation(invalidStation) {
  if (!invalidStation) return null

  const normalized = invalidStation.toLowerCase()

  // Kiểm tra đài nhiều miền đặc biệt
  const multiStationMatch = normalized.match(/^(\d+)([a-z]+)/)
  if (multiStationMatch) {
    const count = parseInt(multiStationMatch[1], 10)
    const regionPart = multiStationMatch[2]

    // Kiểm tra nếu là phần miền nam/trung
    if (['dmn', 'dn', 'mn', 'dnam', 'mnam'].includes(regionPart)) {
      return `${count}dmn`
    } else if (['dmt', 'dt', 'mt', 'dtrung', 'mtrung'].includes(regionPart)) {
      return `${count}dmt`
    }
  }

  // Tìm đài có alias gần giống nhất
  let bestMatch = null
  let highestScore = 0

  for (const station of defaultStations) {
    const aliases = [station.name.toLowerCase(), ...station.aliases]
    for (const alias of aliases) {
      const score = calculateSimilarity(normalized, alias)
      if (score > highestScore) {
        highestScore = score
        bestMatch = alias
      }
    }
  }

  return highestScore > 0.6 ? bestMatch : null
}

/**
 * Tìm kiểu cược tương tự với kiểu cược không hợp lệ
 * @param {string} invalidBetType - Kiểu cược không hợp lệ
 * @returns {string} Kiểu cược gợi ý
 */
function findSimilarBetType(invalidBetType) {
  if (!invalidBetType) return 'dd'

  const normalized = invalidBetType.toLowerCase()

  // Trường hợp đặc biệt: xcdui -> xcduoi
  if (normalized === 'xcdui') return 'xcduoi'
  if (normalized === 'dui') return 'duoi'
  if (normalized === 'b7lo') return 'b7l'
  if (normalized === 'b8lo') return 'b8l'

  // Tìm kiểu cược có alias gần giống nhất
  let bestMatch = null
  let highestScore = 0

  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      const score = calculateSimilarity(normalized, alias)
      if (score > highestScore) {
        highestScore = score
        bestMatch = alias
      }
    }
  }

  return highestScore > 0.6 ? bestMatch : 'dd'
}

/**
 * Tính độ giống nhau giữa hai chuỗi (0-1)
 * @param {string} str1 - Chuỗi thứ nhất
 * @param {string} str2 - Chuỗi thứ hai
 * @returns {number} Độ giống nhau (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1
  if (!str1 || !str2) return 0

  // Sử dụng khoảng cách Levenshtein đơn giản
  const len1 = str1.length
  const len2 = str2.length

  // Khởi tạo ma trận
  const matrix = Array(len1 + 1)
    .fill()
    .map(() => Array(len2 + 1).fill(0))

  // Điền giá trị đầu tiên
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  // Điền ma trận
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  // Khoảng cách Levenshtein là giá trị ở góc dưới bên phải
  const distance = matrix[len1][len2]

  // Chuyển đổi khoảng cách thành độ giống nhau
  return 1 - distance / Math.max(len1, len2)
}
