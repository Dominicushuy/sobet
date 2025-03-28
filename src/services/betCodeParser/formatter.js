// src/services/betCodeParser/formatter.js
import { defaultStations, defaultBetTypes } from "@/config/defaults";

/**
 * Chuẩn hóa mã cược đầu vào
 * @param {string} betCode - Mã cược đầu vào
 * @returns {string} Mã cược đã chuẩn hóa
 */
export function formatBetCode(betCode) {
  if (!betCode || typeof betCode !== "string") {
    return betCode;
  }

  // Phân tách các dòng
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return betCode;
  }

  // Đoạn code quan trọng: Kiểm tra nếu chỉ có một dòng và có thể là tên đài
  // Đây là chỗ nên xử lý trường hợp như "hn"
  if (lines.length === 1) {
    return betCode;
  }

  const formattedLines = [];

  // Xử lý dòng đầu tiên (đài)
  const formattedStation = formatStation(lines[0]);
  formattedLines.push(formattedStation);

  // Xử lý các dòng còn lại
  for (let i = 1; i < lines.length; i++) {
    // Bỏ qua các dòng chỉ chứa tên đài trung gian
    if (isStationOnlyLine(lines[i])) {
      continue;
    }

    // Cải tiến: Kiểm tra và xử lý các trường hợp đặc biệt

    // 1. Trường hợp nhiều kiểu cược trong một dòng (vd: 23.45.67dd10.dau20.duoi5)
    const multipleBetTypes = extractMultipleBetTypes(lines[i]);
    if (multipleBetTypes.length > 1) {
      // Trích xuất phần số
      const numbersPart = extractNumbersPart(lines[i]);
      const numbers = parseNumbersPart(numbersPart);

      // Cải tiến: Xử lý từ khóa đặc biệt (tai, xiu, v.v.)
      const specialKeywords = [
        "tai",
        "xiu",
        "chan",
        "le",
        "chanchan",
        "lele",
        "chanle",
        "lechan",
      ];

      for (const keyword of specialKeywords) {
        if (new RegExp(`\\b${keyword}\\b`, "i").test(numbersPart)) {
          break;
        }
      }

      // Tạo dòng riêng cho mỗi kiểu cược
      for (const betType of multipleBetTypes) {
        const formattedLine = `${numbers.join(".")}${betType}`;
        formattedLines.push(formattedLine);
      }

      continue;
    }

    // 2. Trường hợp số gộp thành nhóm (vd: 1234.5678da1)
    if (containsGroupNumbers(lines[i])) {
      const parts = splitNumbersAndBetType(lines[i]);
      if (parts.numbersPart && parts.betTypePart) {
        // Tách các số thành nhóm 2 chữ số nếu có 4 chữ số trở lên
        const expandedNumbers = expandGroupedNumbers(parts.numbersPart);

        if (expandedNumbers.length > 0) {
          const formattedLine = `${expandedNumbers.join(".")}${
            parts.betTypePart
          }`;
          formattedLines.push(formattedLine);
          continue;
        }
      }
    }

    const formattedLine = formatBetLine(lines[i]);
    formattedLines.push(formattedLine);
  }

  return formattedLines.join("\n");
}

/**
 * Kiểm tra xem dòng có phải là dòng chỉ chứa tên đài không
 */
function isStationOnlyLine(line) {
  // Loại bỏ dấu chấm cuối
  const cleanLine = line.replace(/\.+$/, "").trim().toLowerCase();

  // Kiểm tra xem là tên đài đơn thuần không
  return defaultStations.some(
    (station) =>
      station.name.toLowerCase() === cleanLine ||
      station.aliases.some((alias) => alias === cleanLine)
  );
}

/**
 * Chuẩn hóa phần đài
 * @param {string} stationLine - Dòng chứa thông tin đài
 * @returns {string} Dòng đài đã chuẩn hóa
 */
function formatStation(stationLine) {
  // Loại bỏ dấu chấm cuối
  let formattedLine = stationLine.trim().replace(/\.+$/, "");

  // Nếu đã có số cược, tách phần đài ra
  if (/\d/.test(formattedLine) && !formattedLine.match(/^\d+d/)) {
    const stationPart = extractStationPart(formattedLine);
    return stationPart;
  }

  // Xử lý đài ghép không đúng định dạng
  const stationText = formattedLine.trim().toLowerCase();

  // Tìm các mẫu đài ghép liền nhau không dùng dấu phân cách
  const mergedStations = findMergedStations(stationText);
  if (mergedStations.found) {
    return mergedStations.formatted;
  }

  // Xử lý các viết tắt gây nhầm lẫn
  if (stationText === "dn") {
    const currentDay = getCurrentDayOfWeek();
    // Thứ 4 (ngày 3) có cả Đồng Nai và Đà Nẵng
    if (currentDay === 3) {
      return "dnai"; // Mặc định chọn Đồng Nai
    }
  }

  // Nếu không có gì để sửa, giữ nguyên
  return formattedLine;
}

