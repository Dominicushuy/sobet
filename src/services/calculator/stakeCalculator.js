// src/services/calculator/stakeCalculator.js
import { defaultBetTypes } from '@/config/defaults'
import { calculatePermutationCount } from '@/utils/permutationUtils'

/**
 * Lấy thông tin về đài
 * @param {object} station - Thông tin đài
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về đài
 */
function getStationInfo(station, userSettings) {
  const stationMultiplier = userSettings.stationMultiplier || 1

  if (station.multiStation) {
    // Đài nhiều miền
    return {
      count: station.count || 1,
      multiplier: stationMultiplier,
      region: station.region,
    }
  } else if (station.stations) {
    // Nhiều đài (vl.ct)
    return {
      count: station.stations.length || 1,
      multiplier: stationMultiplier,
      region: station.region,
    }
  } else {
    // Đài đơn lẻ
    return {
      count: 1,
      multiplier: stationMultiplier,
      region: station.region,
    }
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
 * @param {object} station - Thông tin đài từ parsedResult
 * @returns {object} Thông tin về số và tổ hợp
 */

function getNumberInfo(line, betTypeInfo, station) {
  const numbers = line.numbers || []
  const betTypeAlias = betTypeInfo.alias?.toLowerCase()
  const digitCount = getDigitCount(line)
  const region = station.region || 'south'

  // ENHANCED: Early validation for bridge bet types which only accept 2-digit numbers
  if (
    (betTypeAlias === 'da' ||
      betTypeAlias === 'dv' ||
      betTypeInfo.specialCalc === 'bridge') &&
    digitCount !== 2
  ) {
    return {
      count: numbers.length,
      combinationCount: 0,
      isBridge: true,
      isPermutation: false,
      digitCount,
      error: `Kiểu cược ${betTypeAlias} chỉ chấp nhận số 2 chữ số, không hỗ trợ số ${digitCount} chữ số`,
    }
  }

  // Kiểm tra loại cược
  const isBridge =
    betTypeAlias === 'da' ||
    betTypeAlias === 'dv' ||
    betTypeInfo.specialCalc === 'bridge'
  const isPermutation =
    betTypeAlias === 'dao' ||
    betTypeAlias === 'xcd' ||
    betTypeAlias === 'daob' ||
    betTypeAlias === 'bdao' ||
    betTypeAlias === 'daoxc' ||
    betTypeAlias === 'dxc' ||
    betTypeAlias === 'daodau' ||
    betTypeAlias === 'ddau' ||
    betTypeAlias === 'daoduoi' ||
    betTypeAlias === 'daodui' ||
    betTypeAlias === 'dduoi' ||
    betTypeAlias === 'ddui' ||
    betTypeAlias === 'dxcdau' ||
    betTypeAlias === 'dxcduoi' ||
    betTypeAlias === 'baobaydao' ||
    betTypeAlias === 'b7ld' ||
    betTypeAlias === 'b7ldao' ||
    betTypeAlias === 'baotamdao' ||
    betTypeAlias === 'b8ld' ||
    betTypeAlias === 'b8ldao'

  // Khởi tạo combinationCount
  let combinationCount = 1

  // Xử lý các trường hợp đặc biệt trước
  if (
    betTypeAlias === 'dd' ||
    betTypeAlias === 'dau duoi' ||
    betTypeAlias === 'đầu đuôi' ||
    betTypeAlias === 'head and tail'
  ) {
    // Đầu đuôi - kiểm tra miền
    if (region === 'north') {
      combinationCount = 5 // 4 lô ở giải bảy (đầu) và 1 lô ở giải đặc biệt (đuôi)
    } else {
      combinationCount = 2 // 1 lô ở giải tám (đầu) và 1 lô ở giải đặc biệt (đuôi)
    }
  } else if (
    betTypeAlias === 'b' ||
    betTypeAlias === 'bao' ||
    betTypeAlias === 'baolo'
  ) {
    // Kiểu bao lô
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
  } else if (
    betTypeAlias === 'nt' ||
    betTypeAlias === 'nto' ||
    betTypeAlias === 'nhatto'
  ) {
    // Nhất to
    combinationCount = 1
  } else {
    // Tìm thông tin bet type từ defaults
    const defaultBetType = defaultBetTypes.find(
      (bt) =>
        bt.name === betTypeInfo.id ||
        bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
    )

    // Lấy số lượng tổ hợp dựa trên miền và bet type
    if (defaultBetType && defaultBetType.combinations) {
      if (typeof defaultBetType.combinations === 'object') {
        // Kiểm tra nếu có direct mapping cho region
        if (typeof defaultBetType.combinations[region] === 'number') {
          combinationCount = defaultBetType.combinations[region]
        }
        // Kiểm tra nếu có nested structure cho số chữ số
        else if (
          typeof defaultBetType.combinations[`${digitCount} digits`] ===
          'object'
        ) {
          combinationCount =
            defaultBetType.combinations[`${digitCount} digits`][region] || 1
        }
        // Kiểm tra nếu có direct mapping cho số chữ số
        else if (
          typeof defaultBetType.combinations[`${digitCount} digits`] ===
          'number'
        ) {
          combinationCount = defaultBetType.combinations[`${digitCount} digits`]
        }
      } else if (typeof defaultBetType.combinations === 'number') {
        combinationCount = defaultBetType.combinations
      }
    }
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
 * Hàm tối ưu để tính tiền cược nhanh
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {number} Tổng tiền cược
 */
export function quickCalculateStake(parsedResult, userSettings = {}) {
  if (!parsedResult || !parsedResult.success || !parsedResult.lines) return 0

  const betMultiplier = userSettings.betMultiplier || 0.8
  let totalStake = 0

  // Duyệt qua từng dòng
  parsedResult.lines.forEach((line) => {
    if (line.valid && line.amount > 0) {
      // Lấy thông tin
      const stationInfo = getStationInfo(parsedResult.station, userSettings)
      const betTypeInfo = getBetTypeInfo(line, stationInfo, userSettings)
      const numberInfo = getNumberInfo(line, betTypeInfo, parsedResult.station)

      // Tính stake cho dòng
      const lineStake = calculateLineStake(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      )

      // Áp dụng hệ số nhân của người dùng
      totalStake += lineStake.stake * betMultiplier

      // Tính tiền cược cho các kiểu cược bổ sung nếu có
      if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
        for (const additionalBet of line.additionalBetTypes) {
          // Tạo phiên bản sao lưu của dòng để tính riêng
          const tempLine = {
            ...line,
            betType: additionalBet.betType,
            amount: additionalBet.amount,
            numbers: additionalBet.numbers || line.numbers,
          }

          // Lấy thông tin kiểu cược bổ sung
          const additionalBetTypeInfo = getBetTypeInfo(
            tempLine,
            stationInfo,
            userSettings
          )
          const additionalNumberInfo = getNumberInfo(
            tempLine,
            additionalBetTypeInfo,
            parsedResult.station
          )

          // Tính tiền đặt cược cho kiểu cược bổ sung
          const additionalLineStake = calculateLineStake(
            tempLine,
            stationInfo,
            additionalBetTypeInfo,
            additionalNumberInfo
          )

          // Áp dụng hệ số nhân của người dùng
          totalStake += additionalLineStake.stake * betMultiplier
        }
      }
    }
  })

  return totalStake
}

/**
 * Lấy thông tin về kiểu cược
 * @param {object} line - Dòng mã cược
 * @param {object} stationInfo - Thông tin về đài
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về kiểu cược
 */
function getBetTypeInfo(line, stationInfo, userSettings) {
  const betTypeId = line.betType?.id
  const betTypeAlias = line.betType?.alias?.toLowerCase()

  // Tìm bet type dựa trên ID hoặc alias
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.name === betTypeId ||
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

  // Xác định số chữ số để lấy tỉ lệ chính xác
  const digitCount = getDigitCount(line)

  // Add validation against bet type rules
  if (defaultBetType && defaultBetType.betRule) {
    const allowedDigitRules = defaultBetType.betRule
    const isAllowed = allowedDigitRules.some(
      (rule) => rule === `${digitCount} digits`
    )

    if (!isAllowed) {
      return {
        id: betTypeId,
        name: defaultBetType.name || 'Unknown',
        alias: betTypeAlias || '',
        payoutRate: 0,
        combined: false,
        error: `Kiểu cược ${betTypeAlias} chỉ chấp nhận ${allowedDigitRules.join(
          ', '
        )}, không hỗ trợ số ${digitCount} chữ số`,
      }
    }
  }

  // Lấy payoutRate mặc định hoặc từ cài đặt người dùng
  let payoutRate = defaultBetType.payoutRate || 0
  if (userSettings.payoutRates && userSettings.payoutRates[betTypeId]) {
    payoutRate = userSettings.payoutRates[betTypeId]
  }

  // Xử lý payoutRate phức tạp (dạng object)
  if (typeof payoutRate === 'object') {
    if (betTypeAlias === 'da' || betTypeAlias === 'dv') {
      // Kiểu đá (bridge)
      const region = stationInfo.region
      const stationCount = stationInfo.count || 1

      // Đặt tỉ lệ theo đúng quy tắc
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
  } else {
    // Kiểm tra cụ thể với xỉu chủ (Ba Càng)
    if (betTypeAlias === 'xc' || betTypeAlias === 'x') {
      if (digitCount === 3) {
        payoutRate = 650 // Đảm bảo tiền đúng cho xỉu chủ
      }
    }

    // Kiểm tra số chữ số cho các kiểu cược khác
    if (digitCount === 3 && payoutRate === 75) {
      payoutRate = 650 // Nếu là số 3 chữ số mà tỉ lệ mặc định là 75, điều chỉnh thành 650
    } else if (digitCount === 4 && payoutRate === 75) {
      payoutRate = 5500 // Nếu là số 4 chữ số, điều chỉnh tỉ lệ thành 5500
    }
  }

  return {
    id: defaultBetType.name,
    name: defaultBetType.name,
    alias: betTypeAlias,
    payoutRate,
    combined: defaultBetType.combined || false,
    specialCalc: defaultBetType.specialCalc || null,
  }
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
  // Check for errors in bet type info
  if (betTypeInfo.error) {
    return {
      stake: 0,
      valid: false,
      error: betTypeInfo.error,
    }
  }

  if (numberInfo.error) {
    return {
      stake: 0,
      valid: false,
      error: numberInfo.error,
    }
  }

  const betAmount = line.amount || 0
  const betTypeAlias = betTypeInfo.alias?.toLowerCase()

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge || betTypeInfo.specialCalc === 'bridge') {
    // For da bet type, we need at least 2 numbers to create pairs
    if (numberInfo.count < 2) {
      return {
        stake: 0,
        valid: false,
        error: 'Kiểu đá (da) cần ít nhất 2 số',
      }
    }

    // Tính bridge factor: C(n,2) = n*(n-1)/2
    const n = numberInfo.count
    const bridgeFactor = (n * (n - 1)) / 2

    // Kiểu đá luôn sử dụng hệ số nhân 2
    const daMultiplier =
      betTypeAlias === 'da' || betTypeAlias === 'dv'
        ? 2
        : stationInfo.multiplier

    // Tính stake cho kiểu đá (nhân với combinationCount)
    const stake =
      stationInfo.count *
      bridgeFactor *
      betAmount *
      daMultiplier *
      numberInfo.combinationCount

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      betFactor: bridgeFactor,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: daMultiplier,
      formula: `${stationInfo.count} × ${bridgeFactor} × ${betAmount} × ${daMultiplier} × ${numberInfo.combinationCount}`,
      betTypeAlias: betTypeAlias,
    }
  }
  // Kiểm tra nếu là kiểu đảo (permutation)
  else if (numberInfo.isPermutation) {
    // Tổng số hoán vị của tất cả số
    let totalPermutations = 0

    for (const number of line.numbers || []) {
      totalPermutations += calculatePermutationCount(number)
    }

    // Tính stake cho kiểu đảo
    const stake =
      stationInfo.count *
      totalPermutations *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      permutationCount: totalPermutations,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${totalPermutations} × ${numberInfo.combinationCount} × ${betAmount} × ${stationInfo.multiplier}`,
      betTypeAlias: betTypeAlias,
    }
  } else {
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
      betTypeAlias: betTypeAlias,
    }
  }
}

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
    const station = parsedResult.station // Lấy station từ cấp cao hơn
    let totalStake = 0
    const details = []
    // Lấy hệ số nhân từ userSettings, mặc định là 0.8 nếu không có
    const betMultiplier = userSettings.betMultiplier || 0.8
    let hasValidLine = false

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

      // Truyền station từ parsedResult
      const stationInfo = getStationInfo(station, userSettings)

      // Lấy thông tin về kiểu cược chính
      const betTypeInfo = getBetTypeInfo(line, stationInfo, userSettings)

      // Lấy số lượng số và tổ hợp
      const numberInfo = getNumberInfo(line, betTypeInfo, station) // Truyền station

      // Tính tiền đặt cược cho dòng này với kiểu cược chính
      const lineStake = calculateLineStake(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      )

      if (!lineStake.valid && lineStake.error) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          stake: 0,
          valid: false,
          error: lineStake.error,
        })
        continue
      }

      hasValidLine = true

      // Tính tiền cược với hệ số nhân
      const originalStake = lineStake.stake
      lineStake.stake = originalStake * betMultiplier
      lineStake.originalStake = originalStake
      lineStake.betMultiplier = betMultiplier
      lineStake.formula = `(${lineStake.formula}) × ${betMultiplier}`

      totalStake += lineStake.stake

      // Tính tiền cược cho các kiểu cược bổ sung nếu có
      if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
        lineStake.additionalStakes = []

        for (const additionalBet of line.additionalBetTypes) {
          // Tạo phiên bản sao lưu của dòng để tính riêng
          const tempLine = {
            ...line,
            betType: additionalBet.betType,
            amount: additionalBet.amount,
            numbers: additionalBet.numbers || line.numbers,
          }

          // Lấy thông tin kiểu cược bổ sung
          const additionalBetTypeInfo = getBetTypeInfo(
            tempLine,
            stationInfo,
            userSettings
          )
          const additionalNumberInfo = getNumberInfo(
            tempLine,
            additionalBetTypeInfo,
            station
          ) // Truyền station

          // Tính tiền đặt cược cho kiểu cược bổ sung
          const additionalLineStake = calculateLineStake(
            tempLine,
            stationInfo,
            additionalBetTypeInfo,
            additionalNumberInfo
          )

          if (!additionalLineStake.valid && additionalLineStake.error) {
            details.push({
              lineIndex: i,
              additionalBetType: additionalBet.betType?.alias,
              originalLine: line.originalLine,
              stake: 0,
              valid: false,
              error: additionalLineStake.error,
            })
            continue
          }

          // Tính tiền cược với hệ số nhân
          const additionalOriginalStake = additionalLineStake.stake
          additionalLineStake.stake = additionalOriginalStake * betMultiplier
          additionalLineStake.originalStake = additionalOriginalStake
          additionalLineStake.betMultiplier = betMultiplier
          additionalLineStake.formula = `(${additionalLineStake.formula}) × ${betMultiplier}`
          additionalLineStake.betTypeAlias = additionalBetTypeInfo.alias

          totalStake += additionalLineStake.stake
          lineStake.additionalStakes.push(additionalLineStake)
        }
      }

      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...lineStake,
      })
    }

    return {
      success: hasValidLine,
      totalStake,
      details,
      error: hasValidLine ? null : 'Có lỗi trong quá trình tính tiền cược',
      betMultiplier,
      hasErrors: details.some((d) => !d.valid),
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

export default {
  calculateStake,
  quickCalculateStake,
}
