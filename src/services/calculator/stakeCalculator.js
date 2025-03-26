// src/services/calculator/stakeCalculator.js
import { defaultBetTypes } from "@/config/defaults";

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
      error: "Dữ liệu mã cược không hợp lệ",
    };
  }

  try {
    const lines = parsedResult.lines;
    let totalStake = 0;
    const details = [];
    // Lấy hệ số nhân từ userSettings, mặc định là 0.8 nếu không có
    const betMultiplier = userSettings.betMultiplier || 0.8;

    // Xử lý từng dòng trong mã cược
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line.valid || !line.amount || line.amount <= 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          stake: 0,
          valid: false,
          error: "Dòng không hợp lệ hoặc không có số tiền",
        });
        continue;
      }

      // Lấy thông tin về đài
      const stationInfo = getStationInfo(line, userSettings);

      // Lấy thông tin về kiểu cược chính
      const betTypeInfo = getBetTypeInfo(line, userSettings);

      // Lấy số lượng số và tổ hợp
      const numberInfo = getNumberInfo(line, betTypeInfo);

      // Tính tiền đặt cược cho dòng này với kiểu cược chính
      const lineStake = calculateLineStake(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      );

      // Tính tiền cược với hệ số nhân
      const originalStake = lineStake.stake;
      lineStake.stake = originalStake * betMultiplier;
      lineStake.originalStake = originalStake;
      lineStake.betMultiplier = betMultiplier;
      lineStake.formula = `(${lineStake.formula}) × ${betMultiplier}`;

      totalStake += lineStake.stake;

      // Tính tiền cược cho các kiểu cược bổ sung nếu có
      if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
        lineStake.additionalStakes = [];

        for (const additionalBet of line.additionalBetTypes) {
          // Tạo phiên bản sao lưu của dòng để tính riêng
          const tempLine = {
            ...line,
            betType: additionalBet.betType,
            amount: additionalBet.amount,
            numbers: additionalBet.numbers,
          };

          // Lấy thông tin kiểu cược bổ sung
          const additionalBetTypeInfo = getBetTypeInfo(tempLine, userSettings);
          const additionalNumberInfo = getNumberInfo(
            tempLine,
            additionalBetTypeInfo
          );

          // Tính tiền đặt cược cho kiểu cược bổ sung
          const additionalLineStake = calculateLineStake(
            tempLine,
            stationInfo,
            additionalBetTypeInfo,
            additionalNumberInfo
          );

          // Tính tiền cược với hệ số nhân
          const additionalOriginalStake = additionalLineStake.stake;
          additionalLineStake.stake = additionalOriginalStake * betMultiplier;
          additionalLineStake.originalStake = additionalOriginalStake;
          additionalLineStake.betMultiplier = betMultiplier;
          additionalLineStake.formula = `(${additionalLineStake.formula}) × ${betMultiplier}`;
          additionalLineStake.betTypeAlias = additionalBetTypeInfo.alias;

          totalStake += additionalLineStake.stake;
          lineStake.additionalStakes.push(additionalLineStake);
        }
      }

      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...lineStake,
      });
    }

    return {
      success: true,
      totalStake,
      details,
      error: null,
      betMultiplier, // Thêm hệ số nhân vào kết quả
    };
  } catch (error) {
    console.error("Lỗi khi tính tiền cược:", error);
    return {
      success: false,
      totalStake: 0,
      details: [],
      error: error.message || "Lỗi không xác định khi tính tiền cược",
    };
  }
}

/**
 * Lấy thông tin về đài
 * @param {object} line - Dòng mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về đài
 */
function getStationInfo(line, userSettings) {
  const stationMultiplier = userSettings.stationMultiplier || 1;

  if (line.multiStation) {
    // Đài nhiều miền
    return {
      count: line.station.count || 1,
      multiplier: stationMultiplier,
      region: line.station.region,
    };
  } else if (line.station?.stations) {
    // Nhiều đài (vl.ct)
    return {
      count: line.station.stations.length || 1,
      multiplier: stationMultiplier,
      region: line.station.region,
    };
  } else {
    // Đài đơn lẻ
    return {
      count: 1,
      multiplier: stationMultiplier,
      region: line.station?.region,
    };
  }
}

/**
 * Lấy thông tin về kiểu cược
 * @param {object} line - Dòng mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về kiểu cược
 */
