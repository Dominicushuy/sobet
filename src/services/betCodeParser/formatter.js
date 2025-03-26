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

  const formattedLines = [];

  // Xử lý dòng đầu tiên (đài)
  const formattedStation = formatStation(lines[0]);
  formattedLines.push(formattedStation);

  // Xử lý các dòng còn lại
  for (let i = 1; i < lines.length; i++) {
    const formattedLine = formatBetLine(lines[i]);
    formattedLines.push(formattedLine);
  }

  return formattedLines.join("\n");
}

/**
 * Chuẩn hóa phần đài
 * @param {string} stationLine - Dòng chứa thông tin đài
 * @returns {string} Dòng đài đã chuẩn hóa
 */
function formatStation(stationLine) {
  // Nếu đã có số cược, tách phần đài ra
  if (/\d/.test(stationLine) && !stationLine.match(/^\d+d/)) {
    const stationPart = extractStationPart(stationLine);
    return stationPart;
  }

  // Xử lý đài ghép không đúng định dạng
  const stationText = stationLine.trim().toLowerCase();

  // Tìm các mẫu đài ghép không dùng dấu phân cách
  for (const station1 of defaultStations) {
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      for (const station2 of defaultStations) {
        // Không xét ghép giữa đài với chính nó
        if (station1.name === station2.name) continue;

        for (const alias2 of [
          station2.name.toLowerCase(),
          ...station2.aliases,
        ]) {
          // Tìm các mẫu ghép liền không dấu phân cách
          if (stationText === alias1 + alias2) {
            return `${alias1}.${alias2}`;
          }
        }
      }
    }
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
  return stationLine;
}

/**
 * Lấy ngày hiện tại trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {number} Ngày trong tuần
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
 * Chuẩn hóa dòng cược
 * @param {string} line - Dòng cược
 * @returns {string} Dòng cược đã chuẩn hóa
 */
function formatBetLine(line) {
  // Bước 1: Xác định kiểu cược và tiền cược (thường ở cuối dòng)
  const betTypeAndAmountMatch = line.match(/([a-z]+)(\d+(?:[,.]\d+)?)$/i);

  if (!betTypeAndAmountMatch) {
    // Không tìm thấy kiểu cược + tiền, giữ nguyên dòng
    return line;
  }

  const betTypeAndAmount = betTypeAndAmountMatch[0];
  const numbersPart = line.substring(0, line.length - betTypeAndAmount.length);

  // Bước 2: Chuẩn hóa phần số cược
  // Loại bỏ khoảng trắng
  let normalizedNumbers = numbersPart.trim();

  // Thay thế các dấu phân cách không chuẩn bằng dấu chấm
  normalizedNumbers = normalizedNumbers.replace(/[,\- ]+/g, ".");

  // Loại bỏ các dấu chấm dư thừa/liên tiếp
  normalizedNumbers = normalizedNumbers.replace(/\.{2,}/g, ".");
  normalizedNumbers = normalizedNumbers.replace(/^\.|\.$/g, "");

  // Bước 3: Phân tích các dãy số liền nhau
  // Xác định chữ số cần xử lý (2 hoặc 3)
  const digitLength = determineDigitLength(normalizedNumbers);

  // Xử lý các trường hợp số không có dấu phân cách
  const noSeparatorPattern = new RegExp(
    `(\\d{${digitLength * 2},}(?!\\d*[a-z]))`,
    "g"
  );
  const noSeparatorMatch = normalizedNumbers.match(noSeparatorPattern);

  if (noSeparatorMatch) {
    for (const match of noSeparatorMatch) {
      // Phân tích thành từng cụm theo độ dài số
      const chunks = [];

      for (let i = 0; i < match.length; i += digitLength) {
        if (i + digitLength <= match.length) {
          chunks.push(match.substr(i, digitLength));
        }
      }

      const replaced = chunks.join(".");
      normalizedNumbers = normalizedNumbers.replace(match, replaced);
    }
  }

  // Bước 4: Xử lý trường hợp nhiều kiểu cược trên cùng dãy số
  // Ví dụ: 93.97da0,5.dd5 -> 93.97da0.5dd5
  let betTypePart = betTypeAndAmount.replace(
    /([a-z]+)(\d+(?:[,.]\d+)?)[.,]([a-z]+)(\d+(?:[,.]\d+)?)/g,
    "$1$2$3$4"
  );

  // Chuẩn hóa định dạng tiền cược
  betTypePart = betTypePart.replace(/(\d+),(\d+)/g, "$1.$2");

  // Xử lý kiểu cược không chuẩn
  betTypePart = betTypePart.replace(/xcdui/g, "xcduoi");

  // Kết hợp lại thành dòng cược đã chuẩn hóa
  return normalizedNumbers + betTypePart;
}

