// src/services/betCodeParser/errorFixer.js
import { defaultStations, defaultBetTypes } from "@/config/defaults";

/**
 * Gợi ý sửa lỗi cho mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Gợi ý sửa lỗi
 */
export function suggestFixes(betCode, errorResult) {
  if (!errorResult || !errorResult.hasErrors) {
    return {
      hasSuggestions: false,
      suggestions: [],
    };
  }

  const suggestions = [];

  for (const error of errorResult.errors) {
    const suggestion = generateSuggestion(error, betCode);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return {
    hasSuggestions: suggestions.length > 0,
    suggestions,
  };
}

/**
 * Sửa lỗi tự động cho mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} errorResult - Kết quả phát hiện lỗi
 * @returns {object} Kết quả sửa lỗi
 */
export function fixBetCode(betCode, errorResult) {
  if (!betCode || !errorResult || !errorResult.hasErrors) {
    return {
      success: false,
      fixed: betCode,
      changes: [],
    };
  }

  // Phân tách các dòng
  let lines = betCode.split(/\r?\n/);
  const changes = [];

  // Sắp xếp lỗi theo dòng và thứ tự xuất hiện
  const sortedErrors = [...errorResult.errors].sort((a, b) => {
    if (a.lineIndex !== b.lineIndex) {
      return a.lineIndex - b.lineIndex;
    }
    return a.scope === "station" ? -1 : 1;
  });

  for (const error of sortedErrors) {
    const fix = generateFix(error, lines);
    if (fix && fix.newLine) {
      const lineIndex = error.lineIndex !== undefined ? error.lineIndex : 0;
      changes.push({
        lineIndex,
        oldLine: lines[lineIndex],
        newLine: fix.newLine,
        errorType: error.type,
      });
      lines[lineIndex] = fix.newLine;
    }
  }

  return {
    success: changes.length > 0,
    fixed: lines.join("\n"),
    changes,
  };
}

/**
 * Tạo gợi ý sửa lỗi
 * @param {object} error - Thông tin lỗi
 * @param {string} betCode - Mã cược gốc
 * @returns {object} Gợi ý
 */
function generateSuggestion(error, betCode) {
  switch (error.type) {
    case "INVALID_STATION":
      return {
        message: `Đài "${
          error.message.split('"')[1] || error.message.split(" ")[1]
        }" không hợp lệ. Hãy kiểm tra chính tả hoặc chọn một đài khác.`,
        suggestion: "Kiểm tra chính tả hoặc chọn một đài khác.",
      };
    case "STATION_NOT_AVAILABLE":
      return {
        message: error.message,
        suggestion: "Hãy chọn đài khác hoặc đặt cược vào ngày khác.",
      };
    case "INVALID_STATION_COUNT":
      return {
        message: error.message,
        suggestion:
          "Điều chỉnh số lượng đài cho phù hợp với lịch xổ số hôm nay.",
      };
    case "NO_BET_TYPE":
      return {
        message: "Thiếu kiểu cược.",
        suggestion: "Thêm kiểu cược vào cuối dòng. Ví dụ: dd10, b5, xc2...",
      };
    case "INVALID_BET_TYPE":
      return {
        message: error.message,
        suggestion:
          "Sử dụng các kiểu cược phổ biến như: dd, b, xc, dau, duoi...",
      };
    case "INCOMPATIBLE_BET_TYPE":
      return {
        message: error.message,
        suggestion: "Chọn kiểu cược khác phù hợp với miền đã chọn.",
      };
    case "NO_NUMBERS":
      return {
        message: "Thiếu số cược.",
        suggestion: "Thêm số cược vào dòng. Ví dụ: 23.45.67dd10",
      };
    case "INVALID_NUMBER_FORMAT":
      return {
        message: error.message,
        suggestion: "Số cược phải là các chữ số. Ví dụ: 23, 45, 678...",
      };
    case "INVALID_DIGIT_COUNT":
      return {
        message: error.message,
        suggestion: "Điều chỉnh số chữ số phù hợp với kiểu cược.",
      };
    case "INVALID_AMOUNT":
      return {
        message: "Số tiền cược không hợp lệ.",
        suggestion: "Thêm số tiền cược vào sau kiểu cược. Ví dụ: dd10, b5...",
      };
    default:
      return {
        message: error.message,
        suggestion: "Kiểm tra lại mã cược.",
      };
  }
}

/**
 * Tạo sửa lỗi cho một lỗi cụ thể
 * @param {object} error - Thông tin lỗi
 * @param {Array} lines - Các dòng mã cược
 * @returns {object} Sửa lỗi
 */
function generateFix(error, lines) {
  const lineIndex = error.lineIndex !== undefined ? error.lineIndex : 0;
  const line = lines[lineIndex];

  switch (error.type) {
    case "INVALID_STATION": {
      // Sửa tên đài
      const invalidStation =
        error.message.split('"')[1] || error.message.split(" ")[1];
      const suggestedStation = findSimilarStation(invalidStation);
      if (suggestedStation) {
        return {
          newLine: suggestedStation,
        };
      }
      break;
    }
    case "INVALID_STATION_COUNT": {
      // Điều chỉnh số lượng đài
      const stationCount = parseInt(line.match(/^(\d+)/)?.[1], 10);
      if (!stationCount) return null;

      const region =
        line.toLowerCase().includes("nam") || line.toLowerCase().includes("dmn")
          ? "south"
          : "central";
      const currentDay = new Date().getDay();
      const maxCount = getMaxStationsForRegionOnDay(region, currentDay);

      if (stationCount > maxCount) {
        // Tạo mẫu với số lượng đài điều chỉnh
        return {
          newLine: line.replace(/^(\d+)/, maxCount),
        };
      }
      break;
    }
    case "NO_BET_TYPE":
      // Thêm kiểu cược mặc định
      if (line && !line.includes("dd")) {
        return {
          newLine: `${line}dd10`,
        };
      }
      break;
    case "INVALID_BET_TYPE":
      // Sửa kiểu cược không hợp lệ
      if (line) {
        const betTypeRegex = /([a-z]+)(\d+(?:[,.]\d+)?)?$/i;
        const match = line.match(betTypeRegex);
        if (match) {
          const invalidBetType = match[1];
          const amount = match[2] || "10";
          const suggestedBetType = findSimilarBetType(invalidBetType);
          if (suggestedBetType) {
            return {
              newLine: line.replace(
                betTypeRegex,
                `${suggestedBetType}${amount}`
              ),
            };
          }
        }
      }
      break;
    case "INVALID_NUMBER_FORMAT":
      // Sửa số không hợp lệ
      if (line && error.number) {
        const cleanedNumber = error.number.replace(/\D/g, "");
        if (cleanedNumber && cleanedNumber !== error.number) {
          return {
            newLine: line.replace(error.number, cleanedNumber),
          };
        }
      }
      break;
    case "INVALID_DIGIT_COUNT":
      // Sửa số chữ số không hợp lệ
      if (line && error.number) {
        const match = error.message.match(/yêu cầu (\d+)/);
        if (match) {
          const requiredDigits = parseInt(match[1], 10);
          const paddedNumber = error.number.padStart(requiredDigits, "0");
          if (paddedNumber && paddedNumber !== error.number) {
            return {
              newLine: line.replace(error.number, paddedNumber),
            };
          }
        }
      }
      break;
    case "INVALID_AMOUNT":
      // Thêm số tiền mặc định
      if (line) {
        const lastChar = line.charAt(line.length - 1);
        if (!/\d/.test(lastChar)) {
          return {
            newLine: `${line}10`,
          };
        } else {
          const betTypeRegex = /([a-z]+)$/i;
          const match = line.match(betTypeRegex);
          if (match) {
            return {
              newLine: `${line}10`,
            };
          }
        }
      }
      break;
  }

  return null;
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
  };

  return stationCounts[region]?.[day] || 1;
}

