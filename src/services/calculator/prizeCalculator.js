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
      region: line.station.region,
    }
  } else if (line.station?.stations) {
    // Nhiều đài (vl.ct)
    return {
      count: line.station.stations.length || 1,
      multiplier: stationMultiplier,
      region: line.station.region,
    }
  } else {
    // Đài đơn lẻ
    return {
      count: 1,
      multiplier: stationMultiplier,
      region: line.station?.region,
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
  const betTypeAlias = line.betType?.alias?.toLowerCase()

  // Tìm bet type dựa trên ID hoặc alias
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.id === betTypeId ||
      bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
  )

  if (!defaultBetType) {
    return {
      id: betTypeId,
      name: line.betType?.name || 'Unknown',
      alias: betTypeAlias || '',
      payoutRate: 0,
      combined: false,
    }
  }

  // Lấy payoutRate mặc định hoặc từ cài đặt người dùng
  let payoutRate = defaultBetType.payoutRate || 0
  if (userSettings.payoutRates && userSettings.payoutRates[betTypeId]) {
    payoutRate = userSettings.payoutRates[betTypeId]
  }

  // Xác định số chữ số để lấy tỉ lệ chính xác
  const digitCount = getDigitCount(line)

  // Xử lý payoutRate phức tạp (dạng object)
  if (typeof payoutRate === 'object') {
    if (betTypeAlias === 'da' || betTypeAlias === 'dv') {
      // Kiểu đá (bridge)
      const region = line.station?.region
      const stationCount = line.multiStation
        ? line.station?.count || 1
        : line.station?.stations?.length || 1

      // Đặt tỉ lệ theo đúng quy tắc từ tài liệu
      if (region === 'north') {
        payoutRate = payoutRate.bridgeNorth || 650
      } else if (stationCount === 2) {
        payoutRate = payoutRate.bridgeTwoStations || 550
      } else {
        payoutRate = payoutRate.bridgeOneStation || 750
      }
    } else if (
      betTypeAlias === 'xien' ||
      betTypeAlias === 'xienmb' ||
      betTypeAlias === 'xienmbac'
    ) {
      // Kiểu xiên
      const numberCount = line.numbers?.length || 0
      if (numberCount === 2) {
        payoutRate = payoutRate.crossTwo || 350
      } else if (numberCount === 3) {
        payoutRate = payoutRate.crossThree || 1000
      } else if (numberCount >= 4) {
        payoutRate = payoutRate.crossFour || 3000
      }
    } else {
      // Các kiểu khác
      if (digitCount === 2) {
        payoutRate =
          payoutRate.twoDigits?.standard ||
          payoutRate.standard ||
          payoutRate['2 digits'] ||
          75
      } else if (digitCount === 3) {
        payoutRate = payoutRate.threeDigits || payoutRate['3 digits'] || 650
      } else if (digitCount === 4) {
        payoutRate = payoutRate.fourDigits || payoutRate['4 digits'] || 5500
      }
    }
  }

  return {
    id: defaultBetType.id,
    name: defaultBetType.name,
    alias: betTypeAlias,
    payoutRate,
    combined: line.betType?.combined || false,
  }
}

/**
 * Lấy số lượng chữ số của số đầu tiên trong dòng
 */
function getDigitCount(line) {
  if (line.numbers && line.numbers.length > 0) {
    const firstNumber = line.numbers[0]
    return firstNumber ? firstNumber.length : 2
  }
  return 2 // Mặc định là 2 chữ số
}

/**
 * Lấy thông tin về số và tổ hợp
 * @param {object} line - Dòng mã cược
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @returns {object} Thông tin về số và tổ hợp
 */
