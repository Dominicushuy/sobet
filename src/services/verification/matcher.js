// src/services/verification/matcher.js
import { defaultBetTypes } from "@/config/defaults";

/**
 * Kiểm tra các số cược trùng với kết quả xổ số
 * @param {object} betCode - Thông tin mã cược đã phân tích
 * @param {array} lotteryResults - Danh sách kết quả xổ số
 * @returns {object} Kết quả kiểm tra
 */
export function matchBetCodeWithResults(betCode, lotteryResults) {
  if (
    !betCode ||
    !betCode.parsedContent ||
    !lotteryResults ||
    !Array.isArray(lotteryResults)
  ) {
    return {
      success: false,
      error: "Dữ liệu đầu vào không hợp lệ",
      matches: [],
      totalWinAmount: 0,
    };
  }

  try {
    const matches = [];
    let totalWinAmount = 0;

    // Xử lý từng dòng trong mã cược
    for (const line of betCode.parsedContent) {
      if (!line.valid) continue;

      // Tìm kết quả xổ số tương ứng với đài
      const matchingResults = findMatchingLotteryResults(line, lotteryResults);

      if (!matchingResults || matchingResults.length === 0) {
        // Không tìm thấy kết quả xổ số tương ứng
        matches.push({
          line,
          matched: false,
          error: "Không tìm thấy kết quả xổ số tương ứng",
          matchingResults: [],
          matchedNumbers: [],
          winAmount: 0,
        });
        continue;
      }

      // Kiểm tra từng số cược với kết quả xổ số
      const lineMatches = matchLineWithResults(line, matchingResults);

      totalWinAmount += lineMatches.winAmount;
      matches.push(lineMatches);
    }

    return {
      success: true,
      matches,
      totalWinAmount,
    };
  } catch (error) {
    console.error("Lỗi khi đối soát mã cược:", error);
    return {
      success: false,
      error: `Lỗi khi đối soát mã cược: ${error.message}`,
      matches: [],
      totalWinAmount: 0,
    };
  }
}

/**
 * Tìm kết quả xổ số tương ứng với đài trong mã cược
 * @param {object} line - Dòng cược
 * @param {array} lotteryResults - Danh sách kết quả xổ số
 * @returns {array} Danh sách kết quả xổ số phù hợp
 */
function findMatchingLotteryResults(line, lotteryResults) {
  if (!line.station) return [];

  // Trường hợp đài đơn lẻ
  if (!line.multiStation && !line.station.stations) {
    return lotteryResults.filter(
      (result) =>
        result.station === line.station.name &&
        result.region === line.station.region
    );
  }

  // Trường hợp nhiều đài cụ thể
  if (line.station.stations) {
    const stationNames = line.station.stations.map((s) => s.name);
    return lotteryResults.filter((result) =>
      stationNames.includes(result.station)
    );
  }

  // Trường hợp nhiều đài của một miền
  if (line.multiStation) {
    const results = lotteryResults.filter(
      (result) => result.region === line.station.region
    );

    // Giới hạn số lượng đài nếu cần
    if (line.station.count && line.station.count < results.length) {
      return results.slice(0, line.station.count);
    }

    return results;
  }

  return [];
}

/**
 * Kiểm tra một dòng cược với kết quả xổ số
 * @param {object} line - Dòng cược
 * @param {array} lotteryResults - Kết quả xổ số phù hợp
 * @returns {object} Kết quả kiểm tra
 */
