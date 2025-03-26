// src/services/betCodeParser/validator.js
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'
import { REGIONS, DAYS_OF_WEEK } from '@/config/constants'

/**
 * Kiểm tra tính hợp lệ của kết quả phân tích mã cược
 * @param {object} parsedResult - Kết quả phân tích từ parser
 * @returns {object} Kết quả kiểm tra (hợp lệ/không hợp lệ và danh sách lỗi)
 */
export function validateBetCode(parsedResult) {
  if (
    !parsedResult ||
    !parsedResult.lines ||
    !Array.isArray(parsedResult.lines)
  ) {
    return {
      valid: false,
      errors: [
        {
          type: 'INVALID_PARSED_RESULT',
          message: 'Kết quả phân tích không hợp lệ',
        },
      ],
    }
  }

  const errors = []
  let isValid = true

  // Kiểm tra từng dòng
  parsedResult.lines.forEach((line, index) => {
    const lineErrors = validateBetCodeLine(line)

    if (lineErrors.length > 0) {
      isValid = false
      errors.push({
        lineIndex: index,
        originalLine: line.originalLine,
        errors: lineErrors,
      })
    }
  })

  // Kiểm tra tổng thể tất cả các dòng
  const globalErrors = validateGlobalBetCode(parsedResult.lines)
  if (globalErrors.length > 0) {
    isValid = false
    errors.push(
      ...globalErrors.map((error) => ({
        global: true,
        error,
      }))
    )
  }

  return {
    valid: isValid,
    errors: errors,
  }
}

/**
 * Kiểm tra tính hợp lệ toàn cục của tất cả các dòng mã cược
 * @param {array} parsedLines - Các dòng mã cược đã phân tích
 * @returns {array} Danh sách lỗi tìm thấy ở cấp toàn cục
 */
function validateGlobalBetCode(parsedLines) {
  const errors = []

  // Danh sách đài đã sử dụng
  const usedStations = new Set()

  // Đếm số đài nhiều miền
  const multiStationCount = parsedLines.filter(
    (line) => line.multiStation
  ).length

  // Kiểm tra nếu có cả đài đơn và đài nhiều miền
  if (multiStationCount > 0 && multiStationCount < parsedLines.length) {
    errors.push({
      type: 'MIXED_STATION_TYPES',
      message:
        'Mã cược kết hợp cả đài đơn và đài nhiều miền, có thể gây nhầm lẫn',
    })
  }

  // Kiểm tra xung đột lịch xổ số
  // Lấy tất cả các đài đơn
  const singleStations = parsedLines
    .filter((line) => !line.multiStation && line.station)
    .map((line) => line.station)

  // Kiểm tra xung đột lịch đài
  const today = new Date()
  const todayDayOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][today.getDay()]

  // Đài không có trong lịch hôm nay
  const invalidTodayStations = singleStations.filter((station) => {
    const stationInfo = defaultStations.find((s) => s.name === station.name)
    if (!stationInfo) return false

    // Đài hoạt động hàng ngày thì luôn hợp lệ
    if (stationInfo.schedule?.day === 'daily') return false

    // Kiểm tra nếu đài không hoạt động vào hôm nay
    return stationInfo.schedule?.day !== todayDayOfWeek
  })

  if (invalidTodayStations.length > 0) {
    errors.push({
      type: 'STATION_NOT_AVAILABLE_TODAY',
      message: `Đài ${invalidTodayStations
        .map((s) => s.name)
        .join(', ')} không xổ số vào hôm nay (${todayDayOfWeek})`,
      stations: invalidTodayStations,
    })
  }

  return errors
}

/**
 * Kiểm tra tính hợp lệ của một dòng mã cược đã phân tích
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @returns {array} Danh sách lỗi tìm thấy
 */