/**
 * Tìm và sửa đài ghép liền nhau không dùng dấu phân cách
 */
function findMergedStations(stationText) {
  // Trường hợp đặc biệt: dnaictho, tp.dongthap
  for (const station1 of defaultStations) {
    // Thử tất cả các alias của đài 1
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      if (stationText.startsWith(alias1)) {
        const remainingText = stationText.substring(alias1.length);

        // Tìm đài thứ 2 trong phần còn lại
        for (const station2 of defaultStations) {
          // Không xét ghép giữa đài với chính nó
          if (station1.name === station2.name) continue;

          for (const alias2 of [
            station2.name.toLowerCase(),
            ...station2.aliases,
          ]) {
            if (remainingText === alias2 || remainingText.startsWith(alias2)) {
              return {
                found: true,
                formatted: `${alias1}.${alias2}`,
              };
            }
          }
        }
      }
    }
  }

  for (const station1 of defaultStations) {
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      for (const station2 of defaultStations) {
        // Không xét ghép giữa đài với chính nó
        if (station1.name === station2.name) continue;

        for (const alias2 of [
          station2.name.toLowerCase(),
          ...station2.aliases,
        ]) {
          // Nếu hai alias ghép lại bằng stationText
          if (stationText === alias1 + alias2) {
            return {
              found: true,
              formatted: `${alias1}.${alias2}`,
            };
          }
        }
      }
    }
  }

  return { found: false };
}

/**
 * Lấy ngày hiện tại trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 */
function getCurrentDayOfWeek() {
  return new Date().getDay();
}

/**
 * Trích xuất phần đài từ một dòng
 */
function extractStationPart(line) {
  // Tìm vị trí của số đầu tiên hoặc kiểu cược
  let index = line.length;

  // Tìm vị trí số đầu tiên (trừ trường hợp bắt đầu bằng 2d, 3d)
  const numberMatch = /(?<!\d[a-z])\d/.exec(line);
  if (numberMatch) {
    index = Math.min(index, numberMatch.index);
  }

  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  for (const alias of betTypeAliases) {
    const aliasPos = line.indexOf(alias);
    if (aliasPos !== -1) {
      index = Math.min(index, aliasPos);
    }
  }

  return line.substring(0, index).trim();
}

/**
 * Get list of special keywords for number combinations
 * @returns {Array<string>} Array of special keywords
 */
function getSpecialKeywords() {
  return ["tai", "xiu", "chan", "le", "chanchan", "lele", "chanle", "lechan"];
}

/**
 * Check if a string is a special keyword
 * @param {string} str - String to check
 * @returns {boolean} True if string is a special keyword
 */
function isSpecialKeyword(str) {
  if (!str) return false;
  return getSpecialKeywords().includes(str.toLowerCase());
}

/**
 * Format bet line with improved handling of special keywords and sequences
 * @param {string} line - Bet line to format
 * @returns {string} Formatted bet line
 */