function matchLineWithResults(line, lotteryResults) {
  // Lấy thông tin kiểu cược
  const betTypeName = line.betType
    ? line.betType.id || line.betType.name
    : null;
  const betTypeAlias = line.betType ? line.betType.alias : null;

  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betTypeName || bt.aliases.includes(betTypeAlias)
  );

  if (!betTypeInfo) {
    return {
      line,
      matched: false,
      error: "Không tìm thấy thông tin kiểu cược",
      matchingResults: lotteryResults,
      matchedNumbers: [],
      winAmount: 0,
    };
  }

  // Kiểm tra từng số cược với các kết quả xổ số
  const matchedNumbers = [];
  let winAmount = 0;

  // Trường hợp đặc biệt cho kiểu cược "đá"
  if (
    betTypeAlias === "da" ||
    betTypeAlias === "dv" ||
    betTypeInfo.specialCalc === "bridge"
  ) {
    const bridgeResult = matchBridgeBet(line, lotteryResults, betTypeInfo);

    return {
      line,
      matched: bridgeResult.matched,
      matchingResults: lotteryResults,
      matchedNumbers: bridgeResult.matchedNumbers,
      matchedPairs: bridgeResult.matchedPairs,
      winFactor: bridgeResult.winFactor,
      bonusFactor: bridgeResult.bonusFactor,
      baseWinAmount: bridgeResult.baseWinAmount,
      bonusPrize: bridgeResult.bonusPrize,
      winAmount: bridgeResult.winAmount,
      payoutRate: bridgeResult.payoutRate,
    };
  }

  // Trường hợp cho kiểu cược "xiên"
  else if (
    betTypeAlias === "xien" ||
    betTypeAlias === "xienmb" ||
    betTypeAlias === "xienmbac"
  ) {
    const crossResult = matchCrossBet(line, lotteryResults, betTypeInfo);

    return {
      line,
      matched: crossResult.matched,
      matchingResults: lotteryResults,
      matchedNumbers: crossResult.matchedNumbers,
      winAmount: crossResult.winAmount,
      payoutRate: crossResult.payoutRate,
    };
  }

  // Trường hợp kiểu cược đảo
  else if (
    betTypeAlias === "dao" ||
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
    betTypeAlias === "b8ldao"
  ) {
    const permutationResult = matchPermutationBet(
      line,
      lotteryResults,
      betTypeInfo
    );

    return {
      line,
      matched: permutationResult.matched,
      matchingResults: lotteryResults,
      matchedNumbers: permutationResult.matchedNumbers,
      winAmount: permutationResult.winAmount,
      payoutRate: permutationResult.payoutRate,
    };
  }

  // Trường hợp kiểu cược thông thường
  else {
    for (const number of line.numbers) {
      for (const result of lotteryResults) {
        const matched = matchNumberWithResult(
          number,
          result,
          line.station,
          betTypeInfo
        );

        if (matched) {
          if (!matchedNumbers.includes(number)) {
            matchedNumbers.push(number);
          }
        }
      }
    }

    // Tính tiền thắng
    let payoutRate = 0;

    if (typeof betTypeInfo.payoutRate === "object") {
      // Xác định số chữ số để lấy tỉ lệ chính xác
      const digitCount = line.numbers[0] ? line.numbers[0].length : 2;
      const region = line.station.region;

      if (digitCount === 2) {
        payoutRate =
          betTypeInfo.payoutRate.twoDigits?.standard ||
          betTypeInfo.payoutRate.standard ||
          betTypeInfo.payoutRate["2 digits"] ||
          75;
      } else if (digitCount === 3) {
        payoutRate =
          betTypeInfo.payoutRate.threeDigits ||
          betTypeInfo.payoutRate["3 digits"] ||
          650;
      } else if (digitCount === 4) {
        payoutRate =
          betTypeInfo.payoutRate.fourDigits ||
          betTypeInfo.payoutRate["4 digits"] ||
          5500;
      }
    } else {
      payoutRate = betTypeInfo.payoutRate;
    }

    // Tính tiền thắng
    winAmount = matchedNumbers.length * line.amount * payoutRate;

    return {
      line,
      matched: matchedNumbers.length > 0,
      matchingResults: lotteryResults,
      matchedNumbers,
      winAmount,
      payoutRate,
    };
  }
}

/**
 * Kiểm tra một số với kết quả xổ số
 * @param {string} number - Số cược
 * @param {object} result - Kết quả xổ số
 * @param {object} station - Thông tin đài
 * @param {object} betTypeInfo - Thông tin kiểu cược
 * @returns {boolean} Kết quả kiểm tra
 */
