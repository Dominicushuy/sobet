// src/services/calculator/prizeCalculator.js
import { defaultBetTypes } from "@/config/defaults";

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
      error: "Dữ liệu mã cược không hợp lệ",
    };
  }

  try {
    const lines = parsedResult.lines;
    const station = parsedResult.station; // Lấy station từ cấp cao hơn
    let totalPotential = 0;
    const details = [];

    // Xử lý từng dòng trong mã cược
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line.valid || !line.amount || line.amount <= 0) {
        details.push({
          lineIndex: i,
          originalLine: line.originalLine,
          potentialPrize: 0,
          valid: false,
          error: "Dòng không hợp lệ hoặc không có số tiền",
        });
        continue;
      }

      // Lấy thông tin về đài từ parsedResult
      const stationInfo = getStationInfo(station, userSettings);

      // Lấy thông tin về kiểu cược
      const betTypeInfo = getBetTypeInfo(line, stationInfo, userSettings);

      // Lấy số lượng số và tổ hợp - truyền station
      const numberInfo = getNumberInfo(line, betTypeInfo, station);

      // Tính tiềm năng thắng cược cho dòng này
      const linePotential = calculateLinePotential(
        line,
        stationInfo,
        betTypeInfo,
        numberInfo
      );

      totalPotential += linePotential.potentialPrize;
      details.push({
        lineIndex: i,
        originalLine: line.originalLine,
        ...linePotential,
        betTypeAlias: betTypeInfo.alias,
      });
    }

    return {
      success: true,
      totalPotential,
      details,
      error: null,
    };
  } catch (error) {
    console.error("Lỗi khi tính tiềm năng thắng cược:", error);
    return {
      success: false,
      totalPotential: 0,
      details: [],
      error:
        error.message || "Lỗi không xác định khi tính tiềm năng thắng cược",
    };
  }
}

/**
 * Lấy thông tin về đài
 * @param {object} station - Thông tin đài từ parsedResult
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về đài
 */
function getStationInfo(station, userSettings) {
  const stationMultiplier = userSettings.stationMultiplier || 1;

  if (station.multiStation) {
    // Đài nhiều miền
    return {
      count: station.count || 1,
      multiplier: stationMultiplier,
      region: station.region,
    };
  } else if (station.stations) {
    // Nhiều đài (vl.ct)
    return {
      count: station.stations.length || 1,
      multiplier: stationMultiplier,
      region: station.region,
    };
  } else {
    // Đài đơn lẻ
    return {
      count: 1,
      multiplier: stationMultiplier,
      region: station.region,
    };
  }
}

/**
 * Lấy thông tin về kiểu cược
 * @param {object} line - Dòng mã cược
 * @param {object} stationInfo - Thông tin về đài
 * @param {object} userSettings - Cài đặt người dùng
 * @returns {object} Thông tin về kiểu cược
 */
