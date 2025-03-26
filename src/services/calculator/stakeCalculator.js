// src/services/calculator/stakeCalculator.js
import { REGIONS } from '@/config/constants'
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'

/**
 * Tính toán tiền đặt cược dựa trên mã cược đã phân tích
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @param {object} userSettings - Cài đặt người dùng (tỉ lệ, hệ số nhân...)
 * @returns {object} Kết quả tính toán tiền cược
 */
export function calculateStake(parsedResult, userSettings = {}) {
  if (!parsedResult || !parsedResult.success || !parsedResult.lines) {
    return {
      success: false,
      totalStake: 0,
      details: [],
      error: 'Dữ liệu mã cược không hợp lệ',
    }
  }

  try {
    const lines = parsedResult.lines
    let totalStake = 0
    const details = []

    // Xử lý từng dòng trong mã cược
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (!line.valid || !line.amount || line.amount <= 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          stake: 0,
          valid: false,
          error: 'Dòng không hợp lệ hoặc không có số tiền',
        })
        continue
      }

      // Lấy thông tin về đài
      const stationInfo = getStationInfo(line, userSettings)

      // Lấy thông tin về kiểu cược
      const betTypeInfo = getBetTypeInfo(line, userSettings)

      // Lấy số lượng số và tổ hợp
      const numberInfo = getNumberInfo(line, betTypeInfo)

      // Tính tiền đặt cược cho dòng này
      const lineStake = calculateLineStake(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      )

      totalStake += lineStake.stake
      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...lineStake,
      })
    }

    return {
      success: true,
      totalStake,
      details,
      error: null,
    }
  } catch (error) {
    console.error('Lỗi khi tính tiền cược:', error)
    return {
      success: false,
      totalStake: 0,
      details: [],
      error: error.message || 'Lỗi không xác định khi tính tiền cược',
    }
  }
}

/**
 * Lấy thông tin về đài
 * @param {object} line - Dòng mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về đài
 */
function getStationInfo(line, userSettings) {
  const stationMultiplier = userSettings.stationMultiplier || 1

  if (line.multiStation) {
    // Đài nhiều miền
    return {
      count: line.station.count || 1,
      multiplier: stationMultiplier,
    }
  } else if (line.station?.stations) {
    // Nhiều đài (vl.ct)
    return {
      count: line.station.stations.length || 1,
      multiplier: stationMultiplier,
    }
  } else {
    // Đài đơn lẻ
    return {
      count: 1,
      multiplier: stationMultiplier,
    }
  }
}

/**
 * Lấy thông tin về kiểu cược
 * @param {object} line - Dòng mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về kiểu cược
 */
function getBetTypeInfo(line, userSettings) {
  const betTypeId = line.betType?.id
  const defaultBetType = defaultBetTypes.find((bt) => bt.id === betTypeId)

  // Lấy payoutRate mặc định hoặc từ cài đặt người dùng
  let payoutRate = defaultBetType?.payoutRate || 0
  if (userSettings.payoutRates && userSettings.payoutRates[betTypeId]) {
    payoutRate = userSettings.payoutRates[betTypeId]
  }

  // Xử lý payoutRate phức tạp (dạng object)
  if (typeof payoutRate === 'object') {
    // Mặc định sử dụng cho 2 chữ số
    payoutRate = payoutRate['2 digits'] || 75

    // Kiểm tra độ dài số đầu tiên nếu có
    if (line.numbers && line.numbers.length > 0) {
      const firstNumber = line.numbers[0]
      if (firstNumber) {
        const digitCount = `${firstNumber.length} digits`
        if (payoutRate[digitCount]) {
          payoutRate = payoutRate[digitCount]
        }
      }
    }
  }

  return {
    id: betTypeId,
    name: line.betType?.name || 'Unknown',
    alias: line.betType?.alias || '',
    payoutRate,
    combined: line.betType?.combined || false,
  }
}

/**
 * Lấy thông tin về số và tổ hợp
 * @param {object} line - Dòng mã cược
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @returns {object} Thông tin về số và tổ hợp
 */
function getNumberInfo(line, betTypeInfo) {
  const numbers = line.numbers || []
  const combinationCount = getCombinationCount(line, betTypeInfo)

  return {
    count: numbers.length,
    combinationCount,
    isBridge: betTypeInfo.alias === 'da' || betTypeInfo.alias === 'dv',
    isPermutation: betTypeInfo.alias === 'dao' || betTypeInfo.alias === 'xcd',
  }
}

/**
 * Lấy số lượng tổ hợp dựa vào kiểu cược và miền
 * @param {object} line - Dòng mã cược
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @returns {number} Số lượng tổ hợp
 */
