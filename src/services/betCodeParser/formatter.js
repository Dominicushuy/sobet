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

  // QUAN TRỌNG: Để xử lý nhiều đài, chúng ta cần lặp qua từng dòng và
  // kiểm tra xem dòng đó có phải là đài mới hay không

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].trim();

    // NEW: Xử lý trường hợp đặc biệt - một dòng có cả đài và mã cược
    // Ví dụ: "mb 01.02.03b1" -> "mb\n01.02.03b1"
    const spaceParts = lineText.split(/\s+/);
    if (spaceParts.length >= 2) {
      const potentialStation = spaceParts[0].toLowerCase();

      // Kiểm tra nếu phần đầu tiên là đài hợp lệ
      if (isStationOnlyLine(potentialStation)) {
        // Lấy phần còn lại (không dùng split để đảm bảo lấy chính xác)
        const restOfText = lineText.substring(potentialStation.length).trim();

        // Kiểm tra nếu phần còn lại có số và có thể là mã cược
        if (/\d/.test(restOfText)) {
          // Tách thành hai dòng riêng biệt
          formattedLines.push(potentialStation);

          // Format the bet line, which might result in multiple lines
          const formattedBetLines = formatBetLine(restOfText);
          if (formattedBetLines.includes("\n")) {
            // If formatBetLine returned multiple lines, add each one
            formattedBetLines.split("\n").forEach((line) => {
              formattedLines.push(line);
            });
          } else {
            formattedLines.push(formattedBetLines);
          }
          continue;
        }
      }
    }

    // Xử lý logic hiện tại nếu không phải trường hợp đặc biệt
    if (isStationOnlyLine(lineText)) {
      const formattedStation = formatStation(lineText);
      formattedLines.push(formattedStation);
    } else {
      // Nếu không phải là dòng đài, xử lý như dòng cược
      const formattedLine = formatBetLine(lineText);
      if (formattedLine.includes("\n")) {
        // If formatBetLine returned multiple lines, add each one
        formattedLine.split("\n").forEach((line) => {
          formattedLines.push(line);
        });
      } else {
        formattedLines.push(formattedLine);
      }
    }
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
  // 1. Kiểm tra các mẫu đài nhiều miền (vd: 2dmn, 3dmt)
  if (/^\d+d(mn|mt|n|t|nam|trung)$/i.test(cleanLine)) {
    return true;
  }

  // 2. Kiểm tra tên đài đơn lẻ
  for (const station of defaultStations) {
    if (
      station.name.toLowerCase() === cleanLine ||
      station.aliases.some((alias) => alias === cleanLine)
    ) {
      return true;
    }
  }

  // 3. Kiểm tra mẫu "mb", "mt", "mn" và biến thể của chúng
  if (/^(mb|mt|mn|mienbac|mientrung|miennam|hanoi|hn)$/i.test(cleanLine)) {
    return true;
  }

  // 4. Kiểm tra nếu là tổ hợp các đài (vd: vl.ct, dn.hue)
  if (cleanLine.includes(".")) {
    const parts = cleanLine.split(".");
    return parts.every((part) =>
      defaultStations.some(
        (station) =>
          station.name.toLowerCase() === part ||
          station.aliases.some((alias) => alias === part)
      )
    );
  }

  return false;
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

  // Sửa lỗi "xcdui" thành "duoi"
  normalizedLine = normalizedLine.replace(/xcdui/g, "duoi");

  // Sửa lỗi "xcduoi" thành "duoi"
  normalizedLine = normalizedLine.replace(/xcduoi/g, "duoi");

  // Sửa lỗi "xcd" thành "dau"
  normalizedLine = normalizedLine.replace(/xcd(?!\w)/g, "dau");

  // Sửa lỗi "xcdau" thành "dau"
  normalizedLine = normalizedLine.replace(/xcdau/g, "dau");

  // Sửa lỗi "dui" thành "duoi"
  normalizedLine = normalizedLine.replace(/(\b|[^a-z])dui(\d+|$)/g, "$1duoi$2");

  // Loại bỏ khoảng trắng giữa kiểu cược và số tiền
  normalizedLine = normalizedLine.replace(
    /([a-z]+)\s+(\d+(?:[,.]\d+)?)/gi,
    "$1$2"
  );

  // Preprocessor: Remove trailing 'n' from amount directly
  normalizedLine = normalizedLine.replace(
    /([a-z]+\d+(?:[,.]\d+)?)n(\s|$|\n)/gi,
    "$1$2"
  );

  // console.log("Normalized line after initial replacements:", normalizedLine);

  // Special handling for đá pattern with concatenated pairs - MUST BE BEFORE REPLACING COMMA
  if (normalizedLine.includes("da")) {
    const daBetPattern = /^([\d.]+)da(\d+(?:[,.n]\d+)?)$/i;
    const match = normalizedLine.match(daBetPattern);

    if (match) {
      const [_, numbersSection, amount] = match;
      const numberGroups = numbersSection.split(".");

      // Check if any number group is a concatenation (4 or more digits)
      const hasGroupedNumbers = numberGroups.some(
        (group) => group.length >= 4 && group.length % 2 === 0
      );

      if (hasGroupedNumbers) {
        // Array to collect formatted lines
        const formattedLines = [];

        // Process each number group
        for (const group of numberGroups) {
          if (group.length >= 4 && group.length % 2 === 0) {
            // Split the group into pairs and create a new line
            const pairs = [];
            for (let i = 0; i < group.length; i += 2) {
              pairs.push(group.substring(i, i + 2));
            }
            formattedLines.push(`${pairs.join(".")}da${amount}`);
          } else {
            // For non-concatenated numbers or odd-length numbers, keep as is
            formattedLines.push(`${group}da${amount}`);
          }
        }

        // Join all formatted lines
        if (formattedLines.length > 0) {
          return formattedLines.join("\n");
        }
      }
    }
  }

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
        // Loại bỏ chữ 'n' ở cuối nếu có và chuẩn hóa số tiền (đổi dấu , thành .)
        const cleanAmount = amount ? amount.replace(/n$/i, "") : "10";
        const normalizedAmount = cleanAmount.replace(/,/g, ".");
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

export default {
  formatBetCode,
  decomposeBetCode,
};
