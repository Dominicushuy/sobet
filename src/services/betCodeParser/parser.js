// src/services/betCodeParser/parser.js
import { defaultStations, defaultBetTypes } from "@/config/defaults";

/**
 * Phân tích mã cược đầu vào
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Kết quả phân tích
 */
export function parseBetCode(betCode) {
  try {
    if (!betCode || typeof betCode !== "string") {
      return { success: false, errors: [{ message: "Mã cược không hợp lệ" }] };
    }

    // Chuẩn hóa mã cược
    const normalizedBetCode = betCode.trim().toLowerCase();

    // Phân tách các dòng
    const lines = normalizedBetCode
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      return { success: false, errors: [{ message: "Mã cược trống" }] };
    }

    // Xác định đài từ dòng đầu tiên
    const station = parseStation(lines[0]);
    if (!station.success) {
      return {
        success: false,
        errors: [{ message: `Không thể xác định đài: ${station.error}` }],
      };
    }

    // Nếu chỉ có 1 dòng và không có số cược, có thể người dùng chỉ đang thử chọn đài
    if (lines.length === 1 && !containsNumbersOrBetTypes(lines[0])) {
      return {
        success: true,
        station: station.data,
        lines: [],
        message: "Đã xác định đài, chưa có số cược",
      };
    }

    // Phân tích từng dòng còn lại
    const parsedLines = [];
    let hasValidLine = false;

    // Bắt đầu từ dòng thứ 2 hoặc dòng 1 nếu dòng 1 chứa cả đài và số cược
    const startIndex = containsNumbersOrBetTypes(lines[0]) ? 0 : 1;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue;

      // Nếu dòng đầu tiên chứa cả đài và số cược, cần tách thành đài và phần số cược
      let lineToParse = line;
      if (i === 0 && startIndex === 0) {
        // Tách phần đài và phần số cược
        const stationPart = extractStationPart(line);
        const betPart = line.substring(stationPart.length).trim();
        lineToParse = betPart;
      }

      // Phân tích dòng
      const parsedLine = parseBetLine(lineToParse, station.data);
      parsedLine.originalLine = line;
      parsedLine.lineIndex = i;

      parsedLines.push(parsedLine);
      if (parsedLine.valid) {
        hasValidLine = true;
      }
    }

    if (parsedLines.length === 0) {
      return {
        success: false,
        errors: [{ message: "Không tìm thấy số cược" }],
      };
    }

    return {
      success: true,
      station: station.data,
      lines: parsedLines,
      hasValidLine,
    };
  } catch (error) {
    console.error("Lỗi khi phân tích mã cược:", error);
    return {
      success: false,
      errors: [{ message: `Lỗi phân tích mã cược: ${error.message}` }],
    };
  }
}

/**
 * Kiểm tra xem dòng có chứa số hoặc kiểu cược hay không
 */
function containsNumbersOrBetTypes(line) {
  // Regex kiểm tra xem có số nào trong dòng hay không
  const hasNumbers = /\d/.test(line);

  // Kiểm tra xem có kiểu cược nào xuất hiện không
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  const hasBetType = betTypeAliases.some(
    (alias) => line.includes(alias) && !isPartOfStationName(alias, line)
  );

  return hasNumbers || hasBetType;
}

/**
 * Kiểm tra xem một alias có phải là một phần của tên đài
 */
