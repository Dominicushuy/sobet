// src/services/betCodeParser/errorFixer.js
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'
import { normalizeBetCode } from './parser'
import { REGIONS } from '@/config/constants'

/**
 * Cố gắng sửa các lỗi trong mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Kết quả sửa lỗi
 */
export function fixBetCode(betCode, errorResult) {
  if (!betCode || !errorResult) {
    return {
      original: betCode,
      fixed: betCode,
      changes: [],
      success: false,
    }
  }

  // Nếu không có lỗi, trả về mã cược gốc
  if (
    !errorResult.hasErrors ||
    !errorResult.errors ||
    errorResult.errors.length === 0
  ) {
    return {
      original: betCode,
      fixed: betCode,
      changes: [],
      success: true,
    }
  }

  let fixedCode = betCode
  const changes = []

  // Chuẩn hóa mã cược trước
  const normalized = normalizeBetCode(fixedCode)
  if (normalized !== betCode) {
    changes.push({
      type: 'NORMALIZE',
      message: 'Chuẩn hóa mã cược',
      original: betCode,
      fixed: normalized,
    })
    fixedCode = normalized
  }

  // Đi qua từng lỗi và cố gắng sửa
  // Sắp xếp lỗi từ nghiêm trọng nhất đến ít nghiêm trọng (error trước, warning sau)
  const sortedErrors = [...errorResult.errors].sort((a, b) => {
    if (a.severity === 'error' && b.severity !== 'error') return -1
    if (a.severity !== 'error' && b.severity === 'error') return 1
    return 0
  })

  for (const error of sortedErrors) {
    const fixResult = fixError(fixedCode, error)

    if (fixResult.success) {
      fixedCode = fixResult.fixed
      changes.push({
        type: error.type,
        message: fixResult.message,
        original: fixResult.original,
        fixed: fixResult.fixed,
      })
    }
  }

  // Kiểm tra xem có sửa đổi nào không
  const success = changes.length > 0

  return {
    original: betCode,
    fixed: fixedCode,
    changes,
    success,
  }
}

/**
 * Cố gắng sửa một lỗi cụ thể
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixError(code, error) {
  try {
    switch (error.type) {
      case 'TYPO_STATION_ALIAS': {
        return fixTypoStationAlias(code, error)
      }

      case 'TYPO_BET_TYPE_ALIAS': {
        return fixTypoBetTypeAlias(code, error)
      }

      case 'ASTERISK_INSTEAD_OF_X': {
        return fixAsterisk(code, error)
      }

      case 'AMBIGUOUS_STATION': {
        return suggestUnambiguousStation(code, error)
      }

      case 'INVALID_CHARACTERS': {
        return fixInvalidCharacters(code, error)
      }

      case 'EMPTY_LINES': {
        return fixEmptyLines(code, error)
      }

      case 'REDUNDANT_DOTS': {
        return fixRedundantDots(code, error)
      }

      case 'REDUNDANT_COMMAS': {
        return fixRedundantCommas(code, error)
      }

      case 'TRAILING_PUNCTUATION': {
        return fixTrailingPunctuation(code, error)
      }

      case 'LEADING_PUNCTUATION': {
        return fixLeadingPunctuation(code, error)
      }

      case 'SEPARATED_N_SUFFIX': {
        return fixSeparatedNSuffix(code, error)
      }

      case 'INCOMPLETE_MULTI_STATION': {
        return suggestCompleteMultiStation(code, error)
      }

      default:
        return {
          original: code,
          fixed: code,
          message: 'Không thể tự động sửa lỗi này',
          success: false,
        }
    }
  } catch (err) {
    console.error('Error when fixing:', err)
    return {
      original: code,
      fixed: code,
      message: `Lỗi khi sửa: ${err.message}`,
      success: false,
    }
  }
}

/**
 * Sửa lỗi nhầm lẫn alias đài
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixTypoStationAlias(code, error) {
  if (!error.suggestion || !error.typo) {
    return {
      original: code,
      fixed: code,
      message: 'Không có gợi ý sửa cho alias đài',
      success: false,
    }
  }

  // Tìm và thay thế từ nhầm lẫn trong mã cược
  // Sử dụng regex với word boundary để tránh thay thế một phần của từ khác
  const regex = new RegExp(`\\b${error.typo}\\b`, 'gi')
  const fixed = code.replace(regex, error.suggestion)

  return {
    original: code,
    fixed: fixed,
    message: `Sửa "${error.typo}" thành "${error.suggestion}"`,
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi nhầm lẫn alias kiểu cược
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixTypoBetTypeAlias(code, error) {
  if (!error.suggestion || !error.typo) {
    return {
      original: code,
      fixed: code,
      message: 'Không có gợi ý sửa cho alias kiểu cược',
      success: false,
    }
  }

  // Tìm và thay thế từ nhầm lẫn trong mã cược
  const regex = new RegExp(`\\b${error.typo}\\b`, 'gi')
  const fixed = code.replace(regex, error.suggestion)

  return {
    original: code,
    fixed: fixed,
    message: `Sửa "${error.typo}" thành "${error.suggestion}"`,
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi sử dụng dấu * thay vì x
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixAsterisk(code, error) {
  const fixed = code.replace(/\*/g, 'x')

  return {
    original: code,
    fixed: fixed,
    message: 'Sửa dấu * thành x',
    success: code !== fixed,
  }
}