function getBetTypeInfo(line, userSettings) {
  const betTypeId = line.betType?.id;
  const betTypeAlias = line.betType?.alias?.toLowerCase();

  // Tìm bet type dựa trên ID hoặc alias
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.name === betTypeId ||
      bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
  );

  if (!defaultBetType) {
    return {
      id: betTypeId,
      name: line.betType?.name || "Unknown",
      alias: betTypeAlias || "",
      payoutRate: 0,
      combined: false,
    };
  }

  // Lấy payoutRate mặc định hoặc từ cài đặt người dùng
  let payoutRate = defaultBetType.payoutRate || 0;
  if (userSettings.payoutRates && userSettings.payoutRates[betTypeId]) {
    payoutRate = userSettings.payoutRates[betTypeId];
  }

  // Xác định số chữ số để lấy tỉ lệ chính xác
  const digitCount = getDigitCount(line);

  // Xử lý payoutRate phức tạp (dạng object)
  if (typeof payoutRate === "object") {
    if (betTypeAlias === "da" || betTypeAlias === "dv") {
      // Kiểu đá (bridge)
      const region = line.station?.region;
      const stationCount = line.multiStation
        ? line.station?.count || 1
        : line.station?.stations?.length || 1;

      // Đặt tỉ lệ theo đúng quy tắc
      if (region === "north") {
        payoutRate = payoutRate.bridgeNorth || 650;
      } else if (stationCount === 2) {
        payoutRate = payoutRate.bridgeTwoStations || 550;
      } else {
        payoutRate = payoutRate.bridgeOneStation || 750;
      }
    } else if (
      betTypeAlias === "xien" ||
      betTypeAlias === "xienmb" ||
      betTypeAlias === "xienmbac"
    ) {
      // Kiểu xiên
      const numberCount = line.numbers?.length || 0;
      if (numberCount === 2) {
        payoutRate = payoutRate.crossTwo || 350;
      } else if (numberCount === 3) {
        payoutRate = payoutRate.crossThree || 1000;
      } else if (numberCount >= 4) {
        payoutRate = payoutRate.crossFour || 3000;
      }
    } else {
      // Các kiểu khác
      if (digitCount === 2) {
        payoutRate =
          payoutRate.twoDigits?.standard ||
          payoutRate.standard ||
          payoutRate["2 digits"] ||
          75;
      } else if (digitCount === 3) {
        payoutRate = payoutRate.threeDigits || payoutRate["3 digits"] || 650;
      } else if (digitCount === 4) {
        payoutRate = payoutRate.fourDigits || payoutRate["4 digits"] || 5500;
      }
    }
  } else {
    // Kiểm tra cụ thể với xỉu chủ (Ba Càng)
    if (betTypeAlias === "xc" || betTypeAlias === "x") {
      if (digitCount === 3) {
        payoutRate = 650; // Đảm bảo tiền đúng cho xỉu chủ
      }
    }

    // Kiểm tra số chữ số cho các kiểu cược khác
    if (digitCount === 3 && payoutRate === 75) {
      payoutRate = 650; // Nếu là số 3 chữ số mà tỉ lệ mặc định là 75, điều chỉnh thành 650
    } else if (digitCount === 4 && payoutRate === 75) {
      payoutRate = 5500; // Nếu là số 4 chữ số, điều chỉnh tỉ lệ thành 5500
    }
  }

  return {
    id: defaultBetType.name,
    name: defaultBetType.name,
    alias: betTypeAlias,
    payoutRate,
    combined: defaultBetType.combined || false,
    specialCalc: defaultBetType.specialCalc || null,
  };
}

/**
 * Lấy số lượng chữ số của số đầu tiên trong dòng
 */
function getDigitCount(line) {
  if (line.numbers && line.numbers.length > 0) {
    const firstNumber = line.numbers[0];
    return firstNumber ? firstNumber.length : 2;
  }
  return 2; // Mặc định là 2 chữ số
}

/**
 * Lấy thông tin về số và tổ hợp
 * @param {object} line - Dòng mã cược
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @returns {object} Thông tin về số và tổ hợp
 */