function getBetTypeInfo(line, stationInfo, userSettings) {
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

  // Lấy payoutRate mặc định
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
      const region = stationInfo.region;
      const stationCount = stationInfo.count || 1;

      // Đặt tỉ lệ theo đúng quy tắc
      if (region === "north") {
        payoutRate = payoutRate.bridgeNorth || 650;
      } else if (stationCount === 2) {
        payoutRate = payoutRate.bridgeTwoStations || 550;
      } else {
        payoutRate = payoutRate.bridgeOneStation || 750;
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
      payoutRate = 650; // Ghi đè đảm bảo giá trị đúng
    }

    // Kiểm tra số chữ số cho các loại cược khác
    if (digitCount === 3 && payoutRate === 75) {
      payoutRate = 650; // Nếu là số 3 chữ số mà tỉ lệ là 75, sửa thành 650
    } else if (digitCount === 4 && payoutRate === 75) {
      payoutRate = 5500; // Nếu là số 4 chữ số, tỉ lệ là 5500
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
 * @param {object} station - Thông tin đài từ parsedResult
 * @returns {object} Thông tin về số và tổ hợp
 */
function getNumberInfo(line, betTypeInfo, station) {
  const numbers = line.numbers || [];
  const betTypeAlias = betTypeInfo.alias?.toLowerCase();
  const digitCount = getDigitCount(line);
  const region = station.region || "south";

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

  // Khởi tạo combinationCount
  let combinationCount = 1;

  // Xử lý các trường hợp đặc biệt trước
  if (
    betTypeAlias === "dd" ||
    betTypeAlias === "dau duoi" ||
    betTypeAlias === "đầu đuôi" ||
    betTypeAlias === "head and tail"
  ) {
    // Đầu đuôi - kiểm tra miền
    if (region === "north") {
      combinationCount = 5; // 4 lô ở giải bảy (đầu) và 1 lô ở giải đặc biệt (đuôi)
    } else {
      combinationCount = 2; // 1 lô ở giải tám (đầu) và 1 lô ở giải đặc biệt (đuôi)
    }
  } else if (
    betTypeAlias === "b" ||
    betTypeAlias === "bao" ||
    betTypeAlias === "baolo"
  ) {
    // Kiểu bao lô
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
  } else {
    // Tìm thông tin bet type từ defaults
    const defaultBetType = defaultBetTypes.find(
      (bt) =>
        bt.name === betTypeInfo.id ||
        bt.aliases.some((a) => a.toLowerCase() === betTypeAlias)
    );

    // Lấy số lượng tổ hợp dựa trên miền và bet type
    if (defaultBetType && defaultBetType.combinations) {
      if (typeof defaultBetType.combinations === "object") {
        // Kiểm tra nếu có direct mapping cho region
        if (typeof defaultBetType.combinations[region] === "number") {
          combinationCount = defaultBetType.combinations[region];
        }
        // Kiểm tra nếu có nested structure cho số chữ số
        else if (
          typeof defaultBetType.combinations[`${digitCount} digits`] ===
          "object"
        ) {
          combinationCount =
            defaultBetType.combinations[`${digitCount} digits`][region] || 1;
        }
        // Kiểm tra nếu có direct mapping cho số chữ số
        else if (
          typeof defaultBetType.combinations[`${digitCount} digits`] ===
          "number"
        ) {
          combinationCount =
            defaultBetType.combinations[`${digitCount} digits`];
        }
      } else if (typeof defaultBetType.combinations === "number") {
        combinationCount = defaultBetType.combinations;
      }
    }
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
 * Tính tiềm năng thắng cược cho một dòng
 * @param {object} line - Dòng mã cược
 * @param {object} stationInfo - Thông tin về đài
 * @param {object} betTypeInfo - Thông tin về kiểu cược
 * @param {object} numberInfo - Thông tin về số và tổ hợp
 * @returns {object} Kết quả tính tiềm năng thắng cược
 */
function calculateLinePotential(line, stationInfo, betTypeInfo, numberInfo) {
  const betAmount = line.amount || 0;
  const payoutRate = betTypeInfo.payoutRate || 0;
  const betTypeAlias = betTypeInfo.alias?.toLowerCase();

  // Kiểm tra nếu là kiểu đá (bridge)
  if (numberInfo.isBridge) {
    // Tính số cặp tối đa
    const n = numberInfo.count;
    const maxPairs = (n * (n - 1)) / 2; // C(n,2) = số cặp tối đa

    // Tính tiềm năng thắng (không nhân với combinationCount)
    const potentialPrize =
      stationInfo.count * maxPairs * betAmount * payoutRate;

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      betPairs: maxPairs,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${maxPairs} × ${betAmount} × ${payoutRate}`,
    };
  }
  // Kiểm tra nếu là kiểu đảo (permutation)
  else if (numberInfo.isPermutation) {
    // Số lượng hoán vị của các số
    const numbers = line.numbers || [];
    let totalPermutations = 0;

    for (const number of numbers) {
      totalPermutations += calculatePermutationCount(number);
    }

    // Tính tiềm năng thắng (nhân với combinationCount)
    const potentialPrize =
      stationInfo.count * totalPermutations * betAmount * payoutRate;

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      permutationCount: totalPermutations,
      numberCount: numbers.length,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${totalPermutations} × ${betAmount} × ${payoutRate}`,
    };
  } else {
    // Tính tiềm năng thắng
    const potentialPrize =
      stationInfo.count * numberInfo.count * betAmount * payoutRate;

    return {
      potentialPrize,
      valid: true,
      stationCount: stationInfo.count,
      numberCount: numberInfo.count,
      betAmount,
      payoutRate,
      multiplier: stationInfo.multiplier,
      formula: `${stationInfo.count} × ${numberInfo.count} × ${betAmount} × ${payoutRate}`,
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

export default {
  calculatePotentialPrize,
};