function validateBetCodeLine(parsedLine) {
  const errors = []

  // Kiểm tra nếu dòng có lỗi phân tích
  if (parsedLine.error) {
    errors.push(parsedLine.error)
    return errors
  }

  // Kiểm tra đài
  if (!parsedLine.station) {
    errors.push({
      type: 'MISSING_STATION',
      message: 'Không tìm thấy thông tin đài',
    })
  } else if (parsedLine.multiStation) {
    // Kiểm tra đài nhiều miền
    validateMultiStation(parsedLine, errors)
  } else {
    // Kiểm tra đài thông thường
    validateSingleStation(parsedLine, errors)
  }

  // Kiểm tra kiểu cược
  if (!parsedLine.betType) {
    errors.push({
      type: 'MISSING_BET_TYPE',
      message: 'Không tìm thấy thông tin kiểu cược',
    })
  } else {
    validateBetType(parsedLine, errors)
  }

  // Kiểm tra các số cược
  if (!parsedLine.numbers || parsedLine.numbers.length === 0) {
    errors.push({
      type: 'MISSING_NUMBERS',
      message: 'Không tìm thấy thông tin số cược',
    })
  } else {
    // Kiểm tra từng số
    parsedLine.numbers.forEach((number) => {
      const numberErrors = validateNumber(number, parsedLine.betType)
      errors.push(...numberErrors)
    })

    // Kiểm tra số lượng số phù hợp với kiểu cược
    validateNumberCount(parsedLine, errors)
  }

  // Kiểm tra số tiền
  if (!parsedLine.amount || parsedLine.amount <= 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      message: 'Số tiền không hợp lệ',
    })
  } else if (parsedLine.amount < 0.5) {
    errors.push({
      type: 'AMOUNT_TOO_SMALL',
      message: 'Số tiền quá nhỏ, tối thiểu là 0.5',
    })
  } else if (parsedLine.amount > 10000) {
    errors.push({
      type: 'AMOUNT_TOO_LARGE',
      message: 'Số tiền quá lớn, tối đa là 10000',
    })
  }

  return errors
}

/**
 * Kiểm tra tính hợp lệ của đài nhiều miền
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào nếu có
 */
function validateMultiStation(parsedLine, errors) {
  // Kiểm tra số lượng đài
  const { count, region } = parsedLine.station

  // Kiểm tra nếu số lượng đài vượt quá số đài của miền
  const stationsInRegion = defaultStations.filter(
    (s) => s.region === region && s.isActive
  )

  if (count > stationsInRegion.length) {
    errors.push({
      type: 'INVALID_STATION_COUNT',
      message: `Số lượng đài (${count}) vượt quá số đài hiện có của miền ${
        region === REGIONS.SOUTH
          ? 'Nam'
          : region === REGIONS.CENTRAL
          ? 'Trung'
          : 'Bắc'
      } (${stationsInRegion.length})`,
      details: {
        requestedCount: count,
        availableCount: stationsInRegion.length,
      },
    })
  }

  // Kiểm tra nếu là miền bắc nhưng số lượng đài > 1
  if (region === REGIONS.NORTH && count > 1) {
    errors.push({
      type: 'INVALID_NORTH_MULTIPLE',
      message: 'Miền Bắc chỉ có một đài, không thể có nhiều đài miền Bắc',
    })
  }
}

/**
 * Kiểm tra tính hợp lệ của đài đơn
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào nếu có
 */
function validateSingleStation(parsedLine, errors) {
  // Kiểm tra đài có tồn tại và đang active
  const stationName = parsedLine.station.name

  // Nếu là đài kết hợp (vl.tv)
  if (
    parsedLine.station.stations &&
    Array.isArray(parsedLine.station.stations)
  ) {
    // Kiểm tra từng đài trong kết hợp
    for (const subStation of parsedLine.station.stations) {
      if (!subStation.isActive) {
        errors.push({
          type: 'INACTIVE_STATION',
          message: `Đài ${subStation.name} hiện không hoạt động`,
          station: subStation.name,
        })
      }
    }
    return
  }

  // Đài thông thường
  const station = defaultStations.find(
    (s) =>
      s.name === stationName || s.aliases.includes(parsedLine.station.alias)
  )

  if (!station) {
    errors.push({
      type: 'INVALID_STATION',
      message: `Đài ${stationName} không tồn tại hoặc không hợp lệ`,
    })
  } else if (!station.isActive) {
    errors.push({
      type: 'INACTIVE_STATION',
      message: `Đài ${stationName} hiện không hoạt động`,
    })
  }
}