function formatBetLine(line) {
  // Bước 1: Xác định kiểu cược và tiền cược (thường ở cuối dòng)
  const betTypeAndAmountPatterns = [];

  // Tìm tất cả các mẫu kiểu cược + số tiền
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  for (const alias of betTypeAliases) {
    betTypeAndAmountPatterns.push(
      new RegExp(`(${alias})(\\d+(?:[,.n]\\d+)?)`, "gi")
    );
  }

  let normalizedLine = line.trim();

  // Loại bỏ dấu chấm ở đầu dòng
  normalizedLine = normalizedLine.replace(/^\./, "");

  // Sửa lỗi "xcdui" thành "xcduoi"
  normalizedLine = normalizedLine.replace(/xcdui/g, "xcduoi");

  // Sửa lỗi "dui" thành "duoi"
  normalizedLine = normalizedLine.replace(/(\b|[^a-z])dui(\d+|$)/g, "$1duoi$2");

  // Bước 2: Chuẩn hóa phần số cược
  // Thay thế các dấu phân cách không chuẩn bằng dấu chấm
  normalizedLine = normalizedLine.replace(/[,\- ]+/g, ".");

  // Loại bỏ các dấu chấm dư thừa/liên tiếp
  normalizedLine = normalizedLine.replace(/\.{2,}/g, ".");
  normalizedLine = normalizedLine.replace(/^\.|\.$/g, "");

  // QUAN TRỌNG: Đảm bảo không có dấu chấm trước các kiểu cược
  for (const alias of betTypeAliases) {
    // Tìm và loại bỏ dấu chấm trước kiểu cược
    const betTypeRegex = new RegExp(`\\.(${alias}\\d*(?:[,.n]\\d+)?)`, "gi");
    normalizedLine = normalizedLine.replace(betTypeRegex, "$1");
  }

  // Bước 3: Bảo vệ các từ khóa đặc biệt và định dạng kéo
  const parts = normalizedLine.split(".");
  const processedParts = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check for special keywords
    if (isSpecialKeyword(part)) {
      processedParts.push(part);
      continue;
    }

    // Enhanced check for keo sequences
    const keoMatch = part.match(/^(\d+)\/(\d+)(?:keo|k)(\d+)$/);
    if (keoMatch) {
      processedParts.push(part);
      continue;
    }

    // Handle numeric parts with potential grouping
    if (/^\d+$/.test(part)) {
      // For groups of 4 digits or more that are even in length, we might need to split
      // But we'll leave this for the parser to handle contextually
      processedParts.push(part);
    } else {
      processedParts.push(part);
    }
  }

  // Rebuild the line
  normalizedLine = processedParts.join(".");

  // Bước 4: Chuẩn hóa định dạng tiền cược
  // Xử lý trường hợp nhiều kiểu cược trên cùng dãy số
  // Ví dụ: 93.97da0,5.dd5 -> 93.97da0.5dd5 hoặc dau20.duoi10
  for (const pattern of betTypeAndAmountPatterns) {
    normalizedLine = normalizedLine.replace(
      pattern,
      (match, betType, amount) => {
        // Chuẩn hóa số tiền (đổi dấu , thành .)
        const normalizedAmount = amount ? amount.replace(/,/g, ".") : "10";
        return `${betType}${normalizedAmount}`;
      }
    );
  }

  // Bước 5: Thêm số tiền mặc định cho kiểu cược thiếu số tiền
  const betTypeWithoutAmount = normalizedLine.match(/([a-z]+)(?!\d)(\s|$)/i);
  if (betTypeWithoutAmount) {
    const betTypeAlias = betTypeWithoutAmount[1].toLowerCase();
    const validBetType = defaultBetTypes.some((bt) =>
      bt.aliases.includes(betTypeAlias)
    );

    if (validBetType) {
      normalizedLine = normalizedLine.replace(
        new RegExp(`${betTypeAlias}(\\s|$)`, "i"),
        `${betTypeAlias}10$1`
      );
    }
  }

  return normalizedLine;
}

/**
 * Tách mã cược thành các thành phần để dễ dàng xử lý
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Các thành phần của mã cược
 */
export function decomposeBetCode(betCode) {
  if (!betCode || typeof betCode !== "string") {
    return { station: "", lines: [] };
  }

  // Phân tách các dòng
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { station: "", lines: [] };
  }

  // Lấy phần đài
  const station = extractStationPart(lines[0]);

  // Lấy phần số cược từ dòng đầu tiên nếu có
  let betLines = [];
  const firstLineBetPart = lines[0].substring(station.length).trim();
  if (firstLineBetPart) {
    betLines.push(firstLineBetPart);
  }

  // Thêm các dòng còn lại, bỏ qua các dòng chỉ chứa tên đài
  for (let i = 1; i < lines.length; i++) {
    if (!isStationOnlyLine(lines[i])) {
      betLines.push(lines[i]);
    }
  }

  return {
    station,
    lines: betLines,
  };
}

/**
 * Trích xuất nhiều kiểu cược từ một dòng
 */
function extractMultipleBetTypes(line) {
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  const result = [];

  // Chuẩn hóa line
  const normalizedLine = line
    .replace(/xcdui/g, "xcduoi")
    .replace(/(\b|[^a-z])dui(\d+|$)/g, "$1duoi$2")
    .replace(/[,\- ]+/g, ".");

  // Tạo pattern với word boundary (\b) để đảm bảo tìm đúng kiểu cược
  // Sắp xếp alias theo độ dài (dài nhất trước)
  const betTypePattern = betTypeAliases
    .sort((a, b) => b.length - a.length)
    .map((alias) => `\\b${alias}\\b`)
    .join("|");

  // Tìm tất cả các kiểu cược
  const betTypeRegex = new RegExp(
    `(${betTypePattern})(\\d+(?:[,.n]\\d+)?)`,
    "gi"
  );

  let match;
  while ((match = betTypeRegex.exec(normalizedLine)) !== null) {
    const betTypeAlias = match[1].toLowerCase();
    const amountStr = match[2] || "10";

    result.push(betTypeAlias + amountStr);
  }

  return result;
}

