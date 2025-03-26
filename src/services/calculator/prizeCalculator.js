// src/services/calculator/prizeCalculator.js
import { REGIONS } from '@/config/constants'
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'

/**
 * Tính toán tiềm năng thắng cược dựa trên mã cược đã phân tích
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @param {object} userSettings - Cài đặt người dùng (tỉ lệ, hệ số nhân...)
 * @returns {object} Kết quả tính toán tiềm năng thắng cược
 */
export function calculatePotentialPrize(parsedResult, userSettings = {}) {
  if (!parsedResult || !parsedResult.success || !parsedResult.lines) {
    return {
      success: false,
      totalPotential: 0,
      details: [],
      error: 'Dữ liệu mã cược không hợp lệ',
    }
  }

  try {
    const lines = parsedResult.lines
    let totalPotential = 0
    const details = []

    // Xử lý từng dòng trong mã cược
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (!line.valid || !line.amount || line.amount <= 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          potentialPrize: 0,
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

      // Tính tiềm năng thắng cược cho dòng này
      const linePotential = calculateLinePotential(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      )

      totalPotential += linePotential.potentialPrize
      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...linePotential,
      })
    }

    return {
      success: true,
      totalPotential,
      details,
      error: null,
    }
  } catch (error) {
    console.error('Lỗi khi tính tiềm năng thắng cược:', error)
    return {
      success: false,
      totalPotential: 0,
      details: [],
      error:
        error.message || 'Lỗi không xác định khi tính tiềm năng thắng cược',
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
  // Tương tự như trong stakeCalculator.js
  if (betTypeInfo.combined && line.details?.numbersAndBetTypes?.combined) {
    return line.details.numbersAndBetTypes.combined.length || 1
  }

  const betType = defaultBetTypes.find((bt) => bt.id === betTypeInfo.id)
  if (!betType) return 1

  const region = line.station?.region || 'south'

  let combinations = 1

  if (betType.combinations) {
    if (typeof betType.combinations === 'number') {
      combinations = betType.combinations
    } else if (typeof betType.combinations === 'object') {
      if (region === REGIONS.SOUTH || region === REGIONS.CENTRAL) {
        combinations =
          betType.combinations.south || betType.combinations.central || 1
      } else if (region === REGIONS.NORTH) {
        combinations = betType.combinations.north || 1
      }

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
 * Tính tiềm năng thắng cược cho một dòng
 * @param {object} line - Dòng mã cược
 * @param {object} stationInfo - Thông tin về đài
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @param {object} numberInfo - Thông tin về số và tổ hợp
 * @returns {object} Kết quả tính tiềm năng thắng cược
 */
function calculateLinePotential(line, stationInfo, betTypeInfo, numberInfo) {
  const betAmount = line.amount || 0
  const payoutRate = betTypeInfo.payoutRate || 0

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge) {
    // Tính tiềm năng thắng tối đa cho kiểu đá
    const numbers = line.numbers || []
    const n = numbers.length
    const maxPairs = (n * (n - 1)) / 2 // C(n,2) = số cặp tối đa

    // Giả sử trường hợp lý tưởng khi tất cả các cặp đều trúng
    const potentialPrize =
      stationInfo.count *
      maxPairs *
      betAmount *
      payoutRate *
      stationInfo.multiplier

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      betPairs: maxPairs,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${maxPairs} × ${betAmount} × ${payoutRate} × ${stationInfo.multiplier}`,
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

    // Giả sử trường hợp lý tưởng khi tất cả các hoán vị đều trúng
    const potentialPrize =
      stationInfo.count *
      permutationCount *
      numbers.length *
      betAmount *
      payoutRate *
      stationInfo.multiplier

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      permutationCount,
      numberCount: numbers.length,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${permutationCount} × ${numbers.length} × ${betAmount} × ${payoutRate} × ${stationInfo.multiplier}`,
    }
  }
  // Trường hợp thông thường
  else {
    // Tính tiềm năng thắng tối đa
    const potentialPrize =
      stationInfo.count *
      numberInfo.count *
      betAmount *
      payoutRate *
      stationInfo.multiplier

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${numberInfo.count} × ${betAmount} × ${payoutRate} × ${stationInfo.multiplier}`,
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
 * Tính toán trúng thưởng dựa trên mã cược và kết quả xổ số
 * @param {object} parsedBetCode - Mã cược đã phân tích
 * @param {object} lotteryResults - Kết quả xổ số
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Kết quả tính toán trúng thưởng
 */
export function calculateActualPrize(
  parsedBetCode,
  lotteryResults,
  userSettings = {}
) {
  if (
    !parsedBetCode ||
    !parsedBetCode.success ||
    !parsedBetCode.lines ||
    !lotteryResults
  ) {
    return {
      success: false,
      totalPrize: 0,
      details: [],
      error: 'Dữ liệu không hợp lệ',
    }
  }

  try {
    const lines = parsedBetCode.lines
    let totalPrize = 0
    const details = []

    // Xử lý từng dòng trong mã cược
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (!line.valid || !line.amount || line.amount <= 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          prize: 0,
          valid: false,
          error: 'Dòng không hợp lệ hoặc không có số tiền',
        })
        continue
      }

      // Tìm kết quả xổ số tương ứng với đài
      const matchingResults = findMatchingResults(line, lotteryResults)

      if (!matchingResults || matchingResults.length === 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          prize: 0,
          valid: true,
          matched: false,
          error: 'Không tìm thấy kết quả xổ số tương ứng',
        })
        continue
      }

      // Tính kết quả trúng thưởng cho dòng
      const linePrizeResult = calculateLinePrize(
        line,
        matchingResults,
        userSettings
      )

      totalPrize += linePrizeResult.prize || 0
      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...linePrizeResult,
      })
    }

    return {
      success: true,
      totalPrize,
      details,
      error: null,
    }
  } catch (error) {
    console.error('Lỗi khi tính trúng thưởng:', error)
    return {
      success: false,
      totalPrize: 0,
      details: [],
      error: error.message || 'Lỗi không xác định khi tính trúng thưởng',
    }
  }
}

/**
 * Tìm kết quả xổ số tương ứng với đài
 * @param {object} line - Dòng mã cược
 * @param {object} lotteryResults - Kết quả xổ số
 * @returns {array} Danh sách kết quả xổ số tương ứng
 */
function findMatchingResults(line, lotteryResults) {
  if (!line.station || !lotteryResults || !Array.isArray(lotteryResults)) {
    return []
  }

  // Xử lý đài nhiều miền
  if (line.multiStation) {
    const region = line.station.region
    const count = line.station.count || 1

    return lotteryResults
      .filter((result) => result.region === region)
      .slice(0, count)
  }

  // Xử lý nhiều đài (vl.ct)
  if (line.station.stations) {
    const stationNames = line.station.stations.map((s) => s.name)
    return lotteryResults.filter((result) =>
      stationNames.includes(result.station)
    )
  }

  // Xử lý đài đơn lẻ
  return lotteryResults.filter((result) => {
    if (result.station === line.station.name) return true
    const station = defaultStations.find((s) => s.name === line.station.name)
    if (station && station.aliases.includes(result.station)) return true
    return false
  })
}

/**
 * Tính trúng thưởng cho một dòng
 * @param {object} line - Dòng mã cược
 * @param {array} matchingResults - Kết quả xổ số tương ứng
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Kết quả tính trúng thưởng
 */
function calculateLinePrize(line, matchingResults, userSettings = {}) {
  // Tìm thông tin về kiểu cược
  const betTypeId = line.betType?.id
  const defaultBetType = defaultBetTypes.find((bt) => bt.id === betTypeId)

  if (!defaultBetType) {
    return {
      prize: 0,
      valid: true,
      matched: false,
      error: 'Không tìm thấy thông tin kiểu cược',
    }
  }

  // Lấy payoutRate
  let payoutRate = defaultBetType.payoutRate || 0
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

  // Tìm số trúng
  const matchedNumbers = findMatchedNumbers(
    line,
    matchingResults,
    defaultBetType
  )

  if (matchedNumbers.length === 0) {
    return {
      prize: 0,
      valid: true,
      matched: false,
      matchedNumbers: [],
      payoutRate,
    }
  }

  // Tính tiền thưởng
  const betAmount = line.amount || 0
  const prize = matchedNumbers.length * betAmount * payoutRate

  return {
    prize,
    valid: true,
    matched: true,
    matchedNumbers,
    matchedCount: matchedNumbers.length,
    betAmount,
    payoutRate,
    formula: `${matchedNumbers.length} × ${betAmount} × ${payoutRate}`,
  }
}

/**
 * Tìm các số trúng thưởng
 * @param {object} line - Dòng mã cược
 * @param {array} matchingResults - Kết quả xổ số tương ứng
 * @param {object} betType - Thông tin kiểu cược
 * @returns {array} Danh sách số trúng thưởng
 */
function findMatchedNumbers(line, matchingResults, betType) {
  // Đây chỉ là mẫu, trong thực tế cần kiểm tra chi tiết hơn dựa vào kiểu cược
  const numbers = line.numbers || []
  const matchedNumbers = []

  for (const result of matchingResults) {
    const resultDigits = extractDigits(result, betType)

    for (const number of numbers) {
      if (resultDigits.includes(number)) {
        matchedNumbers.push(number)
      }
    }
  }

  return matchedNumbers
}

/**
 * Trích xuất các số từ kết quả xổ số
 * @param {object} result - Kết quả xổ số
 * @param {object} betType - Thông tin kiểu cược
 * @returns {array} Danh sách số từ kết quả xổ số
 */
function extractDigits(result, betType) {
  // Đây chỉ là mẫu, trong thực tế cần trích xuất chi tiết hơn dựa vào kiểu cược
  if (!result || !result.results) return []

  const digits = []

  // Duyệt qua tất cả các giải
  Object.entries(result.results).forEach(([prize, numbers]) => {
    if (Array.isArray(numbers)) {
      for (const number of numbers) {
        // Trích xuất 2 số cuối
        if (number.length >= 2) {
          digits.push(number.slice(-2))
        }

        // Trích xuất 3 số cuối
        if (number.length >= 3) {
          digits.push(number.slice(-3))
        }

        // Trích xuất 4 số cuối
        if (number.length >= 4) {
          digits.push(number.slice(-4))
        }
      }
    }
  })

  return [...new Set(digits)] // Loại bỏ trùng lặp
}

export default {
  calculatePotentialPrize,
  calculateActualPrize,
}
