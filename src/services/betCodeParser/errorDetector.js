// src/services/betCodeParser/errorDetector.js
import { defaultStations, defaultBetTypes } from '@/config/defaults'

/**
 * Phát hiện lỗi trong mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @returns {object} Kết quả phát hiện lỗi
 */
export function detectErrors(betCode, parsedResult) {
  if (!parsedResult || !parsedResult.success) {
    return {
      hasErrors: true,
      errors: parsedResult.errors || [{ message: 'Mã cược không hợp lệ' }],
    }
  }

  const errors = []
  let hasValidLine = false

  // Kiểm tra đài
  if (!parsedResult.station) {
    errors.push({
      type: 'STATION_ERROR',
      message: 'Không thể xác định đài',
      scope: 'global',
    })
  } else {
    // Kiểm tra xem đài có hỗ trợ trong ngày hiện tại không
    const stationErrors = validateStation(parsedResult.station)
    if (stationErrors.length > 0) {
      errors.push(...stationErrors)
    }
  }

  // Kiểm tra từng dòng
  for (let i = 0; i < parsedResult.lines.length; i++) {
    const line = parsedResult.lines[i]

    // Bỏ qua các dòng trống
    if (!line.originalLine || line.originalLine.trim() === '') continue

    const lineErrors = validateLine(line, parsedResult.station)

    // Thêm thông tin lỗi
    if (lineErrors.length > 0) {
      errors.push(
        ...lineErrors.map((error) => ({
          ...error,
          lineIndex: i,
          line: line.originalLine,
        }))
      )
    } else if (line.valid) {
      hasValidLine = true
    }

    // Cải tiến: Phát hiện các trường hợp đặc biệt

    // 1. Phát hiện nhiều kiểu cược trong một dòng
    const specialErrors = detectSpecialCases(line)
    if (specialErrors.length > 0) {
      errors.push(
        ...specialErrors.map((error) => ({
          ...error,
          lineIndex: i,
          line: line.originalLine,
        }))
      )
    }
  }

  // Kiểm tra nếu không có dòng nào hợp lệ
  if (parsedResult.lines.length > 0 && !hasValidLine) {
    errors.push({
      type: 'NO_VALID_LINE',
      message: 'Không có dòng cược nào hợp lệ',
      scope: 'global',
    })
  }

  return {
    hasErrors: errors.length > 0,
    errors,
  }
}

/**
 * Phát hiện các trường hợp đặc biệt trong dòng cược
 */
function detectSpecialCases(line) {
  const errors = []

  // Nếu dòng không hợp lệ, không cần kiểm tra thêm
  if (!line.valid) return errors

  // 1. Kiểm tra nhiều kiểu cược trong một dòng
  if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
    errors.push({
      type: 'MULTIPLE_BET_TYPES',
      message: `Dòng có nhiều kiểu cược (${
        line.additionalBetTypes.length + 1
      }) nên được tách thành các dòng riêng biệt`,
      scope: 'line',
      severity: 'warning', // Đánh dấu là cảnh báo, không phải lỗi
    })
  }

  // 2. Kiểm tra số gộp thành nhóm (1234 -> 12.34)
  for (const number of line.numbers || []) {
    if (/^\d{4,}$/.test(number) && number.length % 2 === 0) {
      errors.push({
        type: 'GROUPED_NUMBERS',
        message: `Số "${number}" nên được tách thành các cặp 2 chữ số`,
        scope: 'number',
        severity: 'warning',
      })
      break // Chỉ báo một lỗi cho tất cả các số trong dòng
    }
  }

  return errors
}