function isPartOfStationName(alias, line) {
  for (const station of defaultStations) {
    if (
      station.aliases.some(
        (stationAlias) =>
          stationAlias.includes(alias) && line.includes(stationAlias)
      )
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Trích xuất phần đài từ một dòng
 */
function extractStationPart(line) {
  // Tìm vị trí của số đầu tiên hoặc kiểu cược
  let index = line.length;

  // Tìm vị trí số đầu tiên
  const numberMatch = line.match(/\d/);
  if (numberMatch) {
    index = Math.min(index, line.indexOf(numberMatch[0]));
  }

  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  for (const alias of betTypeAliases) {
    const aliasPos = line.indexOf(alias);
    if (aliasPos !== -1 && !isPartOfStationName(alias, line)) {
      index = Math.min(index, aliasPos);
    }
  }

  return line.substring(0, index).trim();
}

/**
 * Phân tích thông tin đài từ chuỗi
 * @param {string} stationString - Chuỗi chứa thông tin đài
 * @returns {object} Kết quả phân tích đài
 */
function parseStation(stationString) {
  const stationText = stationString.trim().toLowerCase();

  // Trường hợp đặc biệt: chuỗi chứa cả số, có thể là đài + số cược
  if (/\d/.test(stationText)) {
    // Kiểm tra đặc biệt cho đài nhiều miền trước
    const multipleStationMatch = stationText.match(
      /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung|mien nam|mien trung|miền nam|miền trung)/i
    );

    if (multipleStationMatch) {
      const count = parseInt(multipleStationMatch[1], 10);
      // Xác định miền dựa trên chuỗi phù hợp
      const regionPart = multipleStationMatch[2].toLowerCase();
      const isSouthern =
        regionPart === "dmn" ||
        regionPart === "dn" ||
        regionPart === "dnam" ||
        regionPart === "mn" ||
        regionPart === "mnam" ||
        regionPart === "mien nam" ||
        regionPart === "miền nam";

      const region = isSouthern ? "south" : "central";

      return {
        success: true,
        data: {
          name: region === "south" ? "Miền Nam" : "Miền Trung",
          region,
          count,
          multiStation: true,
        },
      };
    }

    // Trích xuất phần đài cho các trường hợp khác
    const stationPart = extractStationPart(stationText);
    return parseStation(stationPart);
  }

  // Kiểm tra đài miền Bắc
  const northStation = defaultStations.find(
    (s) =>
      s.region === "north" &&
      (s.name.toLowerCase() === stationText ||
        s.aliases.some((a) => stationText === a))
  );

  if (northStation) {
    return {
      success: true,
      data: {
        name: northStation.name,
        region: "north",
        isMultiStation: false,
      },
    };
  }

  // Kiểm tra đài miền Nam/Trung nhiều đài
  const multipleStationMatch = stationText.match(
    /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung)/i
  );

  if (multipleStationMatch) {
    const count = parseInt(multipleStationMatch[1], 10);
    // Xác định miền dựa trên chuỗi phù hợp
    const regionPart = multipleStationMatch[2].toLowerCase();
    const isSouthern =
      regionPart === "dmn" ||
      regionPart === "dn" ||
      regionPart === "dnam" ||
      regionPart === "mn" ||
      regionPart === "mnam";

    const region = isSouthern ? "south" : "central";

    return {
      success: true,
      data: {
        name: region === "south" ? "Miền Nam" : "Miền Trung",
        region,
        count,
        multiStation: true,
      },
    };
  }

  // Kiểm tra đài miền Nam/Trung
  const southCentralAliases = {
    mn: "south",
    dmn: "south",
    dn: "south",
    dnam: "south",
    miennam: "south",
    "mien nam": "south",
    "miền nam": "south",
    "đài nam": "south",
    "đài miền nam": "south",
    mnam: "south",
    mt: "central",
    dmt: "central",
    dt: "central",
    dtrung: "central",
    mientrung: "central",
    "mien trung": "central",
    "miền trung": "central",
    "đài trung": "central",
    "đài miền trung": "central",
    mtrung: "central",
  };

  if (southCentralAliases[stationText]) {
    return {
      success: true,
      data: {
        name:
          southCentralAliases[stationText] === "south"
            ? "Miền Nam"
            : "Miền Trung",
        region: southCentralAliases[stationText],
        multiStation: true,
        count: 1, // Mặc định là 1 nếu không chỉ định
      },
    };
  }

  // Kiểm tra nhiều đài cụ thể
  if (
    stationText.includes(".") ||
    stationText.includes(",") ||
    stationText.includes(" ")
  ) {
    const stationParts = stationText.split(/[., ]+/).filter(Boolean);
    if (stationParts.length > 1) {
      const stationObjects = [];
      let regionType = null;

      for (const part of stationParts) {
        const station = findStationByAlias(part);
        if (station) {
          // Kiểm tra xem các đài có cùng miền không
          if (regionType === null) {
            regionType = station.region;
          }

          stationObjects.push({
            name: station.name,
            region: station.region,
          });
        }
      }

      if (stationObjects.length > 0) {
        return {
          success: true,
          data: {
            stations: stationObjects,
            region: regionType || "south", // Mặc định là miền Nam nếu không xác định được
            multiStation: false,
          },
        };
      }
    }
  }

  // Kiểm tra đài đơn lẻ
  const station = findStationByAlias(stationText);
  if (station) {
    return {
      success: true,
      data: {
        name: station.name,
        region: station.region,
        multiStation: false,
      },
    };
  }

  // Không tìm thấy đài phù hợp
  return {
    success: false,
    error: `Không tìm thấy đài phù hợp với "${stationText}"`,
  };
}

/**
 * Tìm đài dựa trên alias
 */
function findStationByAlias(alias) {
  return defaultStations.find(
    (s) => s.name.toLowerCase() === alias || s.aliases.some((a) => a === alias)
  );
}

/**
 * Phân tích dòng cược
 * @param {string} line - Dòng cược
 * @param {object} station - Thông tin đài
 * @returns {object} Kết quả phân tích dòng cược
 */
function parseBetLine(line, station) {
  const result = {
    valid: false,
    numbers: [],
    amount: 0,
    betType: null,
    originalLine: line,
  };

  try {
    // Chuẩn hóa dấu phân cách
    let normalizedLine = line.replace(/[,\- ]/g, ".");

    // Phân tích
    const numbers = [];
    let currentNumber = "";
    let currentBetType = "";
    let currentAmount = "";
    let parsingState = "number"; // Trạng thái phân tích: 'number', 'betType', 'amount'

    for (let i = 0; i < normalizedLine.length; i++) {
      const char = normalizedLine[i];

      if (char === ".") {
        // Kết thúc một phần
        if (parsingState === "number" && currentNumber) {
          // Thêm số hiện tại vào danh sách
          const processedNumbers = processNumber(currentNumber, station);
          numbers.push(...processedNumbers);
          currentNumber = "";
        } else if (parsingState === "betType" && currentBetType) {
          // Đã có kiểu cược, nhưng gặp dấu chấm, có thể có nhiều kiểu cược
          result.betType = identifyBetType(currentBetType);
          currentBetType = "";
          parsingState = "number";
        }
      } else if (/[0-9]/.test(char)) {
        // Ký tự số
        if (parsingState === "number" || parsingState === "amount") {
          if (parsingState === "betType" && currentBetType) {
            // Chuyển từ betType sang amount
            result.betType = identifyBetType(currentBetType);
            currentBetType = "";
            parsingState = "amount";
          }

          if (
            parsingState === "number" &&
            hasCompleteBetTypeAndAmount(normalizedLine, i)
          ) {
            // Nếu phía sau có đủ kiểu cược và số tiền, kết thúc số hiện tại
            if (currentNumber) {
              const processedNumbers = processNumber(currentNumber, station);
              numbers.push(...processedNumbers);
              currentNumber = "";
            }
            // Chuyển sang phân tích kiểu cược
            parsingState = "betType";
            currentBetType += char;
          } else if (parsingState === "amount") {
            currentAmount += char;
          } else {
            currentNumber += char;
          }
        } else {
          // Trong kiểu cược, có thể là phần của kiểu cược hoặc số tiền
          if (isBetTypeOrAmount(currentBetType + char)) {
            currentBetType += char;
          } else {
            // Chuyển sang phân tích số tiền
            result.betType = identifyBetType(currentBetType);
            currentBetType = "";
            parsingState = "amount";
            currentAmount += char;
          }
        }
      } else if (char === "/" || char === "k") {
        // Ký tự đặc biệt trong số
        if (parsingState === "number") {
          currentNumber += char;
        } else if (parsingState === "betType") {
          currentBetType += char;
        }
      } else if (isAlphabetChar(char)) {
        // Ký tự chữ cái - có thể là phần của kiểu cược hoặc là phần của kéo
        if (
          parsingState === "number" &&
          (currentNumber.includes("/") || char === "k")
        ) {
          // Đang phân tích "kéo" hoặc các ký tự đặc biệt khác trong số
          currentNumber += char;
        } else {
          // Chuyển sang kiểu cược
          if (parsingState === "number" && currentNumber) {
            const processedNumbers = processNumber(currentNumber, station);
            numbers.push(...processedNumbers);
            currentNumber = "";
          }

          parsingState = "betType";
          currentBetType += char;
        }
      } else if (char === ",") {
        // Dấu phẩy có thể dùng trong số tiền
        if (parsingState === "amount") {
          currentAmount += char;
        }
      } else if (char === "n" && parsingState === "amount") {
        // Ký tự 'n' trong số tiền (nghìn)
        // Không thêm gì, bỏ qua
      }
    }

    // Xử lý phần cuối
    if (parsingState === "number" && currentNumber) {
      const processedNumbers = processNumber(currentNumber, station);
      numbers.push(...processedNumbers);
    } else if (parsingState === "betType" && currentBetType) {
      result.betType = identifyBetType(currentBetType);
    } else if (parsingState === "amount" && currentAmount) {
      result.amount = parseAmount(currentAmount);
    }

    // Nếu vẫn chưa có kiểu cược, thử phân tích lại xem có vô tình bỏ qua không
    if (!result.betType && numbers.length > 0) {
      // Tìm kiểu cược ở cuối dòng
      const betTypeMatch = normalizedLine.match(/([a-z]+)(\d+(?:[,.]\d+)?)?$/i);
      if (betTypeMatch) {
        const potentialBetType = betTypeMatch[1].toLowerCase();
        const betType = identifyBetType(potentialBetType);

        if (betType) {
          result.betType = betType;

          // Nếu có số tiền
          if (betTypeMatch[2]) {
            result.amount = parseAmount(betTypeMatch[2]);
          }
        }
      }
    }

    // Đảm bảo không có số trùng lặp
    result.numbers = Array.from(new Set(numbers));

    // Kiểm tra tính hợp lệ
    result.valid =
      result.numbers.length > 0 && result.betType && result.amount > 0;

    return result;
  } catch (error) {
    console.error("Lỗi khi phân tích dòng cược:", error, line);
    return {
      ...result,
      error: `Lỗi phân tích: ${error.message}`,
    };
  }
}

/**
 * Kiểm tra xem chuỗi từ vị trí hiện tại có đủ thông tin cho kiểu cược và số tiền không
 */
function hasCompleteBetTypeAndAmount(line, currentPos) {
  // Tìm kiểu cược ở phần còn lại của dòng
  const remainingLine = line.substring(currentPos);
  const betTypePattern = defaultBetTypes
    .flatMap((bt) => bt.aliases)
    .sort((a, b) => b.length - a.length) // Sắp xếp theo độ dài để tối ưu matching
    .join("|");

  const betTypeRegex = new RegExp(
    `(${betTypePattern})\\d+(?:[,.n]\\d+)?$`,
    "i"
  );
  return betTypeRegex.test(remainingLine);
}

/**
 * Kiểm tra xem chuỗi có thể là kiểu cược hoặc số tiền hay không
 */
function isBetTypeOrAmount(text) {
  // Kiểm tra nếu là kiểu cược
  const isBetType = defaultBetTypes.some((bt) =>
    bt.aliases.some((alias) => alias.startsWith(text.toLowerCase()))
  );

  // Hoặc kiểm tra nếu thuộc kiểu số liệu
  return isBetType || /^[0-9,.]+$/.test(text);
}

/**
 * Phân tích số tiền cược
 */
function parseAmount(amountString) {
  // Loại bỏ ký tự không phải số hoặc dấu phân cách thập phân
  let cleaned = amountString.replace(/[^0-9,.]/g, "");

  // Tiêu chuẩn hóa dấu phân cách thập phân
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }

  // Chuyển đổi sang số
  const amount = parseFloat(cleaned);

  // Nếu số nhỏ hơn 100, coi như đơn vị nghìn
  return amount < 100 ? amount * 1000 : amount;
}