function getNumberInfo(line, betTypeInfo) {
  const numbers = line.numbers || [];
  const betTypeAlias = betTypeInfo.alias?.toLowerCase();
  const digitCount = getDigitCount(line);

  // Kiểm tra loại cược
  const isBridge =
    betTypeAlias === "da" ||
    betTypeAlias === "dv" ||
    betTypeInfo.specialCalc === "bridge";
  const isPermutation =
    betTypeAlias === "dao" ||
    betTypeAlias === "xcd" ||
    betTypeAlias === "daob" ||
    betTypeAlias === "bdao" ||
    betTypeAlias === "daoxc" ||
    betTypeAlias === "dxc" ||
    betTypeAlias === "daodau" ||
    betTypeAlias === "ddau" ||
    betTypeAlias === "daoduoi" ||
    betTypeAlias === "daodui" ||
    betTypeAlias === "dduoi" ||
    betTypeAlias === "ddui" ||
    betTypeAlias === "dxcdau" ||
    betTypeAlias === "dxcduoi" ||
    betTypeAlias === "baobaydao" ||
    betTypeAlias === "b7ld" ||
    betTypeAlias === "b7ldao" ||
    betTypeAlias === "baotamdao" ||
    betTypeAlias === "b8ld" ||
    betTypeAlias === "b8ldao";

  // Tìm thông tin bet type từ defaults
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.name === betTypeInfo.id ||
      bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
  );

  // Lấy số lượng tổ hợp dựa trên miền và bet type
  let combinationCount = 1;
  if (defaultBetType && defaultBetType.combinations) {
    const region = line.station?.region || "south";

    if (typeof defaultBetType.combinations === "object") {
      // Kiểm tra nếu có nested structure cho số chữ số
      if (
        typeof defaultBetType.combinations[`${digitCount} digits`] === "object"
      ) {
        combinationCount =
          defaultBetType.combinations[`${digitCount} digits`][region] || 1;
      }
      // Kiểm tra nếu có direct mapping cho region
      else if (typeof defaultBetType.combinations[region] === "number") {
        combinationCount = defaultBetType.combinations[region];
      }
      // Kiểm tra nếu có direct mapping cho số chữ số
      else if (
        typeof defaultBetType.combinations[`${digitCount} digits`] === "number"
      ) {
        combinationCount = defaultBetType.combinations[`${digitCount} digits`];
      }
    } else if (typeof defaultBetType.combinations === "number") {
      combinationCount = defaultBetType.combinations;
    }
  }

  // Xử lý các trường hợp đặc biệt
  if (
    betTypeAlias === "b" ||
    betTypeAlias === "bao" ||
    betTypeAlias === "baolo"
  ) {
    // Kiểu bao lô
    const region = line.station?.region || "south";

    if (digitCount === 2) {
      if (region === "north") {
        combinationCount = 27;
      } else {
        combinationCount = 18;
      }
    } else if (digitCount === 3) {
      if (region === "north") {
        combinationCount = 23;
      } else {
        combinationCount = 17;
      }
    } else if (digitCount === 4) {
      if (region === "north") {
        combinationCount = 20;
      } else {
        combinationCount = 16;
      }
    }
  } else if (betTypeAlias === "b7l" || betTypeAlias === "baobay") {
    // Bao lô 7
    combinationCount = 7;
  } else if (betTypeAlias === "b8l" || betTypeAlias === "baotam") {
    // Bao lô 8
    combinationCount = 8;
  } else if (
    betTypeAlias === "nt" ||
    betTypeAlias === "nto" ||
    betTypeAlias === "nhatto"
  ) {
    // Nhất to
    combinationCount = 1;
  }

  return {
    count: numbers.length,
    combinationCount,
    isBridge,
    isPermutation,
    digitCount,
  };
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
  const betAmount = line.amount || 0;
  const betTypeAlias = betTypeInfo.alias?.toLowerCase();

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge || betTypeInfo.specialCalc === "bridge") {
    // Tính bridge factor: C(n,2) = n*(n-1)/2
    const n = numberInfo.count;
    const bridgeFactor = n < 2 ? 0 : (n * (n - 1)) / 2;

    // Tính stake cho kiểu đá (chú ý không nhân với combinationCount)
    const stake =
      stationInfo.count * bridgeFactor * betAmount * stationInfo.multiplier;

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      betFactor: bridgeFactor,
      combinationCount: numberInfo.combinationCount,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${bridgeFactor} × ${betAmount} × ${stationInfo.multiplier}`,
      betTypeAlias: betTypeAlias,
    };
  }
  // Kiểm tra nếu là kiểu đảo (permutation)
  else if (numberInfo.isPermutation) {
    // Tổng số hoán vị của tất cả số
    let totalPermutations = 0;

    for (const number of line.numbers || []) {
      totalPermutations += calculatePermutationCount(number);
    }

    // Tính stake cho kiểu đảo
    const stake =
      stationInfo.count *
      totalPermutations *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier;

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
    };
  }
  // Kiểu xiên
  else if (
    betTypeAlias === "xien" ||
    betTypeAlias === "xienmb" ||
    betTypeAlias === "xienmbac"
  ) {
    // Với xiên miền bắc, chỉ tính một lần số tiền cược, không nhân với số lượng số
    const stake = stationInfo.count * betAmount * stationInfo.multiplier;

    return {
      stake,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      betAmount,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${betAmount} × ${stationInfo.multiplier}`,
      betTypeAlias: betTypeAlias,
    };
  }
  // Trường hợp thông thường
  else {
    const stake =
      stationInfo.count *
      numberInfo.count *
      numberInfo.combinationCount *
      betAmount *
      stationInfo.multiplier;

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
    };
  }
}