/**
 * Gợi ý đài không gây nhầm lẫn
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function suggestUnambiguousStation(code, error) {
  if (
    !error.suggestions ||
    error.suggestions.length === 0 ||
    !error.ambiguousAlias
  ) {
    return {
      original: code,
      fixed: code,
      message: 'Không có gợi ý cho đài rõ ràng',
      success: false,
    }
  }

  // Tìm alias rõ ràng cho các đài gợi ý
  const unambiguousSuggestions = []
  for (const stationName of error.suggestions) {
    const station = defaultStations.find((s) => s.name === stationName)
    if (station) {
      // Lấy alias đầu tiên khác với alias gây nhầm lẫn
      const uniqueAlias = station.aliases.find(
        (a) => a.toLowerCase() !== error.ambiguousAlias.toLowerCase()
      )
      if (uniqueAlias) {
        unambiguousSuggestions.push({
          station: stationName,
          uniqueAlias,
        })
      }
    }
  }

  if (unambiguousSuggestions.length === 0) {
    return {
      original: code,
      fixed: code,
      message: 'Không tìm thấy alias rõ ràng cho đài',
      success: false,
    }
  }

  // Trong trường hợp này, chúng ta chỉ gợi ý và không tự động sửa
  // vì cần sự xác nhận từ người dùng
  return {
    original: code,
    fixed: code,
    message: `Sử dụng "${unambiguousSuggestions
      .map((s) => `${s.uniqueAlias} (${s.station})`)
      .join('" hoặc "')}" để rõ ràng hơn`,
    suggestions: unambiguousSuggestions,
    success: false, // Chỉ gợi ý, không tự sửa
  }
}

/**
 * Sửa lỗi ký tự không hợp lệ
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixInvalidCharacters(code, error) {
  // Thay thế các ký tự không hợp lệ bằng khoảng trắng
  const fixed = code.replace(/[^\w\s,.;:\-+*=x()[\]{}]/g, ' ')

  return {
    original: code,
    fixed: fixed,
    message: 'Loại bỏ ký tự không hợp lệ',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi dòng trống
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixEmptyLines(code, error) {
  // Xóa các dòng trống
  const fixed = code.replace(/\n\s*\n/g, '\n').trim()

  return {
    original: code,
    fixed: fixed,
    message: 'Xóa dòng trống',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi dấu chấm thừa liên tiếp
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixRedundantDots(code, error) {
  // Thay thế các dấu chấm liên tiếp bằng một dấu chấm
  const fixed = code.replace(/\.{2,}/g, '.')

  return {
    original: code,
    fixed: fixed,
    message: 'Sửa dấu chấm liên tiếp thừa',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi dấu phẩy thừa liên tiếp
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixRedundantCommas(code, error) {
  // Thay thế các dấu phẩy liên tiếp bằng một dấu phẩy
  const fixed = code.replace(/,{2,}/g, ',')

  return {
    original: code,
    fixed: fixed,
    message: 'Sửa dấu phẩy liên tiếp thừa',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi dấu chấm/phẩy thừa ở cuối
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixTrailingPunctuation(code, error) {
  // Xóa dấu chấm/phẩy ở cuối
  const fixed = code.replace(/[.,]+$/, '')

  return {
    original: code,
    fixed: fixed,
    message: 'Xóa dấu chấm/phẩy thừa ở cuối',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi dấu chấm/phẩy thừa ở đầu
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixLeadingPunctuation(code, error) {
  // Xóa dấu chấm/phẩy ở đầu
  const fixed = code.replace(/^[.,]+/, '')

  return {
    original: code,
    fixed: fixed,
    message: 'Xóa dấu chấm/phẩy thừa ở đầu',
    success: code !== fixed,
  }
}

/**
 * Sửa lỗi ký tự "n" (nghìn) không gắn liền với số
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function fixSeparatedNSuffix(code, error) {
  // Ghép "n" vào với số
  const fixed = code.replace(/(\d+)\s+n(?!\w)/g, '$1n')

  return {
    original: code,
    fixed: fixed,
    message: 'Gắn ký tự "n" (nghìn) vào số',
    success: code !== fixed,
  }
}

/**
 * Gợi ý hoàn thiện cú pháp cho đài nhiều miền
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Kết quả sửa lỗi
 */