/**
 * Kiểm tra tính hợp lệ của đài
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateStation(station) {
  const errors = []

  if (station.multiStation) {
    // Kiểm tra số lượng đài
    if (station.count <= 0) {
      errors.push({
        type: 'INVALID_STATION_COUNT',
        message: 'Số lượng đài không hợp lệ',
        scope: 'station',
      })
    }

    // Kiểm tra ngày xổ số của đài
    const currentDay = getCurrentDayOfWeek()
    if (!isValidDayForRegion(station.region, currentDay)) {
      errors.push({
        type: 'INVALID_STATION_DAY',
        message: `Miền ${getRegionName(
          station.region
        )} không có xổ số vào ngày ${getDayName(currentDay)}`,
        scope: 'station',
      })
    }

    // Kiểm tra số lượng đài có vượt quá số đài xổ trong ngày không
    const maxStations = getMaxStationsForRegionOnDay(station.region, currentDay)
    if (station.count > maxStations) {
      errors.push({
        type: 'INVALID_STATION_COUNT',
        message: `Miền ${getRegionName(
          station.region
        )} chỉ có ${maxStations} đài xổ trong ngày ${getDayName(currentDay)}`,
        scope: 'station',
      })
    }
  } else if (station.stations) {
    // Nếu là nhiều đài cụ thể
    for (const subStation of station.stations) {
      const stationInfo = findStationByName(subStation.name)
      if (!stationInfo) {
        errors.push({
          type: 'INVALID_STATION',
          message: `Đài ${subStation.name} không tồn tại`,
          scope: 'station',
        })
        continue
      }

      // Kiểm tra xem đài có xổ trong ngày không
      const currentDay = getCurrentDayOfWeek()
      if (!isStationAvailableOnDay(stationInfo, currentDay)) {
        errors.push({
          type: 'STATION_NOT_AVAILABLE',
          message: `Đài ${stationInfo.name} không xổ vào ngày ${getDayName(
            currentDay
          )}`,
          scope: 'station',
        })
      }
    }

    // Kiểm tra xem các đài có cùng miền không
    if (station.stations.length > 1) {
      const regions = new Set(station.stations.map((s) => s.region))
      if (regions.size > 1) {
        errors.push({
          type: 'MIXED_REGIONS',
          message: 'Không thể kết hợp các đài từ các miền khác nhau',
          scope: 'station',
        })
      }
    }
  } else {
    // Đài đơn lẻ
    const stationInfo = findStationByName(station.name)
    if (!stationInfo) {
      errors.push({
        type: 'INVALID_STATION',
        message: `Đài ${station.name} không tồn tại`,
        scope: 'station',
      })
    } else if (station.name !== 'Miền Bắc') {
      // Kiểm tra xem đài có xổ trong ngày không (không kiểm tra đối với Miền Bắc vì nó xổ hàng ngày)
      const currentDay = getCurrentDayOfWeek()
      if (!isStationAvailableOnDay(stationInfo, currentDay)) {
        errors.push({
          type: 'STATION_NOT_AVAILABLE',
          message: `Đài ${stationInfo.name} không xổ vào ngày ${getDayName(
            currentDay
          )}`,
          scope: 'station',
        })
      }
    }
  }

  return errors
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
 * Lấy tên ngày từ số ngày trong tuần
 * @param {number} day - Số ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {string} Tên ngày
 */
function getDayName(day) {
  const days = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ]
  return days[day]
}

/**
 * Kiểm tra tính hợp lệ của một dòng cược
 * @param {object} line - Dòng cược
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateLine(line, station) {
  const errors = []

  // Kiểm tra kiểu cược
  if (!line.betType) {
    errors.push({
      type: 'NO_BET_TYPE',
      message: 'Thiếu kiểu cược',
      scope: 'line',
    })
  } else {
    // Kiểm tra kiểu cược có hợp lệ với đài không
    const betTypeErrors = validateBetType(line.betType, station)
    if (betTypeErrors.length > 0) {
      errors.push(...betTypeErrors)
    }
  }

  // Kiểm tra số cược
  if (!line.numbers || line.numbers.length === 0) {
    errors.push({
      type: 'NO_NUMBERS',
      message: 'Thiếu số cược',
      scope: 'line',
    })
  } else {
    // Kiểm tra từng số
    for (const number of line.numbers) {
      const numberErrors = validateNumber(number, line.betType)
      if (numberErrors.length > 0) {
        errors.push(
          ...numberErrors.map((error) => ({
            ...error,
            number,
          }))
        )
      }
    }
  }

  // Kiểm tra số tiền cược
  if (!line.amount || line.amount <= 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      message: 'Số tiền cược không hợp lệ',
      scope: 'line',
    })
  }

  // Kiểm tra các kiểu cược bổ sung
  if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
    for (let i = 0; i < line.additionalBetTypes.length; i++) {
      const additionalBet = line.additionalBetTypes[i]

      if (!additionalBet.betType) {
        errors.push({
          type: 'NO_ADDITIONAL_BET_TYPE',
          message: `Thiếu kiểu cược bổ sung (số ${i + 1})`,
          scope: 'line',
        })
      } else {
        // Kiểm tra kiểu cược có hợp lệ với đài không
        const betTypeErrors = validateBetType(additionalBet.betType, station)
        if (betTypeErrors.length > 0) {
          errors.push(
            ...betTypeErrors.map((error) => ({
              ...error,
              message: `Kiểu cược bổ sung (${additionalBet.betType.alias}): ${error.message}`,
            }))
          )
        }
      }

      if (!additionalBet.amount || additionalBet.amount <= 0) {
        errors.push({
          type: 'INVALID_ADDITIONAL_AMOUNT',
          message: `Số tiền cược cho kiểu cược bổ sung (${
            additionalBet.betType?.alias || 'số ' + (i + 1)
          }) không hợp lệ`,
          scope: 'line',
        })
      }
    }
  }

  return errors
}

/**
 * Kiểm tra tính hợp lệ của kiểu cược với đài
 * @param {object} betType - Kiểu cược
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateBetType(betType, station) {
  const errors = []

  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.id || bt.aliases.includes(betType.alias)
  )

  if (!betTypeInfo) {
    errors.push({
      type: 'INVALID_BET_TYPE',
      message: `Kiểu cược ${betType.alias || betType.name} không hợp lệ`,
      scope: 'bet_type',
    })
    return errors
  }

  // Kiểm tra xem kiểu cược có áp dụng cho miền này không
  if (station && !betTypeInfo.applicableRegions.includes(station.region)) {
    errors.push({
      type: 'INCOMPATIBLE_BET_TYPE',
      message: `Kiểu cược ${
        betTypeInfo.name
      } không áp dụng cho miền ${getRegionName(station.region)}`,
      scope: 'bet_type',
    })
  }

  return errors
}

/**
 * Kiểm tra tính hợp lệ của số cược
 * @param {string} number - Số cược
 * @param {object} betType - Kiểu cược
 * @returns {Array} Danh sách lỗi
 */
