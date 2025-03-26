// src/services/betCodeParser/errorDetector.js
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'
import { REGIONS } from '@/config/constants'

/**
 * Phát hiện các lỗi trong mã cược
 * @param {string} betCode - Mã cược cần kiểm tra
 * @param {object} parsedResult - Kết quả phân tích từ parser (nếu có)
 * @returns {object} Danh sách lỗi và mức độ nghiêm trọng
 */
export function detectErrors(betCode, parsedResult = null) {
  const errors = []

  // Kiểm tra mã cược rỗng
  if (!betCode || typeof betCode !== 'string' || betCode.trim() === '') {
    errors.push({
      type: 'EMPTY_CODE',
      message: 'Mã cược rỗng',
      severity: 'error',
      position: null,
    })
    return {
      hasErrors: errors.length > 0,
      errors,
    }
  }

  // Nếu không có kết quả phân tích, chỉ thực hiện kiểm tra cơ bản
  if (!parsedResult) {
    const basicErrors = detectBasicErrors(betCode)
    errors.push(...basicErrors)
    return {
      hasErrors: errors.length > 0,
      errors,
    }
  }

  // Kiểm tra lỗi từ kết quả phân tích
  if (!parsedResult.success) {
    errors.push({
      type: 'PARSE_FAILED',
      message: 'Không thể phân tích mã cược',
      severity: 'error',
      position: null,
      details: parsedResult.errors,
    })
  }

  // Kiểm tra từng dòng
  if (parsedResult.lines && Array.isArray(parsedResult.lines)) {
    parsedResult.lines.forEach((line, index) => {
      const lineErrors = detectLineErrors(line, index)
      errors.push(...lineErrors)
    })
  }

  // Kiểm tra các lỗi cụ thể
  errors.push(...detectStructuralErrors(betCode, parsedResult))
  errors.push(...detectCommonMistakes(betCode))
  errors.push(...detectSpecialCases(betCode, parsedResult))

  return {
    hasErrors: errors.length > 0,
    errors,
  }
}

/**
 * Phát hiện các lỗi cơ bản trong mã cược
 * @param {string} betCode - Mã cược cần kiểm tra
 * @returns {array} Danh sách lỗi cơ bản
 */
function detectBasicErrors(betCode) {
  const errors = []

  // Kiểm tra có chứa ký tự số nào không
  if (!/\d/.test(betCode)) {
    errors.push({
      type: 'NO_NUMBERS',
      message: 'Mã cược không chứa số',
      severity: 'error',
      position: null,
    })
  }

  // Kiểm tra có chứa kiểu cược không
  const hasBetType = checkBetTypePresence(betCode)

  if (!hasBetType) {
    errors.push({
      type: 'NO_BET_TYPE',
      message: 'Không tìm thấy kiểu cược',
      severity: 'error',
      position: null,
    })
  }

  // Kiểm tra có chứa đài nào không
  const hasStation = checkStationPresence(betCode)

  if (!hasStation) {
    errors.push({
      type: 'NO_STATION',
      message: 'Không tìm thấy thông tin đài',
      severity: 'error',
      position: null,
    })
  }

  // Kiểm tra có ký tự đặc biệt không hợp lệ
  const invalidCharsMatch = betCode.match(/[^\w\s,.;:\-+*=x()[\]{}]/gi)
  if (invalidCharsMatch) {
    errors.push({
      type: 'INVALID_CHARACTERS',
      message: `Mã cược chứa ký tự không hợp lệ: ${invalidCharsMatch.join(
        ', '
      )}`,
      severity: 'warning',
      position: null,
    })
  }

  // Kiểm tra định dạng nhiều đài nhưng thiếu thông tin
  const multiStationMatch = betCode.match(/(\d+)(dmn|dmt|dn)(\s*$|\s+[^\d])/i)
  if (multiStationMatch && !multiStationMatch[3].trim()) {
    errors.push({
      type: 'INCOMPLETE_MULTI_STATION',
      message: 'Thiếu thông tin sau đài nhiều miền',
      severity: 'error',
      position: null,
    })
  }

  // Kiểm tra dấu chấm/phẩy thừa ở cuối
  if (/[.,]$/.test(betCode.trim())) {
    errors.push({
      type: 'TRAILING_PUNCTUATION',
      message: 'Dấu chấm/phẩy thừa ở cuối mã cược',
      severity: 'warning',
      position: null,
    })
  }

  // Kiểm tra dấu chấm/phẩy thừa ở đầu
  if (/^[.,]/.test(betCode.trim())) {
    errors.push({
      type: 'LEADING_PUNCTUATION',
      message: 'Dấu chấm/phẩy thừa ở đầu mã cược',
      severity: 'warning',
      position: null,
    })
  }

  return errors
}