/**
 * Kiểm tra tính hợp lệ của kiểu cược
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào nếu có
 */
function validateBetType(parsedLine, errors) {
  const betTypeName = parsedLine.betType.name
  const betTypeAlias = parsedLine.betType.alias

  // Kiểm tra kiểu cược có tồn tại và đang active
  const betType = defaultBetTypes.find(
    (bt) => bt.name === betTypeName || bt.aliases.includes(betTypeAlias)
  )

  if (!betType) {
    errors.push({
      type: 'INVALID_BET_TYPE',
      message: `Kiểu cược ${betTypeName} không tồn tại hoặc không hợp lệ`,
    })
    return
  }

  if (!betType.isActive) {
    errors.push({
      type: 'INACTIVE_BET_TYPE',
      message: `Kiểu cược ${betTypeName} hiện không hoạt động`,
    })
    return
  }

  // Kiểm tra kiểu cược có áp dụng cho đài/miền này không
  if (parsedLine.station && betType.applicableRegions) {
    const stationRegion = parsedLine.station.region
    const isApplicable = betType.applicableRegions.includes(stationRegion)

    if (!isApplicable) {
      errors.push({
        type: 'BET_TYPE_NOT_APPLICABLE',
        message: `Kiểu cược ${betTypeName} không áp dụng cho đài thuộc miền ${
          stationRegion === REGIONS.SOUTH
            ? 'Nam'
            : stationRegion === REGIONS.CENTRAL
            ? 'Trung'
            : 'Bắc'
        }`,
      })
    }
  }

  // Kiểm tra số tiền kiểu cược đầu đuôi kết hợp
  if (
    parsedLine.betType.combined &&
    parsedLine.details?.numbersAndBetTypes?.combined
  ) {
    const combined = parsedLine.details.numbersAndBetTypes.combined
    const dauAmounts = combined
      .filter((c) => c.type === 'dau')
      .map((c) => parseFloat(c.amount))
    const duoiAmounts = combined
      .filter((c) => c.type === 'duoi')
      .map((c) => parseFloat(c.amount))

    // Kiểm tra tổng số tiền
    const totalAmount = [...dauAmounts, ...duoiAmounts].reduce(
      (sum, amount) => sum + amount,
      0
    )
    if (Math.abs(totalAmount - parsedLine.amount) > 0.01) {
      errors.push({
        type: 'COMBINED_AMOUNT_MISMATCH',
        message: `Tổng số tiền đầu (${dauAmounts.join(
          '+'
        )}) và đuôi (${duoiAmounts.join('+')}) không khớp với số tiền cược (${
          parsedLine.amount
        })`,
        details: {
          dauAmounts,
          duoiAmounts,
          total: totalAmount,
          amount: parsedLine.amount,
        },
      })
    }
  }
}

/**
 * Kiểm tra số lượng số phù hợp với kiểu cược
 * @param {object} parsedLine - Dòng mã cược đã phân tích
 * @param {array} errors - Mảng lỗi để thêm vào nếu có
 */