/**
 * Trích xuất phần số từ dòng cược
 */
function extractNumbersPart(line) {
  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  let betTypeIndex = line.length;

  for (const alias of betTypeAliases) {
    const regex = new RegExp(`\\b${alias}\\d*`, "i");
    const match = regex.exec(line);
    if (match && match.index < betTypeIndex) {
      betTypeIndex = match.index;
      break;
    }
  }

  return line.substring(0, betTypeIndex).trim();
}

/**
 * Phân tích phần số thành chuỗi chuẩn
 */
function parseNumbersPart(numbersPart) {
  const parts = numbersPart.split(".");
  const result = [];

  const specialKeywords = [
    "tai",
    "xiu",
    "chan",
    "le",
    "chanchan",
    "lele",
    "chanle",
    "lechan",
  ];

  for (const part of parts) {
    if (part.trim() === "") continue;

    if (specialKeywords.includes(part.toLowerCase())) {
      // Giữ nguyên từ khóa đặc biệt
      result.push(part.toLowerCase());
    } else if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
      // Phân tách số có 4 chữ số trở lên thành các cặp 2 chữ số
      for (let i = 0; i < part.length; i += 2) {
        if (i + 2 <= part.length) {
          result.push(part.substr(i, 2));
        }
      }
    } else {
      result.push(part);
    }
  }

  return result;
}

/**
 * Kiểm tra xem dòng có chứa số gộp thành nhóm không
 */
function containsGroupNumbers(line) {
  // Tìm các số có 4 chữ số trở lên
  const groupedNumberPattern = /\d{4,}/g;
  const matches = line.match(groupedNumberPattern);

  return matches !== null && matches.some((match) => match.length % 2 === 0);
}

/**
 * Tách dòng thành phần số và phần kiểu cược/tiền cược
 */
function splitNumbersAndBetType(line) {
  // Create sorted pattern from bet type aliases (longest first to avoid partial matches)
  const betTypeAliases = defaultBetTypes
    .flatMap((bt) => bt.aliases)
    .sort((a, b) => b.length - a.length)
    .join("|");

  // Special handling for multiple bet types (like 66.88da1.b5)
  const multipleBetTypesPattern = new RegExp(
    `(.*?)\\b((?:${betTypeAliases})\\d*(?:[,.n]\\d+)?)(?:\\.((?:${betTypeAliases})\\d*(?:[,.n]\\d+)?))*$`,
    "i"
  );

  const match = line.match(multipleBetTypesPattern);

  if (match) {
    // Extract numbers part and the first bet type
    const numbersPart = match[1]?.trim() || "";
    const firstBetType = match[2] || "";

    // Extract all bet types (including additional ones)
    const betTypesText = line.substring(line.indexOf(firstBetType));
    const betTypes = betTypesText.split(".");

    return {
      numbersPart,
      betTypePart: firstBetType,
      allBetTypes: betTypes,
    };
  }

  // Fallback for simple cases
  const simpleRegex = new RegExp(
    `(.*?)(\\b(?:${betTypeAliases})\\d*(?:[,.n]\\d+)?)$`,
    "i"
  );
  const simpleMatch = line.match(simpleRegex);

  if (simpleMatch) {
    return {
      numbersPart: simpleMatch[1].trim(),
      betTypePart: simpleMatch[2],
      allBetTypes: [simpleMatch[2]],
    };
  }

  return { numbersPart: line, betTypePart: "", allBetTypes: [] };
}

/**
 * Mở rộng các số gộp thành các cặp 2 chữ số
 */
function expandGroupedNumbers(numbersPart) {
  const parts = numbersPart.split(".");
  const expandedNumbers = [];

  for (const part of parts) {
    if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
      // Pair consecutive 2-digit numbers for special handling with "da" bet type
      for (let i = 0; i < part.length; i += 4) {
        if (i + 4 <= part.length) {
          // Create pairs like "12.34" for each 4 digits
          expandedNumbers.push(`${part.substr(i, 2)}.${part.substr(i + 2, 2)}`);
        } else if (i + 2 <= part.length) {
          // Handle any remaining 2 digits
          expandedNumbers.push(part.substr(i, 2));
        }
      }
    } else if (/^\d+$/.test(part)) {
      expandedNumbers.push(part);
    }
  }

  return expandedNumbers;
}

export default {
  formatBetCode,
  decomposeBetCode,
};