/**
 * Xác định độ dài chữ số phổ biến trong chuỗi số
 * @param {string} numbersStr - Chuỗi chứa các số
 * @returns {number} Độ dài chữ số (2 hoặc 3)
 */
function determineDigitLength(numbersStr) {
  // Tách các số
  const numbers = numbersStr.split(".").filter((n) => /^\d+$/.test(n));

  // Đếm số lượng số có 2 chữ số và 3 chữ số
  let twoDigitCount = 0;
  let threeDigitCount = 0;

  for (const num of numbers) {
    if (num.length === 2) twoDigitCount++;
    else if (num.length === 3) threeDigitCount++;
  }

  // Nếu có nhiều số 3 chữ số hơn, trả về 3, ngược lại trả về 2
  return threeDigitCount > twoDigitCount ? 3 : 2;
}

/**
 * Tạo mã cược chuẩn từ các thành phần
 * @param {string} station - Đài
 * @param {Array} lines - Các dòng cược
 * @returns {string} Mã cược chuẩn
 */
export function createStandardBetCode(station, lines = []) {
  if (!station) return "";

  const formattedStation = formatStation(station);
  const formattedLines = lines.map((line) => formatBetLine(line));

  return [formattedStation, ...formattedLines].join("\n");
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

  // Thêm các dòng còn lại
  betLines = [...betLines, ...lines.slice(1)];

  return {
    station,
    lines: betLines,
  };
}

/**
 * Tìm và gợi ý sửa lỗi cú pháp mã cược
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Các gợi ý sửa lỗi
 */
export function suggestBetCodeFixes(betCode) {
  const suggestions = [];

  // Kiểm tra đài ghép không đúng định dạng
  const decomposed = decomposeBetCode(betCode);
  const stationText = decomposed.station.trim().toLowerCase();

  // Tìm các mẫu đài ghép không dùng dấu phân cách
  for (const station1 of defaultStations) {
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      for (const station2 of defaultStations) {
        // Không xét ghép giữa đài với chính nó
        if (station1.name === station2.name) continue;

        for (const alias2 of [
          station2.name.toLowerCase(),
          ...station2.aliases,
        ]) {
          // Tìm các mẫu ghép liền không dấu phân cách
          if (stationText === alias1 + alias2) {
            suggestions.push({
              type: "STATION_FORMAT",
              message: `Đài ghép "${stationText}" nên được viết là "${alias1}.${alias2}" (có dấu chấm ở giữa)`,
              original: stationText,
              suggested: `${alias1}.${alias2}`,
            });
            break;
          }
        }
      }
    }
  }

  // Kiểm tra đài viết tắt gây nhầm lẫn
  if (stationText === "dn") {
    suggestions.push({
      type: "AMBIGUOUS_STATION",
      message: `"dn" có thể là Đồng Nai (dnai) hoặc Đà Nẵng (dnang), nên sử dụng tên đầy đủ hơn`,
      original: "dn",
      suggested: ["dnai", "dnang"],
    });
  }

  if (stationText === "dt") {
    suggestions.push({
      type: "AMBIGUOUS_STATION",
      message: `"dt" có thể là Đồng Tháp (dthap) hoặc 'đài trung' (dtrung), nên sử dụng tên đầy đủ hơn`,
      original: "dt",
      suggested: ["dthap", "dtrung"],
    });
  }

  // Kiểm tra định dạng số cược
  for (const line of decomposed.lines) {
    // Tìm các trường hợp số liền nhau không có dấu phân cách
    const noSeparatorMatch = line.match(/(\d{2,}(?!\d*[a-z]))(?=\d{2,})/g);
    if (noSeparatorMatch) {
      for (const match of noSeparatorMatch) {
        // Phân tích thành từng cụm 2-3 chữ số
        const chunkSize = match.length % 2 === 0 ? 2 : 3;
        const chunks = [];

        for (let i = 0; i < match.length; i += chunkSize) {
          chunks.push(match.substr(i, chunkSize));
        }

        const replaced = chunks.join(".");

        suggestions.push({
          type: "NUMBER_FORMAT",
          message: `Dãy số "${match}" nên được phân tách bằng dấu chấm: "${replaced}"`,
          original: match,
          suggested: replaced,
        });
      }
    }

    // Tìm các kiểu cược không chuẩn
    const nonStandardBetTypes = line.match(/xcdui/g);
    if (nonStandardBetTypes) {
      suggestions.push({
        type: "BET_TYPE_FORMAT",
        message: `Kiểu cược "xcdui" nên được viết là "xcduoi"`,
        original: "xcdui",
        suggested: "xcduoi",
      });
    }
  }

  return {
    hasSuggestions: suggestions.length > 0,
    suggestions,
  };
}

export default {
  formatBetCode,
  createStandardBetCode,
  decomposeBetCode,
  suggestBetCodeFixes,
};