function validateNumberCount(parsedLine, errors) {
  const betTypeAlias = parsedLine.betType?.alias
  const numbersCount = parsedLine.numbers.length

  // Kiểm tra kiểu cược đặc biệt
  if (betTypeAlias === 'da' || betTypeAlias === 'dv') {
    // Kiểu đá cần số lượng số chẵn và ít nhất là 2
    if (numbersCount < 2) {
      errors.push({
        type: 'INSUFFICIENT_NUMBERS',
        message: `Kiểu cược ${betTypeAlias} cần ít nhất 2 số`,
      })
    } else if (numbersCount % 2 !== 0) {
      errors.push({
        type: 'ODD_NUMBER_COUNT',
        message: `Kiểu cược ${betTypeAlias} cần số lượng số chẵn để tạo các cặp đá`,
      })
    }
  }

  // Kiểm tra kiểu đảo
  if (
    betTypeAlias &&
    (betTypeAlias.includes('dao') ||
      betTypeAlias.includes('bdao') ||
      betTypeAlias.includes('xcd'))
  ) {
    // Các kiểu đảo cần ít nhất 2 số cho 2 chữ số, 3 số cho 3 chữ số
    const firstNumberLength = parsedLine.numbers[0]?.length || 0

    if (firstNumberLength === 2 && numbersCount < 2) {
      errors.push({
        type: 'INSUFFICIENT_NUMBERS_FOR_DAO',
        message: `Kiểu cược ${betTypeAlias} với 2 chữ số cần ít nhất 2 số để đảo`,
      })
    } else if (firstNumberLength === 3 && numbersCount < 3) {
      errors.push({
        type: 'INSUFFICIENT_NUMBERS_FOR_DAO',
        message: `Kiểu cược ${betTypeAlias} với 3 chữ số cần ít nhất 3 số để đảo`,
      })
    }
  }
}

/**
 * Kiểm tra tính hợp lệ của một số cược
 * @param {string} number - Số cược cần kiểm tra
 * @param {object} betType - Thông tin kiểu cược
 * @returns {array} Danh sách lỗi tìm thấy
 */
function validateNumber(number, betType) {
  const errors = []

  // Kiểm tra số có phải là số hợp lệ
  if (!/^\d+$/.test(number)) {
    errors.push({
      type: 'INVALID_NUMBER_FORMAT',
      message: `Số "${number}" không đúng định dạng`,
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
          message: `Số "${number}" có ${numberLength} chữ số, không phù hợp với kiểu cược ${
            betType.name
          } (yêu cầu ${validDigitCounts.join(' hoặc ')} chữ số)`,
        })
      }
    }
  }

  // Kiểm tra giá trị số
  // Ví dụ: 2 chữ số chỉ hợp lệ từ 00-99
  if (number.length === 2) {
    const numVal = parseInt(number)
    if (numVal < 0 || numVal > 99) {
      errors.push({
        type: 'INVALID_NUMBER_VALUE',
        message: `Số "${number}" nằm ngoài phạm vi hợp lệ (00-99) cho số 2 chữ số`,
      })
    }
  } else if (number.length === 3) {
    const numVal = parseInt(number)
    if (numVal < 0 || numVal > 999) {
      errors.push({
        type: 'INVALID_NUMBER_VALUE',
        message: `Số "${number}" nằm ngoài phạm vi hợp lệ (000-999) cho số 3 chữ số`,
      })
    }
  }

  return errors
}

/**
 * Kiểm tra nhanh tính hợp lệ của một mã cược
 * @param {string} betCode - Mã cược cần kiểm tra
 * @returns {boolean} true nếu hợp lệ, false nếu không
 */
export function isValidBetCode(betCode) {
  // Chuẩn hóa mã cược
  const normalizedCode = betCode.trim()

  // Kiểm tra mã rỗng
  if (!normalizedCode) return false

  // Kiểm tra có chứa số hay không
  if (!/\d/.test(normalizedCode)) return false

  // Kiểm tra có chứa một trong các alias của kiểu cược không
  const hasBetType = defaultBetTypes.some((betType) => {
    if (normalizedCode.includes(betType.name)) return true
    return betType.aliases.some((alias) => normalizedCode.includes(alias))
  })

  // Kiểm tra có nhận diện được đài không
  const hasStation =
    defaultStations.some((station) => {
      if (normalizedCode.includes(station.name)) return true
      return station.aliases.some((alias) => normalizedCode.includes(alias))
    }) || /\d+d(mn|mt|n)/i.test(normalizedCode) // Kiểm tra dạng 2dmn, 3dmt

  return hasBetType && hasStation
}

export default {
  validateBetCode,
  validateBetCodeLine,
  validateNumber,
  isValidBetCode,
}