function matchNumberWithResult(number, result, station, betTypeInfo) {
  // Lấy các số từ kết quả xổ số dựa vào kiểu cược
  const drawNumbers = extractDrawNumbers(
    result,
    station,
    betTypeInfo,
    number.length
  );

  // Kiểm tra xem số cược có nằm trong các số trên hay không
  return drawNumbers.includes(number);
}

/**
 * Trích xuất các số từ kết quả xổ số dựa vào kiểu cược
 * @param {object} result - Kết quả xổ số
 * @param {object} station - Thông tin đài
 * @param {object} betTypeInfo - Thông tin kiểu cược
 * @param {number} digitCount - Số chữ số
 * @returns {array} Danh sách số
 */
function extractDrawNumbers(result, station, betTypeInfo, digitCount) {
  const region = station.region;
  const betTypeAlias = betTypeInfo.aliases[0] || betTypeInfo.name.toLowerCase();
  const numbers = [];

  switch (betTypeAlias) {
    case "dd":
    case "dau duoi":
    case "head and tail":
      // Đầu đuôi - Lấy số ở giải 8 (đầu) và giải đặc biệt (đuôi) cho miền Nam/Trung
      // Lấy số ở giải 7 (đầu) và giải đặc biệt (đuôi) cho miền Bắc
      if (region === "north") {
        // Đầu - giải 7
        if (result.results.seventh) {
          result.results.seventh.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
        // Đuôi - giải đặc biệt
        if (result.results.special) {
          result.results.special.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      } else {
        // Đầu - giải 8
        if (result.results.eighth) {
          result.results.eighth.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
        // Đuôi - giải đặc biệt
        if (result.results.special) {
          result.results.special.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      }
      break;

    case "dau":
    case "head":
      // Đầu - chỉ lấy số ở giải 8 cho miền Nam/Trung, giải 7 cho miền Bắc
      if (region === "north") {
        if (result.results.seventh) {
          result.results.seventh.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      } else {
        if (result.results.eighth) {
          result.results.eighth.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      }
      break;

    case "duoi":
    case "dui":
    case "tail":
      // Đuôi - chỉ lấy số ở giải đặc biệt
      if (result.results.special) {
        result.results.special.forEach((num) => {
          numbers.push(num.slice(-digitCount));
        });
      }
      break;

    case "xc":
    case "x":
    case "three digits":
      // Xỉu chủ - lấy giải 7 và đặc biệt cho miền Nam/Trung, giải 6 và đặc biệt cho miền Bắc
      if (region === "north") {
        // Miền Bắc - giải 6 và đặc biệt
        if (result.results.sixth) {
          result.results.sixth.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
        if (result.results.special) {
          result.results.special.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      } else {
        // Miền Nam/Trung - giải 7 và đặc biệt
        if (result.results.seventh) {
          result.results.seventh.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
        if (result.results.special) {
          result.results.special.forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      }
      break;

    case "b":
    case "bao":
    case "baolo":
    case "cover all": {
      // Bao lô - lấy tất cả các giải
      const allResults = { ...result.results };

      // Loại bỏ các giải không phù hợp với số chữ số
      if (digitCount === 2) {
        // Lấy tất cả các giải
      } else if (digitCount === 3) {
        if (region !== "north") {
          delete allResults.eighth;
        } else {
          delete allResults.seventh;
        }
      } else if (digitCount === 4) {
        if (region !== "north") {
          delete allResults.eighth;
          delete allResults.seventh;
        } else {
          delete allResults.seventh;
          delete allResults.sixth;
        }
      }

      // Lấy số từ các giải
      for (const prize in allResults) {
        if (Array.isArray(allResults[prize])) {
          allResults[prize].forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      }
      break;
    }

    case "b7l":
    case "baobay":
      // Bao lô 7 - chỉ miền Nam/Trung, lấy giải 8, 7, 6, 5 và đặc biệt
      if (region !== "north") {
        const prizes = ["eighth", "seventh", "sixth", "fifth", "special"];
        for (const prize of prizes) {
          if (Array.isArray(result.results[prize])) {
            result.results[prize].forEach((num) => {
              numbers.push(num.slice(-digitCount));
            });
          }
        }
      }
      break;

    case "b8l":
    case "baotam":
      // Bao lô 8 - chỉ miền Bắc, lấy giải 7, 6 và đặc biệt
      if (region === "north") {
        const prizes = ["seventh", "sixth", "special"];
        for (const prize of prizes) {
          if (Array.isArray(result.results[prize])) {
            result.results[prize].forEach((num) => {
              numbers.push(num.slice(-digitCount));
            });
          }
        }
      }
      break;

    case "nt":
    case "nto":
    case "nhatto":
      // Nhất to - chỉ lấy giải nhất
      if (result.results.first) {
        result.results.first.forEach((num) => {
          numbers.push(num.slice(-digitCount));
        });
      }
      break;

    case "xien":
    case "xienmb":
    case "xienmbac":
      // Xiên miền bắc - lấy tất cả các giải miền bắc
      if (region === "north") {
        for (const prize in result.results) {
          if (Array.isArray(result.results[prize])) {
            result.results[prize].forEach((num) => {
              numbers.push(num.slice(-digitCount));
            });
          }
        }
      }
      break;

    default:
      // Mặc định - lấy tất cả các giải
      for (const prize in result.results) {
        if (Array.isArray(result.results[prize])) {
          result.results[prize].forEach((num) => {
            numbers.push(num.slice(-digitCount));
          });
        }
      }
      break;
  }

  // Loại bỏ các số trùng lặp
  return [...new Set(numbers)];
}

/**
 * Kiểm tra kiểu cược đá (bridge) với kết quả xổ số
 * @param {object} line - Dòng cược
 * @param {array} lotteryResults - Kết quả xổ số phù hợp
 * @param {object} betTypeInfo - Thông tin kiểu cược
 * @returns {object} Kết quả kiểm tra
 */
function matchBridgeBet(line, lotteryResults, betTypeInfo) {
  const numbers = line.numbers || [];
  const region = line.station.region;
  const digitCount = numbers[0] ? numbers[0].length : 2;

  // Thu thập tất cả các số từ kết quả xổ số
  const allDrawNumbers = [];

  for (const result of lotteryResults) {
    // Lấy tất cả các số từ các giải
    for (const prize in result.results) {
      if (Array.isArray(result.results[prize])) {
        result.results[prize].forEach((num) => {
          allDrawNumbers.push(num.slice(-digitCount));
        });
      }
    }
  }

  // Loại bỏ các số trùng lặp
  const uniqueDrawNumbers = [...new Set(allDrawNumbers)];

  // Tìm các số cược trùng với kết quả xổ số
  const matchedNumbers = numbers.filter((num) =>
    uniqueDrawNumbers.includes(num)
  );

  // Nếu ít hơn 2 số trùng, không thắng
  if (matchedNumbers.length < 2) {
    return {
      matched: false,
      matchedNumbers,
      matchedPairs: [],
      winFactor: 0,
      bonusFactor: 0,
      baseWinAmount: 0,
      bonusPrize: 0,
      winAmount: 0,
      payoutRate: 0,
    };
  }

  // Xác định tỉ lệ thưởng
  let payoutRate = 0;

  if (typeof betTypeInfo.payoutRate === "object") {
    if (region === "north") {
      payoutRate = betTypeInfo.payoutRate.bridgeNorth || 650;
    } else if (lotteryResults.length === 2) {
      payoutRate = betTypeInfo.payoutRate.bridgeTwoStations || 550;
    } else {
      payoutRate = betTypeInfo.payoutRate.bridgeOneStation || 750;
    }
  } else {
    payoutRate = betTypeInfo.payoutRate;
  }

  // Tính toán W - hệ số tính thưởng (số lần xuất hiện - 1)
  const winFactor = matchedNumbers.length - 1;

  // Đếm số lần xuất hiện của mỗi số
  const numberCounts = {};
  allDrawNumbers.forEach((num) => {
    if (matchedNumbers.includes(num)) {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    }
  });

  // Tìm số lần xuất hiện nhiều nhất
  let maxOccurrences = 0;
  for (const num in numberCounts) {
    if (numberCounts[num] > maxOccurrences) {
      maxOccurrences = numberCounts[num];
    }
  }

  // Tính B - hệ số thưởng nháy (số lần xuất hiện nhiều nhất - 1) * 0.5
  const bonusFactor = maxOccurrences > 1 ? (maxOccurrences - 1) * 0.5 : 0;

  // Tính tiền thắng 1 vòng V
  const baseWinAmount = line.amount * payoutRate;

  // Tính tiền thưởng nháy B
  const bonusPrize = bonusFactor * baseWinAmount;

  // Tính tổng tiền thưởng
  const winAmount = winFactor * baseWinAmount + bonusPrize;

  // Tạo danh sách các cặp số trùng
  const matchedPairs = [];
  for (let i = 0; i < matchedNumbers.length; i++) {
    for (let j = i + 1; j < matchedNumbers.length; j++) {
      matchedPairs.push(`${matchedNumbers[i]}-${matchedNumbers[j]}`);
    }
  }

  return {
    matched: true,
    matchedNumbers,
    matchedPairs,
    winFactor,
    bonusFactor,
    baseWinAmount,
    bonusPrize,
    winAmount,
    payoutRate,
  };
}

/**
 * Kiểm tra kiểu cược xiên (cross) với kết quả xổ số
 * @param {object} line - Dòng cược
 * @param {array} lotteryResults - Kết quả xổ số phù hợp
 * @param {object} betTypeInfo - Thông tin kiểu cược
 * @returns {object} Kết quả kiểm tra
 */
function matchCrossBet(line, lotteryResults, betTypeInfo) {
  const numbers = line.numbers || [];
  const digitCount = numbers[0] ? numbers[0].length : 2;

  // Thu thập tất cả các số từ kết quả xổ số
  const allDrawNumbers = [];

  for (const result of lotteryResults) {
    // Lấy tất cả các số từ các giải
    for (const prize in result.results) {
      if (Array.isArray(result.results[prize])) {
        result.results[prize].forEach((num) => {
          allDrawNumbers.push(num.slice(-digitCount));
        });
      }
    }
  }

  // Loại bỏ các số trùng lặp
  const uniqueDrawNumbers = [...new Set(allDrawNumbers)];

  // Kiểm tra xem tất cả các số cược có trùng với kết quả xổ số không
  const matchedNumbers = numbers.filter((num) =>
    uniqueDrawNumbers.includes(num)
  );

  // Nếu số lượng số trùng khớp không bằng số lượng số cược, không thắng
  if (matchedNumbers.length !== numbers.length) {
    return {
      matched: false,
      matchedNumbers,
      winAmount: 0,
      payoutRate: 0,
    };
  }

  // Xác định tỉ lệ thưởng
  let payoutRate = 0;

  if (typeof betTypeInfo.payoutRate === "object") {
    const numCount = numbers.length;

    if (numCount === 2) {
      payoutRate = betTypeInfo.payoutRate.crossTwo || 350;
    } else if (numCount === 3) {
      payoutRate = betTypeInfo.payoutRate.crossThree || 1000;
    } else {
      payoutRate = betTypeInfo.payoutRate.crossFour || 3000;
    }
  } else {
    payoutRate = betTypeInfo.payoutRate;
  }

  // Tính tiền thắng
  const winAmount = line.amount * payoutRate;

  return {
    matched: true,
    matchedNumbers,
    winAmount,
    payoutRate,
  };
}

/**
 * Kiểm tra kiểu cược đảo (permutation) với kết quả xổ số
 * @param {object} line - Dòng cược
 * @param {array} lotteryResults - Kết quả xổ số phù hợp
 * @param {object} betTypeInfo - Thông tin kiểu cược
 * @returns {object} Kết quả kiểm tra
 */
function matchPermutationBet(line, lotteryResults, betTypeInfo) {
  const numbers = line.numbers || [];
  const region = line.station.region;
  const betTypeAlias = betTypeInfo.aliases[0];
  const digitCount = numbers[0] ? numbers[0].length : 2;

  // Xác định các giải cần kiểm tra dựa vào kiểu cược
  let targetPrizes = [];

  if (betTypeAlias.includes("dau") && !betTypeAlias.includes("duoi")) {
    // Chỉ kiểm tra đầu
    if (region === "north") {
      if (digitCount === 2) {
        targetPrizes = ["seventh"];
      } else if (digitCount === 3) {
        targetPrizes = ["sixth"];
      }
    } else {
      if (digitCount === 2) {
        targetPrizes = ["eighth"];
      } else if (digitCount === 3) {
        targetPrizes = ["seventh"];
      }
    }
  } else if (betTypeAlias.includes("duoi") || betTypeAlias.includes("dui")) {
    // Chỉ kiểm tra đuôi
    targetPrizes = ["special"];
  } else if (betTypeAlias.includes("xc") || betTypeAlias === "x") {
    // Xỉu chủ (3 chữ số)
    if (region === "north") {
      targetPrizes = ["sixth", "special"];
    } else {
      targetPrizes = ["seventh", "special"];
    }
  } else if (betTypeAlias.includes("b7l") || betTypeAlias.includes("baobay")) {
    // Bao lô 7 (2 chữ số)
    targetPrizes = ["eighth", "seventh", "sixth", "fifth", "special"];
  } else if (betTypeAlias.includes("b8l") || betTypeAlias.includes("baotam")) {
    // Bao lô 8 (2 chữ số)
    targetPrizes = ["seventh", "sixth", "special"];
  } else {
    // Mặc định bao lô
    targetPrizes = Object.keys(lotteryResults[0]?.results || {});
  }

  // Thu thập tất cả các số từ các giải đã chọn
  const drawNumbers = [];

  for (const result of lotteryResults) {
    for (const prize of targetPrizes) {
      if (Array.isArray(result.results[prize])) {
        result.results[prize].forEach((num) => {
          drawNumbers.push(num.slice(-digitCount));
        });
      }
    }
  }

  // Tìm số trùng với hoán vị
  const matchedNumbers = [];

  for (const number of numbers) {
    // Tạo tất cả các hoán vị của số
    const permutations = generatePermutations(number);

    // Kiểm tra xem có hoán vị nào trùng không
    const matched = permutations.some((perm) => drawNumbers.includes(perm));

    if (matched) {
      matchedNumbers.push(number);
    }
  }

  // Xác định tỉ lệ thưởng
  let payoutRate = 0;

  if (typeof betTypeInfo.payoutRate === "object") {
    if (digitCount === 2) {
      payoutRate = betTypeInfo.payoutRate["2 digits"] || 75;
    } else if (digitCount === 3) {
      payoutRate = betTypeInfo.payoutRate["3 digits"] || 650;
    } else if (digitCount === 4) {
      payoutRate = betTypeInfo.payoutRate["4 digits"] || 5500;
    }
  } else {
    payoutRate = betTypeInfo.payoutRate;
  }

  // Tính tiền thắng
  const winAmount = matchedNumbers.length * line.amount * payoutRate;

  return {
    matched: matchedNumbers.length > 0,
    matchedNumbers,
    winAmount,
    payoutRate,
  };
}

/**
 * Tạo tất cả các hoán vị của một số
 * @param {string} number - Số cần tạo hoán vị
 * @returns {array} Danh sách hoán vị
 */
function generatePermutations(number) {
  if (!number) return [];
  if (number.length <= 1) return [number];

  const result = [];
  const used = {};

  function backtrack(current, remaining) {
    if (current.length === number.length) {
      result.push(current);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      // Tránh trùng lặp với ký tự đã sử dụng ở vị trí này
      if (used[`${i}-${remaining[i]}`]) continue;

      used[`${i}-${remaining[i]}`] = true;

      // Tạo chuỗi mới không chứa ký tự đã chọn
      const newRemaining =
        remaining.substring(0, i) + remaining.substring(i + 1);

      backtrack(current + remaining[i], newRemaining);

      used[`${i}-${remaining[i]}`] = false;
    }
  }

  backtrack("", number);

  // Loại bỏ các hoán vị trùng lặp
  return [...new Set(result)];
}