function suggestCompleteMultiStation(code, error) {
  // Bổ sung ví dụ cho trường hợp nhiều đài
  const betTypeOptions = ['dd', 'dau', 'duoi', 'b', 'xc']
  const numberOptions = ['12', '34', '56']

  const suggestedBetType =
    betTypeOptions[Math.floor(Math.random() * betTypeOptions.length)]
  const suggestedNumber =
    numberOptions[Math.floor(Math.random() * numberOptions.length)]
  const suggestedAmount = '10'

  // Tìm phần đài nhiều miền
  const multiStationMatch = code.match(/(\d+)(dmn|dmt|dn)(\s*$|\s+[^\d])/i)

  if (!multiStationMatch) {
    return {
      original: code,
      fixed: code,
      message: 'Không tìm thấy định dạng đài nhiều miền',
      success: false,
    }
  }

  const [fullMatch, count, regionCode, remaining] = multiStationMatch

  // Nếu còn phần sau đài thì không sửa
  if (remaining.trim()) {
    return {
      original: code,
      fixed: code,
      message: 'Đài nhiều miền đã có thông tin',
      success: false,
    }
  }

  // Thay thế phần thiếu với gợi ý
  const originalPart = `${count}${regionCode}`
  const replacementPart = `${count}${regionCode} ${suggestedNumber}${suggestedBetType}${suggestedAmount}`

  const fixed = code.replace(originalPart, replacementPart)

  return {
    original: code,
    fixed: fixed,
    message: 'Bổ sung thông tin cho đài nhiều miền',
    success: code !== fixed,
  }
}

/**
 * Tạo gợi ý sửa lỗi cho mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Các gợi ý sửa lỗi
 */