/**
 * Kiểm tra sự hiện diện của kiểu cược trong mã
 * @param {string} betCode - Mã cược cần kiểm tra
 * @returns {boolean} true nếu có chứa kiểu cược
 */
function checkBetTypePresence(betCode) {
  // Kiểm tra các kiểu cược thông thường
  const standardBetTypePresent = defaultBetTypes.some((betType) => {
    if (betCode.toLowerCase().includes(betType.name.toLowerCase())) return true
    return betType.aliases.some((alias) =>
      betCode.toLowerCase().includes(alias.toLowerCase())
    )
  })

  if (standardBetTypePresent) return true

  // Kiểm tra các dạng đặc biệt như "dau10", "duoi10"
  const specialPatterns = [
    /dau\d+/i, // Đầu
    /d[au]oi\d+/i, // Đuôi (duoi/daoi)
    /b\d+/i, // Bao lô
    /da\d+/i, // Đá
    /xc\d+/i, // Xỉu chủ
    /b7lo\d+/i, // Bao lô 7
    /bdao\d+/i, // Bao đảo
    /x\d+/i, // Xỉu chủ (viết tắt)
    /nto\d+/i, // Nhất to
  ]

  return specialPatterns.some((pattern) => pattern.test(betCode))
}

/**
 * Kiểm tra sự hiện diện của đài trong mã
 * @param {string} betCode - Mã cược cần kiểm tra
 * @returns {boolean} true nếu có chứa đài
 */
function checkStationPresence(betCode) {
  // Kiểm tra tên đầy đủ hoặc alias của đài
  const standardStationPresent = defaultStations.some((station) => {
    if (betCode.toLowerCase().includes(station.name.toLowerCase())) return true
    return station.aliases.some((alias) =>
      betCode.toLowerCase().includes(alias.toLowerCase())
    )
  })

  if (standardStationPresent) return true

  // Kiểm tra các dạng đài đặc biệt như "2dmn", "3dmt", v.v.
  const multiStationPattern = /\d+d(mn|mt|n)/i

  return multiStationPattern.test(betCode)
}

/**
 * Phát hiện các lỗi trong từng dòng mã cược
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @param {number} lineIndex - Chỉ số dòng
 * @returns {array} Danh sách lỗi của dòng
 */