/**
 * Tìm đài tương tự với đài không hợp lệ
 * @param {string} invalidStation - Tên đài không hợp lệ
 * @returns {string} Tên đài gợi ý
 */
function findSimilarStation(invalidStation) {
  if (!invalidStation) return null;

  const normalized = invalidStation.toLowerCase();

  // Kiểm tra đài nhiều miền đặc biệt
  const multiStationMatch = normalized.match(/^(\d+)([a-z]+)/);
  if (multiStationMatch) {
    const count = parseInt(multiStationMatch[1], 10);
    const regionPart = multiStationMatch[2];

    // Kiểm tra nếu là phần miền nam/trung
    if (["dmn", "dn", "mn", "dnam", "mnam"].includes(regionPart)) {
      return `${count}dmn`;
    } else if (["dmt", "dt", "mt", "dtrung", "mtrung"].includes(regionPart)) {
      return `${count}dmt`;
    }
  }

  // Tìm đài có alias gần giống nhất
  let bestMatch = null;
  let highestScore = 0;

  for (const station of defaultStations) {
    const aliases = [station.name.toLowerCase(), ...station.aliases];
    for (const alias of aliases) {
      const score = calculateSimilarity(normalized, alias);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = alias;
      }
    }
  }

  return highestScore > 0.6 ? bestMatch : null;
}

/**
 * Tìm kiểu cược tương tự với kiểu cược không hợp lệ
 * @param {string} invalidBetType - Kiểu cược không hợp lệ
 * @returns {string} Kiểu cược gợi ý
 */
function findSimilarBetType(invalidBetType) {
  if (!invalidBetType) return "dd";

  const normalized = invalidBetType.toLowerCase();

  // Tìm kiểu cược có alias gần giống nhất
  let bestMatch = null;
  let highestScore = 0;

  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      const score = calculateSimilarity(normalized, alias);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = alias;
      }
    }
  }

  return highestScore > 0.6 ? bestMatch : "dd";
}

/**
 * Tính độ giống nhau giữa hai chuỗi (0-1)
 * @param {string} str1 - Chuỗi thứ nhất
 * @param {string} str2 - Chuỗi thứ hai
 * @returns {number} Độ giống nhau (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  // Sử dụng khoảng cách Levenshtein đơn giản
  const len1 = str1.length;
  const len2 = str2.length;

  // Khởi tạo ma trận
  const matrix = Array(len1 + 1)
    .fill()
    .map(() => Array(len2 + 1).fill(0));

  // Điền giá trị đầu tiên
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Điền ma trận
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  // Khoảng cách Levenshtein là giá trị ở góc dưới bên phải
  const distance = matrix[len1][len2];

  // Chuyển đổi khoảng cách thành độ giống nhau
  return 1 - distance / Math.max(len1, len2);
}