function getNumberInfo(line, betTypeInfo) {
  const numbers = line.numbers || []
  const betTypeAlias = betTypeInfo.alias?.toLowerCase()
  const digitCount = getDigitCount(line)

  // Kiểm tra loại cược
  const isBridge = betTypeAlias === 'da' || betTypeAlias === 'dv'
  const isPermutation =
    betTypeAlias === 'dao' ||
    betTypeAlias === 'xcd' ||
    betTypeAlias === 'daob' ||
    betTypeAlias === 'bdao' ||
    betTypeAlias === 'daoxc' ||
    betTypeAlias === 'dxc'

  // Tìm thông tin bet type từ defaults
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.id === betTypeInfo.id ||
      bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
  )

  // Lấy số lượng tổ hợp dựa trên miền và bet type
  let combinationCount = 1
  if (defaultBetType && defaultBetType.combinations) {
    const region = line.station?.region || 'south'

    if (typeof defaultBetType.combinations === 'object') {
      // Kiểm tra nếu có nested structure cho số chữ số
      if (
        typeof defaultBetType.combinations[`${digitCount} digits`] === 'object'
      ) {
        combinationCount =
          defaultBetType.combinations[`${digitCount} digits`][region] || 1
      }
      // Kiểm tra nếu có direct mapping cho region
      else if (typeof defaultBetType.combinations[region] === 'number') {
        combinationCount = defaultBetType.combinations[region]
      }
      // Kiểm tra nếu có direct mapping cho số chữ số
      else if (
        typeof defaultBetType.combinations[`${digitCount} digits`] === 'number'
      ) {
        combinationCount = defaultBetType.combinations[`${digitCount} digits`]
      }
    } else if (typeof defaultBetType.combinations === 'number') {
      combinationCount = defaultBetType.combinations
    }
  }

  // Xử lý các trường hợp đặc biệt
  if (
    betTypeAlias === 'b' ||
    betTypeAlias === 'bao' ||
    betTypeAlias === 'baolo'
  ) {
    // Kiểu bao lô
    const region = line.station?.region || 'south'

    if (digitCount === 2) {
      if (region === 'north') {
        combinationCount = 27
      } else {
        combinationCount = 18
      }
    } else if (digitCount === 3) {
      if (region === 'north') {
        combinationCount = 23
      } else {
        combinationCount = 17
      }
    } else if (digitCount === 4) {
      if (region === 'north') {
        combinationCount = 20
      } else {
        combinationCount = 16
      }
    }
  } else if (betTypeAlias === 'b7l' || betTypeAlias === 'baobay') {
    // Bao lô 7
    combinationCount = 7
  } else if (betTypeAlias === 'b8l' || betTypeAlias === 'baotam') {
    // Bao lô 8
    combinationCount = 8
  }

  return {
    count: numbers.length,
    combinationCount,
    isBridge,
    isPermutation,
    digitCount,
  }
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
  const betTypeAlias = betTypeInfo.alias?.toLowerCase()

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge) {
    // Tính số cặp tối đa
    const n = numberInfo.count
    const maxPairs = (n * (n - 1)) / 2 // C(n,2) = số cặp tối đa

    // Tính tiềm năng tối đa
    let potentialPrize = stationInfo.count * maxPairs * betAmount * payoutRate

    // Xử lý trường hợp đặc biệt với phép tính thưởng nháy
    // Đây là ví dụ mô phỏng tình huống tốt nhất khi tất cả các số đều về
    // và có số về 2 lần (tính thưởng nháy)
    const bonusFactor = 0.5 // 50% của thắng cược là thưởng nháy
    let bonusPrize = 0

    // Nếu có ít nhất 3 số, thì có thể có số về 2 lần
    if (n >= 3) {
      const baseWinAmount = betAmount * payoutRate
      bonusPrize = bonusFactor * baseWinAmount
    }

    potentialPrize += bonusPrize

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      betPairs: maxPairs,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      bonusPrize,
      formula: `${stationInfo.count} × ${maxPairs} × ${betAmount} × ${payoutRate} + ${bonusPrize}`,
    }
  }
  // Kiểm tra nếu là kiểu đảo (permutation)
  else if (numberInfo.isPermutation) {
    // Tính số lượng hoán vị (không tính trùng lặp)
    const numbers = line.numbers || []
    let totalPermutations = 0

    for (const number of numbers) {
      totalPermutations += calculatePermutationCount(number)
    }

    // Tính tiềm năng thắng tối đa
    const potentialPrize =
      stationInfo.count *
      totalPermutations *
      numberInfo.combinationCount *
      betAmount *
      payoutRate *
      stationInfo.multiplier

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      permutationCount: totalPermutations,
      numberCount: numbers.length,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${totalPermutations} × ${numberInfo.combinationCount} × ${betAmount} × ${payoutRate} × ${stationInfo.multiplier}`,
    }
  }
  // Kiểu xiên
  else if (
    betTypeAlias === 'xien' ||
    betTypeAlias === 'xienmb' ||
    betTypeAlias === 'xienmbac'
  ) {
    // Xiên chỉ áp dụng cho miền Bắc
    const potentialPrize = betAmount * payoutRate

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${betAmount} × ${payoutRate}`,
    }
  }
  // Trường hợp thông thường
  else {
    // Tính tiềm năng thắng tối đa
    const potentialPrize =
      stationInfo.count *
      numberInfo.count *
      numberInfo.combinationCount *
      betAmount *
      payoutRate *
      stationInfo.multiplier

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${numberInfo.count} × ${numberInfo.combinationCount} × ${betAmount} × ${payoutRate} × ${stationInfo.multiplier}`,
    }
  }
}

/**
 * Tính số lượng hoán vị của một số (không tính trùng lặp)
 * @param {string} number - Số cần tính hoán vị
 * @returns {number} Số lượng hoán vị
 */
function calculatePermutationCount(number) {
  if (!number) return 1

  // Đếm số lượng mỗi chữ số
  const digitCounts = {}
  for (let i = 0; i < number.length; i++) {
    const digit = number[i]
    digitCounts[digit] = (digitCounts[digit] || 0) + 1
  }

  // Tính giai thừa của độ dài số
  let factorial = 1
  for (let i = 2; i <= number.length; i++) {
    factorial *= i
  }

  // Chia cho giai thừa của số lần xuất hiện của mỗi chữ số
  for (const digit in digitCounts) {
    let digitFactorial = 1
    for (let i = 2; i <= digitCounts[digit]; i++) {
      digitFactorial *= i
    }
    factorial /= digitFactorial
  }

  return factorial
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
  // Lấy thông tin cần thiết
  const betTypeAlias = line.betType?.alias?.toLowerCase()
  const numbers = line.numbers || []
  const betAmount = line.amount || 0

  // Tìm thông tin bet type
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.id === line.betType?.id ||
      bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
  )

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
  if (userSettings.payoutRates && userSettings.payoutRates[defaultBetType.id]) {
    payoutRate = userSettings.payoutRates[defaultBetType.id]
  }

  // Xử lý payoutRate phức tạp (dạng object)
  const digitCount = getDigitCount(line)
  if (typeof payoutRate === 'object') {
    // Tương tự như trong getBetTypeInfo
    if (betTypeAlias === 'da' || betTypeAlias === 'dv') {
      // Kiểu đá (bridge)
      const region = line.station?.region
      const stationCount = line.multiStation
        ? line.station?.count || 1
        : line.station?.stations?.length || 1

      if (region === 'north') {
        payoutRate = payoutRate.bridgeNorth || 650
      } else if (stationCount === 2) {
        payoutRate = payoutRate.bridgeTwoStations || 550
      } else {
        payoutRate = payoutRate.bridgeOneStation || 750
      }
    } else {
      // Các kiểu khác
      if (digitCount === 2) {
        payoutRate =
          payoutRate.twoDigits?.standard ||
          payoutRate.standard ||
          payoutRate['2 digits'] ||
          75
      } else if (digitCount === 3) {
        payoutRate = payoutRate.threeDigits || payoutRate['3 digits'] || 650
      } else if (digitCount === 4) {
        payoutRate = payoutRate.fourDigits || payoutRate['4 digits'] || 5500
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

  // Xử lý theo từng loại cược
  if (betTypeAlias === 'da' || betTypeAlias === 'dv') {
    // Kiểu đá (bridge)
    return calculateBridgePrize(line, matchedNumbers, payoutRate, betAmount)
  } else if (
    betTypeAlias === 'xien' ||
    betTypeAlias === 'xienmb' ||
    betTypeAlias === 'xienmbac'
  ) {
    // Kiểu xiên
    return calculateCrossPrize(line, matchedNumbers, payoutRate, betAmount)
  }

  // Kiểu thông thường
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
 * Tính tiền thưởng cho kiểu đá (bridge)
 */
function calculateBridgePrize(line, matchedNumbers, payoutRate, betAmount) {
  if (matchedNumbers.length < 2) {
    return {
      prize: 0,
      valid: true,
      matched: false,
      matchedNumbers,
      matchedCount: matchedNumbers.length,
      payoutRate,
    }
  }

  // Đếm số lần xuất hiện của mỗi số
  const numberCounts = {}
  matchedNumbers.forEach((num) => {
    numberCounts[num] = (numberCounts[num] || 0) + 1
  })

  // Tìm số lần xuất hiện nhiều nhất
  let maxOccurrences = 1
  for (const num in numberCounts) {
    if (numberCounts[num] > maxOccurrences) {
      maxOccurrences = numberCounts[num]
    }
  }

  // Tính hệ số tính thưởng W
  const W = matchedNumbers.length - 1

  // Tính tiền thắng 1 vòng V
  const V = betAmount * payoutRate

  // Tính tiền thưởng nháy B
  const B = maxOccurrences > 1 ? (maxOccurrences - 1) * 0.5 * V : 0

  // Tổng tiền thưởng
  const prize = V * W + B

  return {
    prize,
    valid: true,
    matched: true,
    matchedNumbers,
    matchedCount: matchedNumbers.length,
    betAmount,
    payoutRate,
    winFactor: W,
    bonusFactor: maxOccurrences > 1 ? (maxOccurrences - 1) * 0.5 : 0,
    baseWinAmount: V,
    bonusPrize: B,
    formula: `(${V} × ${W}) + ${B}`,
  }
}

/**
 * Tính tiền thưởng cho kiểu xiên
 */
function calculateCrossPrize(line, matchedNumbers, payoutRate, betAmount) {
  // Kiểu xiên cần tất cả các số đều trúng
  if (matchedNumbers.length < line.numbers.length) {
    return {
      prize: 0,
      valid: true,
      matched: false,
      matchedNumbers,
      matchedCount: matchedNumbers.length,
      payoutRate,
    }
  }

  // Nếu đủ số trúng thì nhận đủ giải thưởng
  const prize = betAmount * payoutRate

  return {
    prize,
    valid: true,
    matched: true,
    matchedNumbers,
    matchedCount: matchedNumbers.length,
    betAmount,
    payoutRate,
    formula: `${betAmount} × ${payoutRate}`,
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
  const numbers = line.numbers || []
  const betTypeAlias = line.betType?.alias?.toLowerCase()
  const digitCount = getDigitCount(line)
  const isPermutation =
    betTypeAlias === 'dao' ||
    betTypeAlias === 'xcd' ||
    betTypeAlias === 'daob' ||
    betTypeAlias === 'bdao' ||
    betTypeAlias === 'daoxc' ||
    betTypeAlias === 'dxc'

  const matchedNumbers = []

  for (const result of matchingResults) {
    // Trích xuất mảng số từ các giải thưởng dựa trên kiểu cược
    const resultDigits = extractDrawNumbers(result, line, betType)

    // Kiểm tra từng số cược
    for (const number of numbers) {
      // Nếu là kiểu đảo, tạo tất cả hoán vị của số
      if (isPermutation) {
        const permutations = generatePermutations(number)
        const matched = permutations.some((perm) => resultDigits.includes(perm))
        if (matched) matchedNumbers.push(number)
      }
      // Kiểu thông thường
      else if (resultDigits.includes(number)) {
        matchedNumbers.push(number)
      }
    }
  }

  return [...new Set(matchedNumbers)] // Loại bỏ trùng lặp
}

/**
 * Tạo các hoán vị của một số
 */
function generatePermutations(number) {
  if (!number) return []
  if (number.length <= 1) return [number]

  const result = []
  const visited = {}

  // Hàm đệ quy để tạo hoán vị
  function backtrack(current, remaining) {
    if (current.length === number.length) {
      result.push(current)
      return
    }

    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i]
      // Bỏ qua nếu ký tự đã được sử dụng ở vị trí này
      if (visited[i]) continue

      // Đánh dấu đã sử dụng
      visited[i] = true

      // Đệ quy
      backtrack(current + char, remaining)

      // Bỏ đánh dấu
      visited[i] = false

      // Bỏ qua các ký tự trùng lặp
      while (i + 1 < remaining.length && remaining[i] === remaining[i + 1]) i++
    }
  }

  // Sắp xếp các chữ số để xử lý trùng lặp
  const sortedDigits = number.split('').sort().join('')

  // Bắt đầu tạo hoán vị
  backtrack('', sortedDigits)

  return result
}

/**
 * Trích xuất các số từ kết quả xổ số dựa trên kiểu cược
 * @param {object} result - Kết quả xổ số
 * @param {object} line - Dòng mã cược
 * @param {object} betType - Thông tin kiểu cược
 * @returns {array} Danh sách số từ kết quả xổ số
 */
function extractDrawNumbers(result, line, betType) {
  if (!result || !result.results) return []

  const betTypeAlias = line.betType?.alias?.toLowerCase()
  const digitCount = getDigitCount(line)
  const region = line.station?.region || 'south'
  const digits = []

  // Xác định giải thưởng cần kiểm tra dựa vào kiểu cược và miền
  if (
    betTypeAlias === 'dd' ||
    betTypeAlias === 'dau duoi' ||
    betTypeAlias === 'head and tail'
  ) {
    // Đầu đuôi - lấy giải 8 và đặc biệt cho miền Nam/Trung, giải 7 và đặc biệt cho miền Bắc
    if (region === 'north') {
      // Đầu - giải 7
      if (result.results.seventh) {
        result.results.seventh.forEach((num) => digits.push(num.slice(-2)))
      }
      // Đuôi - giải đặc biệt
      if (result.results.special) {
        result.results.special.forEach((num) => digits.push(num.slice(-2)))
      }
    } else {
      // Đầu - giải 8
      if (result.results.eighth) {
        result.results.eighth.forEach((num) => digits.push(num.slice(-2)))
      }
      // Đuôi - giải đặc biệt
      if (result.results.special) {
        result.results.special.forEach((num) => digits.push(num.slice(-2)))
      }
    }
  } else if (betTypeAlias === 'dau' || betTypeAlias === 'head') {
    // Đầu - kiểm tra số chữ số
    if (digitCount === 2) {
      if (region === 'north') {
        // Miền Bắc - giải 7
        if (result.results.seventh) {
          result.results.seventh.forEach((num) => digits.push(num.slice(-2)))
        }
      } else {
        // Miền Nam/Trung - giải 8
        if (result.results.eighth) {
          result.results.eighth.forEach((num) => digits.push(num.slice(-2)))
        }
      }
    } else if (digitCount === 3) {
      if (region === 'north') {
        // Miền Bắc - giải 6
        if (result.results.sixth) {
          result.results.sixth.forEach((num) => digits.push(num.slice(-3)))
        }
      } else {
        // Miền Nam/Trung - giải 7
        if (result.results.seventh) {
          result.results.seventh.forEach((num) => digits.push(num.slice(-3)))
        }
      }
    }
  } else if (
    betTypeAlias === 'duoi' ||
    betTypeAlias === 'dui' ||
    betTypeAlias === 'tail'
  ) {
    // Đuôi - chỉ lấy giải đặc biệt
    if (result.results.special) {
      if (digitCount === 2) {
        result.results.special.forEach((num) => digits.push(num.slice(-2)))
      } else if (digitCount === 3) {
        result.results.special.forEach((num) => digits.push(num.slice(-3)))
      }
    }
  } else if (
    betTypeAlias === 'xc' ||
    betTypeAlias === 'x' ||
    betTypeAlias === 'three digits'
  ) {
    // Xỉu chủ - lấy giải 7 và đặc biệt cho miền Nam/Trung, giải 6 và đặc biệt cho miền Bắc
    if (region === 'north') {
      // Miền Bắc - giải 6 và đặc biệt
      if (result.results.sixth) {
        result.results.sixth.forEach((num) => digits.push(num.slice(-3)))
      }
      if (result.results.special) {
        result.results.special.forEach((num) => digits.push(num.slice(-3)))
      }
    } else {
      // Miền Nam/Trung - giải 7 và đặc biệt
      if (result.results.seventh) {
        result.results.seventh.forEach((num) => digits.push(num.slice(-3)))
      }
      if (result.results.special) {
        result.results.special.forEach((num) => digits.push(num.slice(-3)))
      }
    }
  } else if (
    betTypeAlias === 'b' ||
    betTypeAlias === 'bao' ||
    betTypeAlias === 'baolo' ||
    betTypeAlias === 'cover all'
  ) {
    // Bao lô - lấy tất cả các giải
    const allResults = { ...result.results }

    // Kiểm tra nếu là 3 chữ số, loại bỏ giải 8 với miền Nam/Trung hoặc giải 7 với miền Bắc
    if (digitCount === 3) {
      if (region !== 'north') {
        delete allResults.eighth
      } else {
        delete allResults.seventh
      }
    }
    // Kiểm tra nếu là 4 chữ số, loại bỏ giải 8, 7 với miền Nam/Trung hoặc giải 7, 6 với miền Bắc
    else if (digitCount === 4) {
      if (region !== 'north') {
        delete allResults.eighth
        delete allResults.seventh
      } else {
        delete allResults.seventh
        delete allResults.sixth
      }
    }

    // Trích xuất tất cả các số từ các giải còn lại
    for (const prize in allResults) {
      if (Array.isArray(allResults[prize])) {
        allResults[prize].forEach((num) => {
          if (digitCount === 2) {
            digits.push(num.slice(-2))
          } else if (digitCount === 3) {
            digits.push(num.slice(-3))
          } else if (digitCount === 4) {
            digits.push(num.slice(-4))
          }
        })
      }
    }
  } else if (betTypeAlias === 'b7l' || betTypeAlias === 'baobay') {
    // Bao lô 7 - Giải 8, 7, 6, 5 và đặc biệt (Miền Nam/Trung)
    if (region !== 'north') {
      const prizes = ['eighth', 'seventh', 'sixth', 'fifth', 'special']
      for (const prize of prizes) {
        if (Array.isArray(result.results[prize])) {
          result.results[prize].forEach((num) => {
            digits.push(num.slice(-2))
          })
        }
      }
    }
  } else if (betTypeAlias === 'b8l' || betTypeAlias === 'baotam') {
    // Bao lô 8 - Giải 7, 6 và đặc biệt (Miền Bắc)
    if (region === 'north') {
      const prizes = ['seventh', 'sixth', 'special']
      for (const prize of prizes) {
        if (Array.isArray(result.results[prize])) {
          result.results[prize].forEach((num) => {
            digits.push(num.slice(-2))
          })
        }
      }
    }
  } else if (betTypeAlias === 'nto' || betTypeAlias === 'nhatto') {
    // Nhất to - chỉ lấy giải nhất
    if (result.results.first) {
      result.results.first.forEach((num) => {
        if (digitCount === 2) {
          digits.push(num.slice(-2))
        } else if (digitCount === 3) {
          digits.push(num.slice(-3))
        } else if (digitCount === 4) {
          digits.push(num.slice(-4))
        }
      })
    }
  } else {
    // Mặc định - lấy tất cả 2 chữ số cuối của tất cả các giải
    for (const prize in result.results) {
      if (Array.isArray(result.results[prize])) {
        result.results[prize].forEach((num) => {
          if (digitCount === 2) {
            digits.push(num.slice(-2))
          } else if (digitCount === 3) {
            digits.push(num.slice(-3))
          } else if (digitCount === 4) {
            digits.push(num.slice(-4))
          }
        })
      }
    }
  }

  return [...new Set(digits)] // Loại bỏ trùng lặp
}

export default {
  calculatePotentialPrize,
  calculateActualPrize,
}