function detectLineErrors(parsedLine, lineIndex) {
  const errors = []

  // Nếu dòng có lỗi phân tích
  if (parsedLine.error) {
    errors.push({
      type: 'LINE_PARSE_ERROR',
      message: parsedLine.error.message || 'Lỗi định dạng dòng',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
      details: parsedLine.error,
    })
    return errors
  }

  // Kiểm tra đài
  if (!parsedLine.station) {
    errors.push({
      type: 'MISSING_STATION',
      message: 'Không tìm thấy thông tin đài',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else if (parsedLine.multiStation) {
    // Kiểm tra đài nhiều miền
    detectMultiStationErrors(parsedLine, errors, lineIndex)
  } else {
    // Kiểm tra đài thông thường
    detectSingleStationErrors(parsedLine, errors, lineIndex)
  }

  // Kiểm tra kiểu cược
  if (!parsedLine.betType) {
    errors.push({
      type: 'MISSING_BET_TYPE',
      message: 'Không tìm thấy thông tin kiểu cược',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else {
    // Kiểm tra kiểu cược
    detectBetTypeErrors(parsedLine, errors, lineIndex)
  }

  // Kiểm tra các số cược
  if (!parsedLine.numbers || parsedLine.numbers.length === 0) {
    errors.push({
      type: 'MISSING_NUMBERS',
      message: 'Không tìm thấy thông tin số cược',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else {
    // Kiểm tra từng số
    detectBetNumberErrors(parsedLine, errors, lineIndex)
  }

  // Kiểm tra số tiền
  if (!parsedLine.amount || parsedLine.amount <= 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      message: 'Số tiền không hợp lệ',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else if (parsedLine.amount < 0.5) {
    errors.push({
      type: 'LOW_AMOUNT',
      message: 'Số tiền quá nhỏ, tối thiểu là 0.5',
      severity: 'warning',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  }

  return errors
}

/**
 * Phát hiện lỗi về đài nhiều miền
 * @param {object} parsedLine - Dòng đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào
 * @param {number} lineIndex - Chỉ số dòng
 */
function detectMultiStationErrors(parsedLine, errors, lineIndex) {
  const station = parsedLine.station

  // Kiểm tra số lượng đài
  if (station.count > 3) {
    errors.push({
      type: 'EXCESSIVE_STATION_COUNT',
      message: `Số lượng đài ${station.count} vượt quá giới hạn (tối đa 3)`,
      severity: 'warning',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  }

  // Kiểm tra miền bắc nhiều đài (không hợp lý)
  if (station.region === REGIONS.NORTH && station.count > 1) {
    errors.push({
      type: 'INVALID_NORTH_STATIONS',
      message: 'Miền Bắc chỉ có một đài, không thể chọn nhiều đài',
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  }
}

/**
 * Phát hiện lỗi về đài đơn
 * @param {object} parsedLine - Dòng đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào
 * @param {number} lineIndex - Chỉ số dòng
 */
function detectSingleStationErrors(parsedLine, errors, lineIndex) {
  const station = parsedLine.station

  // Kiểm tra đài có tồn tại và đang active
  const stationInfo = defaultStations.find(
    (s) => s.name === station.name || s.aliases.includes(station.alias)
  )

  if (!stationInfo) {
    errors.push({
      type: 'UNKNOWN_STATION',
      message: `Đài "${station.name}" không được nhận diện`,
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else if (!stationInfo.isActive) {
    errors.push({
      type: 'INACTIVE_STATION',
      message: `Đài "${station.name}" hiện không hoạt động`,
      severity: 'warning',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  }

  // Kiểm tra các alias gây nhầm lẫn
  if (station.alias) {
    const ambiguousAliases = defaultStations
      .filter((s) => s.id !== (stationInfo?.id || -1))
      .flatMap((s) => s.aliases)
      .filter((a) => a.toLowerCase() === station.alias.toLowerCase())

    if (ambiguousAliases.length > 0) {
      errors.push({
        type: 'AMBIGUOUS_STATION_ALIAS',
        message: `Alias "${station.alias}" có thể gây nhầm lẫn`,
        severity: 'warning',
        position: {
          line: lineIndex,
          text: parsedLine.originalLine,
        },
      })
    }
  }
}

/**
 * Phát hiện lỗi về kiểu cược
 * @param {object} parsedLine - Dòng đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào
 * @param {number} lineIndex - Chỉ số dòng
 */
function detectBetTypeErrors(parsedLine, errors, lineIndex) {
  const betType = parsedLine.betType

  // Kiểm tra kiểu cược có tồn tại và đang active
  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.name || bt.aliases.includes(betType.alias)
  )

  if (!betTypeInfo) {
    errors.push({
      type: 'UNKNOWN_BET_TYPE',
      message: `Kiểu cược "${betType.name}" không được nhận diện`,
      severity: 'error',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  } else if (!betTypeInfo.isActive) {
    errors.push({
      type: 'INACTIVE_BET_TYPE',
      message: `Kiểu cược "${betType.name}" hiện không hoạt động`,
      severity: 'warning',
      position: {
        line: lineIndex,
        text: parsedLine.originalLine,
      },
    })
  }

  // Kiểm tra kiểu cược có áp dụng cho miền này không
  if (parsedLine.station && betTypeInfo) {
    const stationRegion = parsedLine.station.region
    const applicableRegions = betTypeInfo.applicableRegions || []

    if (!applicableRegions.includes(stationRegion)) {
      errors.push({
        type: 'INCOMPATIBLE_BET_TYPE',
        message: `Kiểu cược "${betType.name}" không áp dụng cho đài miền ${
          stationRegion === REGIONS.SOUTH
            ? 'Nam'
            : stationRegion === REGIONS.CENTRAL
            ? 'Trung'
            : 'Bắc'
        }`,
        severity: 'error',
        position: {
          line: lineIndex,
          text: parsedLine.originalLine,
        },
      })
    }
  }

  // Kiểm tra kiểu cược kết hợp (dau10.duoi15)
  if (betType.combined && parsedLine.details?.numbersAndBetTypes?.combined) {
    const combined = parsedLine.details.numbersAndBetTypes.combined

    // Kiểm tra tính nhất quán của kiểu cược kết hợp
    if (combined.length < 2) {
      errors.push({
        type: 'INVALID_COMBINED_BET',
        message: 'Kiểu cược kết hợp cần ít nhất 2 phần',
        severity: 'error',
        position: {
          line: lineIndex,
          text: parsedLine.originalLine,
        },
      })
    }
  }
}

/**
 * Phát hiện lỗi về số cược
 * @param {object} parsedLine - Dòng đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào
 * @param {number} lineIndex - Chỉ số dòng
 */
function detectBetNumberErrors(parsedLine, errors, lineIndex) {
  const numbers = parsedLine.numbers
  const betType = parsedLine.betType

  // Kiểm tra số lượng số phù hợp với kiểu cược
  if (betType) {
    // Kiểu đá cần ít nhất 2 số và số lượng chẵn
    if (
      (betType.alias === 'da' || betType.alias === 'dv') &&
      (numbers.length < 2 || numbers.length % 2 !== 0)
    ) {
      errors.push({
        type: 'INVALID_DA_NUMBER_COUNT',
        message: `Kiểu cược ${betType.name} cần số lượng số chẵn và ít nhất 2 số`,
        severity: 'error',
        position: {
          line: lineIndex,
          text: parsedLine.originalLine,
        },
      })
    }

    // Kiểm tra độ dài các số
    const firstNumberLength = numbers[0]?.length || 0
    const hasDifferentLengths = numbers.some(
      (num) => num.length !== firstNumberLength
    )

    if (hasDifferentLengths) {
      errors.push({
        type: 'INCONSISTENT_NUMBER_LENGTH',
        message: 'Các số có độ dài khác nhau',
        severity: 'warning',
        position: {
          line: lineIndex,
          text: parsedLine.originalLine,
        },
      })
    }

    // Kiểm tra từng số
    numbers.forEach((number) => {
      // Kiểm tra định dạng số
      if (!/^\d+$/.test(number)) {
        errors.push({
          type: 'INVALID_NUMBER_FORMAT',
          message: `Số "${number}" không đúng định dạng`,
          severity: 'error',
          position: {
            line: lineIndex,
            text: parsedLine.originalLine,
            number,
          },
        })
        return // Bỏ qua các kiểm tra khác nếu không phải số
      }

      // Kiểm tra độ dài số phù hợp với kiểu cược
      const betTypeInfo =
        betType &&
        defaultBetTypes.find(
          (bt) => bt.name === betType.name || bt.aliases.includes(betType.alias)
        )

      if (betTypeInfo && betTypeInfo.betRule) {
        const validDigitCounts = betTypeInfo.betRule
          .map((rule) => {
            const match = rule.match(/(\d+)\s*digits/)
            return match ? parseInt(match[1]) : null
          })
          .filter((count) => count !== null)

        if (
          validDigitCounts.length > 0 &&
          !validDigitCounts.includes(number.length)
        ) {
          errors.push({
            type: 'INVALID_NUMBER_LENGTH',
            message: `Số "${number}" có ${
              number.length
            } chữ số không phù hợp với kiểu cược ${
              betType.name
            } (cần ${validDigitCounts.join(' hoặc ')} chữ số)`,
            severity: 'error',
            position: {
              line: lineIndex,
              text: parsedLine.originalLine,
              number,
            },
          })
        }
      }
    })
  }
}

/**
 * Phát hiện các lỗi cấu trúc trong mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} parsedResult - Kết quả phân tích
 * @returns {array} Danh sách lỗi cấu trúc
 */
function detectStructuralErrors(betCode, parsedResult) {
  const errors = []

  // Kiểm tra lỗi về cấu trúc mã cược
  const lines = parsedResult.lines || []

  // Kiểm tra các dòng cược rỗng (không có thông tin hữu ích)
  const emptyLines = betCode
    .split('\n')
    .filter((line) => line.trim().length > 0 && !/\w/.test(line))
  if (emptyLines.length > 0) {
    errors.push({
      type: 'EMPTY_LINES',
      message: 'Mã cược chứa dòng rỗng',
      severity: 'warning',
      position: null,
    })
  }

  // Kiểm tra định dạng không nhất quán giữa các dòng
  if (lines.length > 1) {
    const hasBetTypePattern = lines.map((line) => !!line.betType)
    const inconsistentBetType = hasBetTypePattern.some(
      (hasBetType) => hasBetType !== hasBetTypePattern[0]
    )

    if (inconsistentBetType) {
      errors.push({
        type: 'INCONSISTENT_FORMAT',
        message: 'Định dạng không nhất quán giữa các dòng',
        severity: 'warning',
        position: null,
      })
    }

    // Kiểm tra dòng bắt đầu với cùng đài nhưng không gộp nhóm
    const stationGroups = {}
    lines.forEach((line) => {
      if (line.station && !line.multiStation) {
        const stationName = line.station.name
        if (!stationGroups[stationName]) stationGroups[stationName] = []
        stationGroups[stationName].push(line)
      }
    })

    // Đếm số dòng dài hơn 1 đầu tiên
    let nonConsecutiveStations = 0
    Object.entries(stationGroups).forEach(([station, stationLines]) => {
      if (stationLines.length > 1) {
        // Dùng các chỉ số dòng để kiểm tra xem các dòng có liên tiếp không
        const lineIndices = stationLines
          .map((line) =>
            lines.findIndex((l) => l.originalLine === line.originalLine)
          )
          .sort((a, b) => a - b)

        // Kiểm tra xem các chỉ số dòng có liên tiếp không
        let nonConsecutive = false
        for (let i = 1; i < lineIndices.length; i++) {
          if (lineIndices[i] !== lineIndices[i - 1] + 1) {
            nonConsecutive = true
            break
          }
        }

        if (nonConsecutive) {
          nonConsecutiveStations++
        }
      }
    })

    if (nonConsecutiveStations > 0) {
      errors.push({
        type: 'NON_CONSECUTIVE_STATIONS',
        message: 'Các dòng của cùng một đài không liên tiếp nhau',
        severity: 'warning',
        position: null,
      })
    }
  }

  return errors
}

/**
 * Phát hiện các lỗi thường gặp trong mã cược
 * @param {string} betCode - Mã cược gốc
 * @returns {array} Danh sách lỗi thường gặp
 */
function detectCommonMistakes(betCode) {
  const errors = []

  // Lỗi sai về cách viết viết tắt đài
  const knownStationAliases = defaultStations.flatMap(
    (station) => station.aliases
  )
  const words = betCode.split(/\s+/)

  words.forEach((word) => {
    // Kiểm tra xem từ này có gần với alias nào không
    if (word.length >= 2 && /^[a-zA-Z]+$/.test(word)) {
      // Kiểm tra gần giống alias bằng khoảng cách Levenshtein đơn giản
      // Chỉ kiểm tra cho các từ nhỏ (tối đa 5 ký tự) để tránh kiểm tra quá nhiều
      if (word.length <= 5) {
        knownStationAliases.forEach((alias) => {
          // Chỉ so sánh với các alias tương tự về độ dài
          if (
            Math.abs(word.length - alias.length) <= 1 &&
            word.toLowerCase() !== alias.toLowerCase()
          ) {
            // Tính khoảng cách Levenshtein đơn giản (cái này có thể cải thiện thêm)
            let distance = 0
            for (let i = 0; i < Math.min(word.length, alias.length); i++) {
              if (word[i].toLowerCase() !== alias[i].toLowerCase()) distance++
            }

            // Nếu chỉ khác 1 ký tự, có thể là lỗi đánh máy
            if (distance === 1) {
              // Kiểm tra xem word có phải là alias hợp lệ khác không
              const isAnotherValidAlias = knownStationAliases.some(
                (a) => a.toLowerCase() === word.toLowerCase()
              )

              if (!isAnotherValidAlias) {
                errors.push({
                  type: 'TYPO_STATION_ALIAS',
                  message: `Có thể nhầm lẫn "${word}" với "${alias}"`,
                  severity: 'warning',
                  position: null,
                  typo: word,
                  suggestion: alias,
                })
              }
            }
          }
        })
      }
    }
  })

  // Lỗi sai về cách viết viết tắt kiểu cược
  const knownBetTypeAliases = defaultBetTypes.flatMap(
    (betType) => betType.aliases
  )

  words.forEach((word) => {
    // Kiểm tra xem từ này có gần với alias nào không
    if (word.length >= 1 && /^[a-zA-Z]+$/.test(word)) {
      // Kiểm tra chỉ cho các từ nhỏ
      if (word.length <= 5) {
        knownBetTypeAliases.forEach((alias) => {
          if (
            Math.abs(word.length - alias.length) <= 1 &&
            word.toLowerCase() !== alias.toLowerCase()
          ) {
            let distance = 0
            for (let i = 0; i < Math.min(word.length, alias.length); i++) {
              if (word[i].toLowerCase() !== alias[i].toLowerCase()) distance++
            }

            if (distance === 1) {
              // Kiểm tra xem word có phải là alias hợp lệ khác không
              const isAnotherValidAlias = knownBetTypeAliases.some(
                (a) => a.toLowerCase() === word.toLowerCase()
              )

              if (!isAnotherValidAlias) {
                errors.push({
                  type: 'TYPO_BET_TYPE_ALIAS',
                  message: `Có thể nhầm lẫn "${word}" với "${alias}"`,
                  severity: 'warning',
                  position: null,
                  typo: word,
                  suggestion: alias,
                })
              }
            }
          }
        })
      }
    }
  })

  // Kiểm tra trường hợp gõ nhầm x thành dấu *
  if (betCode.includes('*')) {
    errors.push({
      type: 'ASTERISK_INSTEAD_OF_X',
      message: 'Sử dụng dấu * thay vì x hoặc ×',
      severity: 'warning',
      position: null,
      suggestion: betCode.replace(/\*/g, 'x'),
    })
  }

  // Kiểm tra dấu chấm thừa liên tiếp
  if (betCode.includes('..')) {
    errors.push({
      type: 'REDUNDANT_DOTS',
      message: 'Dấu chấm liên tiếp thừa',
      severity: 'warning',
      position: null,
      suggestion: betCode.replace(/\.{2,}/g, '.'),
    })
  }

  // Kiểm tra dấu phẩy thừa liên tiếp
  if (betCode.includes(',,')) {
    errors.push({
      type: 'REDUNDANT_COMMAS',
      message: 'Dấu phẩy liên tiếp thừa',
      severity: 'warning',
      position: null,
      suggestion: betCode.replace(/,{2,}/g, ','),
    })
  }

  // Kiểm tra "n" ở cuối không gắn với số (cần gắn liền với số, vd: 10n)
  const nSeparated = betCode.match(/\d+\s+n(?!\w)/g)
  if (nSeparated) {
    errors.push({
      type: 'SEPARATED_N_SUFFIX',
      message: 'Ký tự "n" (nghìn) cần gắn liền với số',
      severity: 'warning',
      position: null,
      matches: nSeparated,
    })
  }

  return errors
}

/**
 * Phát hiện các trường hợp đặc biệt hoặc xung đột
 * @param {string} betCode - Mã cược gốc
 * @param {object} parsedResult - Kết quả phân tích
 * @returns {array} Danh sách lỗi đặc biệt
 */
function detectSpecialCases(betCode, parsedResult) {
  const errors = []

  // Xử lý các trường hợp xung đột đài (ví dụ: dn có thể là Đồng Nai hoặc Đà Nẵng)
  const lowercaseBetCode = betCode.toLowerCase()

  // Tìm các trường hợp xung đột alias đài
  const ambiguousStations = {}
  defaultStations.forEach((station) => {
    station.aliases.forEach((alias) => {
      const aliasLower = alias.toLowerCase()
      if (!ambiguousStations[aliasLower]) {
        ambiguousStations[aliasLower] = []
      }
      ambiguousStations[aliasLower].push(station.name)
    })
  })

  // Kiểm tra mã cược có chứa alias xung đột không
  Object.entries(ambiguousStations).forEach(([alias, stations]) => {
    if (stations.length > 1 && lowercaseBetCode.includes(alias)) {
      // Xác định vị trí xuất hiện alias
      const regex = new RegExp(`\\b${alias}\\b`, 'i')
      const match = regex.exec(lowercaseBetCode)

      // Tìm dòng chứa alias này
      let lineIndex = -1
      let lineContent = ''

      if (match) {
        // Tìm dòng chứa alias này
        const lines = betCode.split('\n')
        let currentPos = 0

        for (let i = 0; i < lines.length; i++) {
          const nextPos = currentPos + lines[i].length + 1 // +1 cho ký tự xuống dòng
          if (match.index >= currentPos && match.index < nextPos) {
            lineIndex = i
            lineContent = lines[i]
            break
          }
          currentPos = nextPos
        }
      }

      errors.push({
        type: 'AMBIGUOUS_STATION',
        message: `Ký hiệu "${alias}" có thể là ${stations.join(' hoặc ')}`,
        severity: 'warning',
        position:
          lineIndex >= 0
            ? {
                line: lineIndex,
                text: lineContent,
              }
            : null,
        ambiguousAlias: alias,
        suggestions: stations,
      })
    }
  })

  // Kiểm tra có sử dụng đài không tồn tại trong lịch xổ số ngày hiện tại
  // Đây có thể cần thông tin lịch xổ số chi tiết hơn

  return errors
}

/**
 * Phát hiện các lỗi trong từng số cược
 * @param {string} number - Số cược cần kiểm tra
 * @param {object} betType - Thông tin kiểu cược
 * @returns {array} Danh sách lỗi của số cược
 */
export function checkNumberErrors(number, betType) {
  const errors = []

  // Kiểm tra số có phải là số hợp lệ
  if (!/^\d+$/.test(number)) {
    errors.push({
      type: 'INVALID_NUMBER_FORMAT',
      message: `Số "${number}" không đúng định dạng`,
      severity: 'error',
    })
    return errors
  }

  // Nếu không có thông tin kiểu cược, không kiểm tra thêm
  if (!betType) return errors

  // Lấy thông tin betType từ defaults
  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.name || bt.aliases.includes(betType.alias)
  )

  if (!betTypeInfo) return errors

  // Kiểm tra số chữ số phù hợp với kiểu cược
  if (betTypeInfo.betRule) {
    const validDigitCounts = betTypeInfo.betRule
      .map((rule) => {
        // Trích xuất số chữ số từ rule (ví dụ: "2 digits" => 2)
        const match = rule.match(/(\d+)\s*digits/)
        return match ? parseInt(match[1]) : null
      })
      .filter((count) => count !== null)

    if (validDigitCounts.length > 0) {
      const numberLength = number.length
      if (!validDigitCounts.includes(numberLength)) {
        errors.push({
          type: 'INVALID_NUMBER_LENGTH',
          message: `Số "${number}" có ${numberLength} chữ số, cần ${validDigitCounts.join(
            ' hoặc '
          )} chữ số`,
          severity: 'error',
        })
      }
    }
  }

  return errors
}

export default {
  detectErrors,
  checkNumberErrors,
}