function getCombinationCount(line, betTypeInfo) {
  // Nếu là kiểu cược kết hợp, kiểm tra chi tiết
  if (betTypeInfo.combined && line.details?.numbersAndBetTypes?.combined) {
    return line.details.numbersAndBetTypes.combined.length || 1
  }

  // Tìm thông tin kiểu cược từ mặc định
  const betType = defaultBetTypes.find((bt) => bt.id === betTypeInfo.id)
  if (!betType) return 1

  // Xác định region
  const region = line.station?.region || 'south'

  // Lấy số lượng tổ hợp dựa vào kiểu cược và miền
  let combinations = 1

  if (betType.combinations) {
    // Trường hợp cấu trúc đơn giản
    if (typeof betType.combinations === 'number') {
      combinations = betType.combinations
    }
    // Trường hợp phân biệt theo miền
    else if (typeof betType.combinations === 'object') {
      if (region === REGIONS.SOUTH || region === REGIONS.CENTRAL) {
        combinations =
          betType.combinations.south || betType.combinations.central || 1
      } else if (region === REGIONS.NORTH) {
        combinations = betType.combinations.north || 1
      }

      // Trường hợp phân biệt thêm theo số chữ số
      if (
        typeof combinations === 'object' &&
        line.numbers &&
        line.numbers.length > 0
      ) {
        const firstNumber = line.numbers[0]
        const digitCount = `${firstNumber.length} digits`
        combinations = combinations[digitCount] || 1
      }
    }
  }

  return combinations
}

/**
 * Tính tiền đặt cược cho một dòng
 * @param {object} line - Dòng mã cược
 * @param {object} stationInfo - Thông tin về đài
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @param {object} numberInfo - Thông tin về số và tổ hợp
 * @returns {object} Kết quả tính tiền đặt cược
 */
function calculateLineStake(line, stationInfo, betTypeInfo, numberInfo) {
  const betAmount = line.amount || 0

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge) {
    // Tính bridgeFactor = C(n,2) = n*(n-1)/2
    const n = numberInfo.count
    const bridgeFactor = (n * (n - 1)) / 2

    const stake =
      stationInfo.count *
      bridgeFactor *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      betFactor: bridgeFactor,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${bridgeFactor} × ${numberInfo.combinationCount} × ${betAmount} × ${stationInfo.multiplier}`,
    }
  }
  // Kiểm tra nếu là kiểu đảo (permutation)
  else if (numberInfo.isPermutation) {
    // Tính số lượng hoán vị (không tính trùng lặp)
    const numbers = line.numbers || []
    const uniqueDigits = new Set()

    // Lấy số đầu tiên để xác định độ dài
    const firstNumber = numbers[0] || ''
    for (let i = 0; i < firstNumber.length; i++) {
      uniqueDigits.add(firstNumber.charAt(i))
    }

    // Tính số lượng hoán vị dựa trên số chữ số và số chữ số khác nhau
    const n = firstNumber.length
    const uniqueCount = uniqueDigits.size

    // Hoán vị với lặp: n! / (n1! * n2! * ... * nk!)
    let permutationCount = factorial(n)

    // Trường hợp có chữ số trùng lặp
    if (uniqueCount < n) {
      // Đơn giản hóa, giả sử có 2 hoặc 3 chữ số
      if (n === 2) {
        permutationCount = uniqueCount === 1 ? 1 : 2
      } else if (n === 3) {
        if (uniqueCount === 1) permutationCount = 1
        else if (uniqueCount === 2) permutationCount = 3
        else permutationCount = 6
      }
    }

    const stake =
      stationInfo.count *
      permutationCount *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      betFactor: permutationCount,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${permutationCount} × ${numberInfo.combinationCount} × ${betAmount} × ${stationInfo.multiplier}`,
    }
  }
  // Trường hợp thông thường
  else {
    const stake =
      stationInfo.count *
      numberInfo.count *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${numberInfo.count} × ${numberInfo.combinationCount} × ${betAmount} × ${stationInfo.multiplier}`,
    }
  }
}

/**
 * Tính giai thừa
 * @param {number} n - Số cần tính giai thừa
 * @returns {number} Giai thừa của n
 */
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

/**
 * Hàm tối ưu để tính tiền cược nhanh
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @returns {number} Tổng tiền cược
 */
export function quickCalculateStake(parsedResult) {
  if (!parsedResult || !parsedResult.success || !parsedResult.lines) return 0

  let totalStake = 0

  // Duyệt qua từng dòng
  parsedResult.lines.forEach((line) => {
    if (line.valid && line.amount > 0) {
      // Số lượng đài
      const stationCount = line.multiStation
        ? line.station?.count || 1
        : line.station?.stations?.length || 1

      // Số lượng số
      const numberCount = line.numbers?.length || 1

      // Kiểm tra kiểu cược đặc biệt
      const isBridge =
        line.betType?.alias === 'da' || line.betType?.alias === 'dv'

      if (isBridge && numberCount >= 2) {
        // Tính bridgeFactor
        const bridgeFactor = (numberCount * (numberCount - 1)) / 2
        totalStake += stationCount * bridgeFactor * line.amount
      } else {
        // Trường hợp thông thường
        totalStake += stationCount * numberCount * line.amount
      }
    }
  })

  return totalStake
}

export default {
  calculateStake,
  quickCalculateStake,
}