export function suggestFixes(betCode, errorResult) {
  if (!betCode || !errorResult || !errorResult.hasErrors) {
    return {
      hasSuggestions: false,
      suggestions: [],
    }
  }

  const suggestions = []

  // Đi qua từng lỗi và tạo gợi ý
  for (const error of errorResult.errors) {
    const suggestion = createSuggestion(betCode, error)
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
 * Tạo gợi ý sửa lỗi cho một lỗi cụ thể
 * @param {string} code - Mã cược hiện tại
 * @param {object} error - Thông tin lỗi
 * @returns {object} Gợi ý sửa lỗi
 */
function createSuggestion(code, error) {
  switch (error.type) {
    case 'TYPO_STATION_ALIAS': {
      return {
        type: 'REPLACE_TEXT',
        message: `Có thể bạn muốn viết "${error.suggestion}" thay vì "${
          error.typo || ''
        }"?`,
        original: error.typo || '',
        suggestion: error.suggestion,
        position: error.position,
      }
    }

    case 'TYPO_BET_TYPE_ALIAS': {
      return {
        type: 'REPLACE_TEXT',
        message: `Có thể bạn muốn viết "${error.suggestion}" thay vì "${
          error.typo || ''
        }"?`,
        original: error.typo || '',
        suggestion: error.suggestion,
        position: error.position,
      }
    }

    case 'ASTERISK_INSTEAD_OF_X': {
      return {
        type: 'REPLACE_ALL',
        message: 'Thay thế tất cả dấu * bằng x?',
        original: '*',
        suggestion: 'x',
        position: error.position,
      }
    }

    case 'AMBIGUOUS_STATION': {
      // Đề xuất các alias không gây nhầm lẫn
      const ambiguousSuggestions = []
      if (error.suggestions) {
        for (const stationName of error.suggestions) {
          const station = defaultStations.find((s) => s.name === stationName)
          if (station) {
            // Lấy alias đầu tiên khác với alias gây nhầm lẫn
            const uniqueAlias = station.aliases.find(
              (a) =>
                a.toLowerCase() !== (error.ambiguousAlias || '').toLowerCase()
            )
            if (uniqueAlias) {
              ambiguousSuggestions.push({
                name: stationName,
                alias: uniqueAlias,
              })
            }
          }
        }
      }

      return {
        type: 'AMBIGUOUS_CHOICE',
        message: `Ký hiệu "${error.ambiguousAlias}" không rõ ràng, bạn muốn đề cập đến đài nào?`,
        choices: ambiguousSuggestions,
        position: error.position,
      }
    }

    case 'MISSING_STATION': {
      return {
        type: 'ADD_STATION',
        message: 'Thiếu thông tin đài, bạn muốn thêm đài nào?',
        choices: defaultStations
          .filter((s) => s.isActive)
          .map((s) => ({
            name: s.name,
            alias: s.aliases[0] || '',
          })),
        position: error.position,
      }
    }

    case 'MISSING_BET_TYPE': {
      return {
        type: 'ADD_BET_TYPE',
        message: 'Thiếu thông tin kiểu cược, bạn muốn thêm loại cược nào?',
        choices: defaultBetTypes
          .filter((bt) => bt.isActive)
          .map((bt) => ({
            name: bt.name,
            alias: bt.aliases[0] || '',
          })),
        position: error.position,
      }
    }

    case 'REDUNDANT_DOTS': {
      return {
        type: 'REPLACE_ALL',
        message: 'Xóa dấu chấm liên tiếp thừa?',
        original: '..',
        suggestion: '.',
        position: error.position,
      }
    }

    case 'REDUNDANT_COMMAS': {
      return {
        type: 'REPLACE_ALL',
        message: 'Xóa dấu phẩy liên tiếp thừa?',
        original: ',,',
        suggestion: ',',
        position: error.position,
      }
    }

    case 'SEPARATED_N_SUFFIX': {
      return {
        type: 'REPLACE_ALL',
        message: 'Gắn ký tự "n" (nghìn) vào số?',
        original: ' n',
        suggestion: 'n',
        position: error.position,
      }
    }

    case 'TRAILING_PUNCTUATION': {
      return {
        type: 'REPLACE_ALL',
        message: 'Xóa dấu chấm/phẩy thừa ở cuối?',
        original: /[.,]+$/.exec(code)?.[0] || '',
        suggestion: '',
        position: error.position,
      }
    }

    case 'LEADING_PUNCTUATION': {
      return {
        type: 'REPLACE_ALL',
        message: 'Xóa dấu chấm/phẩy thừa ở đầu?',
        original: /^[.,]+/.exec(code)?.[0] || '',
        suggestion: '',
        position: error.position,
      }
    }

    case 'INCOMPLETE_MULTI_STATION': {
      // Tạo ví dụ gợi ý
      const betTypeOptions = ['dd', 'dau', 'duoi', 'b', 'xc']
      const numberOptions = ['12', '34', '56']

      const suggestedBetType =
        betTypeOptions[Math.floor(Math.random() * betTypeOptions.length)]
      const suggestedNumber =
        numberOptions[Math.floor(Math.random() * numberOptions.length)]
      const suggestedAmount = '10'

      const multiStationMatch = code.match(/(\d+)(dmn|dmt|dn)(\s*$|\s+[^\d])/i)

      if (multiStationMatch) {
        const [, count, regionCode] = multiStationMatch
        const originalPart = `${count}${regionCode}`

        return {
          type: 'APPEND_TEXT',
          message: 'Bổ sung thông tin cho đài nhiều miền?',
          position: error.position,
          appendAfter: originalPart,
          suggestion: ` ${suggestedNumber}${suggestedBetType}${suggestedAmount}`,
        }
      }
      break
    }

    default: {
      if (error.suggestion) {
        return {
          type: 'GENERAL_SUGGESTION',
          message: error.message || 'Gợi ý sửa lỗi',
          suggestion: error.suggestion,
          position: error.position,
        }
      }
    }
  }

  return null
}

/**
 * Tạo ví dụ mã cược hợp lệ cho một đài
 * @param {string} stationName - Tên đài, null nếu tạo ngẫu nhiên
 * @returns {string} Ví dụ mã cược hợp lệ
 */
export function createExampleBetCode(stationName = null) {
  // Lấy một đài (ngẫu nhiên hoặc theo tên)
  let station

  if (stationName) {
    station = defaultStations.find(
      (s) =>
        s.name.toLowerCase() === stationName.toLowerCase() ||
        s.aliases.some((a) => a.toLowerCase() === stationName.toLowerCase())
    )
  }

  if (!station) {
    // Lấy một đài ngẫu nhiên đang active
    const activeStations = defaultStations.filter((s) => s.isActive)
    station = activeStations[Math.floor(Math.random() * activeStations.length)]
  }

  // Lấy một kiểu cược ngẫu nhiên đang active
  const activeBetTypes = defaultBetTypes.filter((bt) => bt.isActive)
  const betType =
    activeBetTypes[Math.floor(Math.random() * activeBetTypes.length)]

  // Tạo số ngẫu nhiên phù hợp với kiểu cược
  let numbers = []
  if (betType.betRule && betType.betRule.length > 0) {
    const rule = betType.betRule[0]
    const match = rule.match(/(\d+)\s*digits/)
    const digitCount = match ? parseInt(match[1]) : 2

    // Tạo số ngẫu nhiên
    numbers = Array.from({ length: 3 }, () => {
      let num = ''
      for (let i = 0; i < digitCount; i++) {
        num += Math.floor(Math.random() * 10)
      }
      return num
    })
  } else {
    // Mặc định 2 chữ số
    numbers = Array.from({ length: 3 }, () => {
      let num = ''
      for (let i = 0; i < 2; i++) {
        num += Math.floor(Math.random() * 10)
      }
      return num
    })
  }

  // Tạo mã cược
  const stationAlias = station.aliases[0] || station.name
  const betTypeAlias = betType.aliases[0] || betType.name
  const amount = Math.floor(Math.random() * 10) * 10 + 10 // Số tiền ngẫu nhiên từ 10 đến 100, bước 10

  const exampleCode = `${stationAlias} ${numbers.join(
    ' '
  )} ${betTypeAlias}${amount}`

  return exampleCode
}

/**
 * Tạo nhiều ví dụ mã cược hợp lệ
 * @param {number} count - Số lượng ví dụ cần tạo
 * @returns {string[]} Mảng các ví dụ mã cược
 */
export function createExampleBetCodes(count = 5) {
  const examples = []

  // Tạo ví dụ đơn giản
  examples.push(createExampleBetCode())

  // Tạo ví dụ với đài miền Nam
  const southStation = defaultStations.find(
    (s) => s.region === REGIONS.SOUTH && s.isActive
  )
  if (southStation) {
    examples.push(createExampleBetCode(southStation.name))
  }

  // Tạo ví dụ với đài miền Bắc
  const northStation = defaultStations.find(
    (s) => s.region === REGIONS.NORTH && s.isActive
  )
  if (northStation) {
    examples.push(createExampleBetCode(northStation.name))
  }

  // Tạo ví dụ đài nhiều miền
  const randomCount = Math.floor(Math.random() * 2) + 2 // 2 hoặc 3 đài
  const regionCode = ['dmn', 'dmt'][Math.floor(Math.random() * 2)]
  const betTypeAlias =
    defaultBetTypes.find((bt) => bt.isActive)?.aliases[0] || 'dd'
  const numbers = Array.from({ length: 3 }, () =>
    String(Math.floor(Math.random() * 100)).padStart(2, '0')
  )
  const amount = Math.floor(Math.random() * 10) * 10 + 10

  examples.push(
    `${randomCount}${regionCode} ${numbers.join(' ')} ${betTypeAlias}${amount}`
  )

  // Tạo thêm ví dụ nếu cần
  while (examples.length < count) {
    examples.push(createExampleBetCode())
  }

  return examples
}

export default {
  fixBetCode,
  suggestFixes,
  createExampleBetCode,
  createExampleBetCodes,
}