function validateNumber(number, betType) {
  const errors = []

  if (!number) {
    errors.push({
      type: 'INVALID_NUMBER',
      message: 'Số cược không hợp lệ',
      scope: 'number',
    })
    return errors
  }

  // Kiểm tra định dạng số
  if (!/^\d+$/.test(number)) {
    errors.push({
      type: 'INVALID_NUMBER_FORMAT',
      message: `Số cược "${number}" không đúng định dạng`,
      scope: 'number',
    })
    return errors
  }

  // Nếu không có thông tin kiểu cược, không thể kiểm tra thêm
  if (!betType) {
    return errors
  }

  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.id || bt.aliases.includes(betType.alias)
  )

  if (!betTypeInfo) {
    return errors
  }

  // Kiểm tra số chữ số
  const validDigitCounts = Array.isArray(betTypeInfo.betRule)
    ? betTypeInfo.betRule.map((rule) => parseInt(rule.match(/\d+/)[0], 10))
    : []

  if (
    validDigitCounts.length > 0 &&
    !validDigitCounts.includes(number.length)
  ) {
    const validDigitsText = validDigitCounts.join(', ')
    errors.push({
      type: 'INVALID_DIGIT_COUNT',
      message: `Số cược "${number}" có ${number.length} chữ số, không phù hợp với kiểu cược ${betTypeInfo.name} (yêu cầu ${validDigitsText} chữ số)`,
      scope: 'number',
    })
  }

  return errors
}

/**
 * Lấy tên miền từ mã miền
 * @param {string} region - Mã miền
 * @returns {string} Tên miền
 */
function getRegionName(region) {
  const map = {
    north: 'Bắc',
    central: 'Trung',
    south: 'Nam',
  }
  return map[region] || region
}

/**
 * Lấy ngày hiện tại trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {number} Ngày trong tuần
 */
function getCurrentDayOfWeek() {
  return new Date().getDay()
}

/**
 * Kiểm tra xem đài có xổ vào ngày hiện tại không
 * @param {object} station - Thông tin đài
 * @param {number} day - Ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {boolean} True nếu đài xổ vào ngày hiện tại
 */
function isStationAvailableOnDay(station, day) {
  if (!station || !station.schedule) {
    return false
  }

  const dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    daily: 'daily',
  }

  const currentDayString = dayMap[day]

  // Xổ hàng ngày
  if (station.schedule.day === 'daily') {
    return true
  }

  // Xổ nhiều ngày - schedule là mảng
  if (Array.isArray(station.schedule)) {
    return station.schedule.some((sch) => sch.day === currentDayString)
  }

  // Xổ 1 ngày - schedule là object
  return station.schedule.day === currentDayString
}

/**
 * Kiểm tra xem miền có xổ vào ngày hiện tại không
 * @param {string} region - Miền
 * @param {number} day - Ngày trong tuần
 * @returns {boolean} True nếu miền có xổ vào ngày hiện tại
 */
function isValidDayForRegion(region, day) {
  // Tất cả các miền đều có xổ mỗi ngày
  return true
}

/**
 * Tìm thông tin đài theo tên
 * @param {string} name - Tên đài
 * @returns {object} Thông tin đài
 */
function findStationByName(name) {
  return defaultStations.find((s) => s.name === name)
}