/**
 * Tính số lượng hoán vị của một số (không tính trùng lặp)
 * @param {string} number - Số cần tính hoán vị
 * @returns {number} Số lượng hoán vị
 */
function calculatePermutationCount(number) {
  if (!number) return 1;

  // Đếm số lượng mỗi chữ số
  const digitCounts = {};
  for (let i = 0; i < number.length; i++) {
    const digit = number[i];
    digitCounts[digit] = (digitCounts[digit] || 0) + 1;
  }

  // Tính giai thừa của độ dài số
  let factorial = 1;
  for (let i = 2; i <= number.length; i++) {
    factorial *= i;
  }

  // Chia cho giai thừa của số lần xuất hiện của mỗi chữ số
  for (const digit in digitCounts) {
    let digitFactorial = 1;
    for (let i = 2; i <= digitCounts[digit]; i++) {
      digitFactorial *= i;
    }
    factorial /= digitFactorial;
  }

  return factorial;
}

/**
 * Hàm tối ưu để tính tiền cược nhanh
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {number} Tổng tiền cược
 */
export function quickCalculateStake(parsedResult, userSettings = {}) {
  if (!parsedResult || !parsedResult.success || !parsedResult.lines) return 0;

  const betMultiplier = userSettings.betMultiplier || 0.8;
  let totalStake = 0;

  // Duyệt qua từng dòng
  parsedResult.lines.forEach((line) => {
    if (line.valid && line.amount > 0) {
      // Lấy thông tin
      const stationInfo = getStationInfo(line, userSettings);
      const betTypeInfo = getBetTypeInfo(line, userSettings);
      const numberInfo = getNumberInfo(line, betTypeInfo);

      // Tính stake cho dòng
      const lineStake = calculateLineStake(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      );

      // Áp dụng hệ số nhân của người dùng
      totalStake += lineStake.stake * betMultiplier;

      // Tính tiền cược cho các kiểu cược bổ sung nếu có
      if (line.additionalBetTypes && line.additionalBetTypes.length > 0) {
        for (const additionalBet of line.additionalBetTypes) {
          // Tạo phiên bản sao lưu của dòng để tính riêng
          const tempLine = {
            ...line,
            betType: additionalBet.betType,
            amount: additionalBet.amount,
            numbers: additionalBet.numbers,
          };

          // Lấy thông tin kiểu cược bổ sung
          const additionalBetTypeInfo = getBetTypeInfo(tempLine, userSettings);
          const additionalNumberInfo = getNumberInfo(
            tempLine,
            additionalBetTypeInfo
          );

          // Tính tiền đặt cược cho kiểu cược bổ sung
          const additionalLineStake = calculateLineStake(
            tempLine,
            stationInfo,
            additionalBetTypeInfo,
            additionalNumberInfo
          );

          // Áp dụng hệ số nhân của người dùng
          totalStake += additionalLineStake.stake * betMultiplier;
        }
      }
    }
  });

  return totalStake;
}

export default {
  calculateStake,
  quickCalculateStake,
};