/**
 * Xác định kiểu cược từ chuỗi
 */
function identifyBetType(betTypeString) {
  const normalized = betTypeString.toLowerCase();

  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      if (normalized === alias) {
        return {
          id: betType.name,
          name: betType.name,
          alias: alias,
        };
      }
    }
  }

  return null;
}

/**
 * Xử lý chuỗi số cược và chuyển đổi thành mảng số
 */
function processNumber(numberString, station) {
  // Xử lý kéo: 10/20keo90
  const keoMatch = numberString.match(/^(\d+)\/(\d+)(?:keo|k)(\d+)$/);
  if (keoMatch) {
    const start = parseInt(keoMatch[1], 10);
    const next = parseInt(keoMatch[2], 10);
    const end = parseInt(keoMatch[3], 10);

    const step = next - start;
    if (step <= 0) return [];

    const numbers = [];
    for (let i = start; i <= end; i += step) {
      numbers.push(i.toString().padStart(Math.max(2, keoMatch[1].length), "0"));
    }
    return numbers;
  }

  // Xử lý các từ khóa đặc biệt
  const specialKeywords = {
    tai: generateTaiNumbers(),
    xiu: generateXiuNumbers(),
    chan: generateChanNumbers(),
    le: generateLeNumbers(),
    chanchan: generateChanChanNumbers(),
    lele: generateLeLeNumbers(),
    chanle: generateChanLeNumbers(),
    lechan: generateLeChanNumbers(),
  };

  if (specialKeywords[numberString]) {
    return specialKeywords[numberString];
  }

  // Trường hợp bình thường
  return [numberString];
}

/**
 * Kiểm tra xem ký tự có phải là chữ cái hay không
 */
function isAlphabetChar(char) {
  return /[a-z]/i.test(char);
}

/**
 * Tạo danh sách số tài (50-99)
 */
function generateTaiNumbers() {
  const numbers = [];
  for (let i = 50; i <= 99; i++) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số xỉu (00-49)
 */
function generateXiuNumbers() {
  const numbers = [];
  for (let i = 0; i <= 49; i++) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn (00, 02, 04, ..., 98)
 */
function generateChanNumbers() {
  const numbers = [];
  for (let i = 0; i <= 98; i += 2) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ (01, 03, 05, ..., 99)
 */
function generateLeNumbers() {
  const numbers = [];
  for (let i = 1; i <= 99; i += 2) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn chẵn (00, 02, 04, ..., 88)
 */
function generateChanChanNumbers() {
  const numbers = [];
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ lẻ (11, 13, 15, ..., 99)
 */
function generateLeLeNumbers() {
  const numbers = [];
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn lẻ (01, 03, 05, ..., 89)
 */
function generateChanLeNumbers() {
  const numbers = [];
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ chẵn (10, 12, 14, ..., 98)
 */
function generateLeChanNumbers() {
  const numbers = [];
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}
