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

    // Phân tích từng dòng còn lại
    const parsedLines = [];
    let hasValidLine = false;

    // Kiểm tra xem dòng đầu tiên có chứa cả đài và số cược không
    const stationPart = extractStationPart(lines[0]);
    const hasBetInfo =
      stationPart.length < lines[0].length && !isStationOnly(lines[0]);

    // Xử lý phần số cược từ dòng đầu nếu có
    if (hasBetInfo) {
      const betPart = lines[0].substring(stationPart.length).trim();
      if (betPart) {
        const parsedLine = parseBetLine(betPart, station.data);
        parsedLine.originalLine = lines[0];
        parsedLine.lineIndex = 0;

        parsedLines.push(parsedLine);
        if (parsedLine.valid) {
          hasValidLine = true;
        }
      }
    }

    // Xử lý các dòng còn lại (bắt đầu từ dòng 1)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue;

      // Bỏ qua các dòng chỉ chứa tên đài
      if (isStationLine(line)) {
        continue;
      }

      // Phân tích dòng
      const parsedLine = parseBetLine(line, station.data);
      parsedLine.originalLine = line;
      parsedLine.lineIndex = i;

      parsedLines.push(parsedLine);
      if (parsedLine.valid) {
        hasValidLine = true;
      }
    }

    // Nếu chỉ có 1 dòng và không có số cược, có thể người dùng chỉ đang thử chọn đài
    if (lines.length === 1 && parsedLines.length === 0) {
      return {
        success: false, // Thay đổi từ true thành false
        station: station.data,
        lines: [],
        message: "Đã xác định đài, chưa có số cược",
        errors: [{ message: "Vui lòng thêm thông tin cược sau tên đài" }],
      };
    }

    if (parsedLines.length === 0) {
      return {
        success: false,
        errors: [{ message: "Không tìm thấy số cược" }],
      };
    }

    return {
      success: hasValidLine, // Chỉ trả về true khi có ít nhất một dòng cược hợp lệ
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
 * Kiểm tra xem dòng có phải là dòng chỉ chứa tên đài không
 */
function isStationLine(line) {
  // Loại bỏ dấu chấm cuối
  const cleanLine = line.replace(/\.+$/, "").trim();

  // Kiểm tra xem dòng có phải là tên đài không
  return defaultStations.some(
    (station) =>
      station.name.toLowerCase() === cleanLine ||
      station.aliases.some((alias) => alias === cleanLine)
  );
}

/**
 * Kiểm tra xem dòng có phải chỉ chứa thông tin đài không (không có thông tin cược)
 */
function isStationOnly(line) {
  // Kiểm tra các mẫu đài miền nhiều đài (vd: 2dmn, 3mt)
  const multiStationPattern = /^\d+d(mn|mt|n|t|nam|trung)$/i;
  if (multiStationPattern.test(line)) {
    return true;
  }

  // Kiểm tra tên đài đơn lẻ
  if (isStationLine(line)) {
    return true;
  }

  // Kiểm tra mẫu "mb", "mt", "mn" và biến thể của chúng
  const regionPattern = /^(mb|mt|mn|mienbac|mientrung|miennam|hanoi|hn)$/i;
  if (regionPattern.test(line)) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra xem dòng có chứa số hoặc kiểu cược hay không
 */
function containsNumbersOrBetTypes(line) {
  // Regex kiểm tra xem có số nào trong dòng hay không
  const hasNumbers = /\d/.test(line);

  // Kiểm tra xem có kiểu cược nào xuất hiện không
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);

  // Cải tiến: Chỉ kiểm tra nếu alias là từ hoàn chỉnh hoặc theo sau bởi số
  // Tránh trường hợp line "mb" có chứa alias "b"
  const hasBetType = betTypeAliases.some((alias) => {
    // Sử dụng regex để kiểm tra nếu alias là một từ hoàn chỉnh hoặc theo sau bởi số
    const pattern = new RegExp(`\\b${alias}\\b|\\b${alias}\\d+`, "i");
    return pattern.test(line) && !isPartOfStationName(alias, line);
  });

  // Kiểm tra đặc biệt cho mẫu đài nhiều miền như "2dmn"
  const isMultiStationPattern = /^\d+d(mn|mt|n|t)/i;
  if (isMultiStationPattern.test(line)) {
    return false; // Đây là đài, không phải số cược
  }

  return hasNumbers || hasBetType;
}

/**
 * Kiểm tra xem một alias có phải là một phần của tên đài
 */
function isPartOfStationName(alias, line) {
  // Kiểm tra nếu line chính là một tên đài/alias của đài
  const isLineExactlyStation = defaultStations.some(
    (station) =>
      station.name.toLowerCase() === line.trim().toLowerCase() ||
      station.aliases.some((a) => a === line.trim().toLowerCase())
  );

  // Nếu line chính xác là tên đài, trả về true cho bất kỳ alias nào
  if (isLineExactlyStation) {
    return true;
  }

  // Ngược lại kiểm tra nếu alias là một phần của tên đài
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

  // Xử lý đặc biệt cho trường hợp như "2dmn"
  const multiStationMatch = line.match(
    /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung)/i
  );
  if (multiStationMatch) {
    return line;
  }

  // Tìm vị trí số đầu tiên
  const numberMatch = line.match(/(?<!\d[a-z])\d/);
  if (numberMatch) {
    index = Math.min(index, numberMatch.index);
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
  // Loại bỏ dấu chấm cuối cùng nếu có
  const stationText = stationString.trim().toLowerCase().replace(/\.+$/, "");

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
        multiStation: false,
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

  // Kiểm tra đài với tên đầy đủ
  for (const station of defaultStations) {
    const fullName = station.name.toLowerCase();
    const fullAliases = station.aliases.map((a) => a.toLowerCase());

    if (
      stationText === fullName ||
      fullAliases.includes(stationText) ||
      stationText.includes(fullName) ||
      fullAliases.some((a) => stationText.includes(a))
    ) {
      return {
        success: true,
        data: {
          name: station.name,
          region: station.region,
          multiStation: false,
        },
      };
    }
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

  // Kiểm tra trường hợp đặc biệt: hai đài ghép liền (không có dấu phân cách)
  const mergedStations = findMergedStations(stationText);
  if (mergedStations.length === 2) {
    return {
      success: true,
      data: {
        stations: mergedStations,
        region: mergedStations[0].region,
        multiStation: false,
      },
    };
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
 * Tìm các đài ghép liền nhau không có dấu phân cách
 * @param {string} text - Chuỗi đài
 * @returns {Array} Danh sách đài tìm thấy
 */
function findMergedStations(text) {
  const foundStations = [];

  // Trường hợp đặc biệt: dnaictho, tp.dongthap
  for (const station1 of defaultStations) {
    // Thử tất cả các alias của đài 1
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      if (text.startsWith(alias1)) {
        const remainingText = text.substring(alias1.length);

        // Tìm đài thứ 2 trong phần còn lại
        for (const station2 of defaultStations) {
          // Không xét ghép giữa đài với chính nó
          if (station1.name === station2.name) continue;

          for (const alias2 of [
            station2.name.toLowerCase(),
            ...station2.aliases,
          ]) {
            if (remainingText === alias2 || remainingText.startsWith(alias2)) {
              foundStations.push({
                name: station1.name,
                region: station1.region,
              });

              foundStations.push({
                name: station2.name,
                region: station2.region,
              });

              return foundStations;
            }
          }
        }
      }
    }
  }

  // Thử tất cả các cách chia chuỗi thành 2 phần
  for (let i = 2; i < text.length - 1; i++) {
    const part1 = text.substring(0, i);
    const part2 = text.substring(i);

    const station1 = findStationByAlias(part1);
    const station2 = findStationByAlias(part2);

    if (station1 && station2) {
      foundStations.push({
        name: station1.name,
        region: station1.region,
      });

      foundStations.push({
        name: station2.name,
        region: station2.region,
      });

      break;
    }
  }

  return foundStations;
}

/**
 * Tìm đài dựa trên alias
 */
function findStationByAlias(alias) {
  if (!alias) return null;

  // Chuyển alias về lowercase để so sánh không phân biệt chữ hoa/thường
  const normalizedAlias = alias.toLowerCase();

  return defaultStations.find(
    (s) =>
      s.name.toLowerCase() === normalizedAlias ||
      s.aliases.some((a) => a === normalizedAlias) ||
      s.aliases.some((a) => normalizedAlias.includes(a))
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
    additionalBetTypes: [],
  };

  try {
    // Chuẩn hóa dấu phân cách: dấu phẩy, dấu gạch ngang, dấu cách đều đổi thành dấu chấm
    let normalizedLine = line.replace(/[,\- ]+/g, ".");

    // Xử lý trường hợp dấu chấm ở đầu dòng
    normalizedLine = normalizedLine.replace(/^\./, "");

    // Kiểm tra nếu có "xcdui" và sửa thành "xcduoi"
    normalizedLine = normalizedLine.replace(/xcdui/g, "xcduoi");
    // Kiểm tra nếu có "dui" và sửa thành "duoi"
    normalizedLine = normalizedLine.replace(
      /(\b|[^a-z])dui(\d+|$)/g,
      "$1duoi$2"
    );

    // Cải tiến: Xử lý các trường hợp đặc biệt

    // 1. Xử lý nhiều kiểu cược trong một dòng (ví dụ: 23.45dd10.dau5)
    const multipleBetTypes = extractMultipleBetTypes(normalizedLine);

    if (multipleBetTypes.length > 1) {
      // Lấy phần số từ đầu dòng
      const numbersPart = extractNumbersPart(normalizedLine);
      let numbers = parseNumbers(numbersPart, station);

      // Xử lý từ khóa đặc biệt như tai, xiu, chanchan, v.v.
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
      let hasSpecialKeyword = false;

      for (const keyword of specialKeywords) {
        if (new RegExp(`\\b${keyword}\\b`, "i").test(numbersPart)) {
          hasSpecialKeyword = true;
          break;
        }
      }

      if (hasSpecialKeyword) {
        // Lưu ý: Hàm processNumber đã xử lý các từ khóa đặc biệt
        numbers = [];
        const parts = numbersPart.split(".");
        for (const part of parts) {
          if (specialKeywords.includes(part)) {
            const specialNumbers = processSpecialKeyword(part);
            numbers.push(...specialNumbers);
          } else if (/^\d+$/.test(part)) {
            numbers.push(part);
          }
        }
      }

      // Kiểm tra và xử lý các số dạng nhóm (1234, 0102, v.v.)
      const processedNumbers = [];
      for (const num of numbers) {
        if (/^\d{4,}$/.test(num) && num.length % 2 === 0) {
          // Phân tách thành các cặp 2 chữ số
          for (let i = 0; i < num.length; i += 2) {
            processedNumbers.push(num.substring(i, i + 2));
          }
        } else {
          processedNumbers.push(num);
        }
      }

      if (processedNumbers.length > 0) {
        result.numbers = processedNumbers;
        result.betType = multipleBetTypes[0].betType;
        result.amount = multipleBetTypes[0].amount;
        result.valid = true;

        // Thêm các kiểu cược bổ sung
        for (let i = 1; i < multipleBetTypes.length; i++) {
          result.additionalBetTypes.push({
            betType: multipleBetTypes[i].betType,
            amount: multipleBetTypes[i].amount,
            numbers: processedNumbers, // Dùng chung danh sách số
          });
        }

        return result;
      }
    }

    // 2. Xử lý số gộp thành nhóm (ví dụ: 1234.5678da1)
    // Kiểm tra xem có số nào có 4 chữ số trở lên không
    const groupedNumberPatterns = normalizedLine.match(/\d{4,}/g);
    if (
      groupedNumberPatterns &&
      groupedNumberPatterns.some((p) => p.length % 2 === 0)
    ) {
      // Tách phần kiểu cược
      const parts = normalizedLine.split(/([a-z]+\d+(?:[,.]\d+)?)/i);

      if (parts.length >= 2) {
        const numbersPart = parts[0];
        const betTypePart = parts[1];

        const betTypeMatch = betTypePart.match(/([a-z]+)(\d+(?:[,.]\d+)?)/i);
        if (betTypeMatch) {
          const betTypeAlias = betTypeMatch[1].toLowerCase();
          const betType = identifyBetType(betTypeAlias);
          const amount = parseAmount(betTypeMatch[2] || "10");

          if (betType) {
            // Phân tích phần số
            const numParts = numbersPart.split(".");
            const processedNumbers = [];

            for (const part of numParts) {
              if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
                // Tách thành các cặp 2 chữ số
                for (let i = 0; i < part.length; i += 2) {
                  processedNumbers.push(part.substring(i, i + 2));
                }
              } else if (/^\d+$/.test(part)) {
                processedNumbers.push(part);
              }
            }

            if (processedNumbers.length > 0) {
              result.numbers = processedNumbers;
              result.betType = betType;
              result.amount = amount;
              result.valid = true;
              return result;
            }
          }
        }
      }
    }

    // Xử lý cách thông thường nếu không phát hiện kiểu cược rõ ràng
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
        // Cải tiến: Kiểm tra kỹ hơn khi gặp ký tự chữ cái
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
 * Trích xuất phần số từ dòng cược
 */
function extractNumbersPart(line) {
  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  let betTypeIndex = line.length;

  for (const alias of betTypeAliases) {
    const regex = new RegExp(`[^a-z]${alias}\\d+`, "i");
    const match = regex.exec(line);
    if (match && match.index < betTypeIndex) {
      betTypeIndex = match.index + 1; // +1 vì regex có [^a-z] ở đầu
      break;
    }
  }

  return line.substring(0, betTypeIndex).trim();
}

/**
 * Phân tích danh sách số từ phần số
 */
function parseNumbers(numbersPart, station) {
  const numbers = [];
  const parts = numbersPart.split(".");

  for (const part of parts) {
    if (part.trim() === "") continue;

    // Xử lý các trường hợp đặc biệt (keo, tai, xiu, ...)
    const processedNumbers = processNumber(part, station);
    numbers.push(...processedNumbers);
  }

  return numbers;
}

/**
 * Trích xuất nhiều kiểu cược từ một dòng
 * @param {string} line - Dòng cược
 * @returns {Array} Danh sách các kiểu cược với số tiền tương ứng
 */
function extractMultipleBetTypes(line) {
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases);
  const result = [];

  // Chuẩn hóa line
  const normalizedLine = line
    .replace(/xcdui/g, "xcduoi")
    .replace(/(\b|[^a-z])dui(\d+|$)/g, "$1duoi$2");

  // Cải tiến: Tạo pattern với word boundary (\b) để đảm bảo tìm đúng kiểu cược
  // Sắp xếp các alias theo độ dài (dài nhất trước) để tránh trường hợp tìm thấy alias ngắn hơn trước
  const betTypePattern = betTypeAliases
    .sort((a, b) => b.length - a.length)
    .map((alias) => `\\b${alias}\\b`)
    .join("|");

  // Tìm tất cả các kiểu cược trong dòng với regex cải tiến
  const betTypeRegex = new RegExp(
    `(${betTypePattern})(\\d+(?:[,.n]\\d+)?)`,
    "gi"
  );

  let match;
  while ((match = betTypeRegex.exec(normalizedLine)) !== null) {
    const betTypeAlias = match[1].toLowerCase();
    const amountStr = match[2];
    const betType = identifyBetType(betTypeAlias);

    if (betType && amountStr) {
      result.push({
        betType,
        amount: parseAmount(amountStr),
      });
    }
  }

  return result;
}

/**
 * Kiểm tra xem chuỗi từ vị trí hiện tại có đủ thông tin cho kiểu cược và số tiền không
 * @param {string} line - Dòng cần kiểm tra
 * @param {number} currentPos - Vị trí hiện tại trong dòng
 * @returns {boolean} Có đủ thông tin hay không
 */
function hasCompleteBetTypeAndAmount(line, currentPos) {
  // Tìm kiểu cược ở phần còn lại của dòng
  const remainingLine = line.substring(currentPos);

  // Cải tiến: Sử dụng regex chính xác hơn để tìm kiểu cược
  // Tạo pattern regex từ các alias kiểu cược, sắp xếp theo độ dài để ưu tiên tìm kiếm các alias dài hơn trước
  const betTypePattern = defaultBetTypes
    .flatMap((bt) => bt.aliases)
    .sort((a, b) => b.length - a.length)
    .join("|");

  // Tìm kiểu cược và số tiền ở phần sau của dòng
  // Cải tiến: Sử dụng word boundary \b để đảm bảo tìm đúng kiểu cược hoàn chỉnh
  const betTypeRegex = new RegExp(
    `\\b(${betTypePattern})\\d+(?:[,.n]\\d+)?$`,
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
  if (!amountString) return 0;

  // Loại bỏ ký tự không phải số hoặc dấu phân cách thập phân
  let cleaned = amountString.replace(/[^0-9,.]/g, "");

  // Tiêu chuẩn hóa dấu phân cách thập phân
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }

  // Chuyển đổi sang số
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;

  // Xử lý đơn vị "n" (nghìn)
  if (amountString.includes("n")) {
    return amount;
  }

  // Nếu số nhỏ hơn 100, coi như đơn vị nghìn
  return amount < 100 ? amount * 1000 : amount;
}

/**
 * Xác định kiểu cược từ chuỗi
 */
function identifyBetType(betTypeString) {
  if (!betTypeString) return null;

  const normalized = betTypeString.toLowerCase();

  // Xử lý các kiểu cược đặc biệt
  if (normalized === "dui") return identifyBetType("duoi");
  if (normalized === "xcdui") return identifyBetType("xcduoi");
  if (normalized === "b7lo") return identifyBetType("b7l");
  if (normalized === "b8lo") return identifyBetType("b8l");

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

  // Kiểm tra partial match cho các trường hợp viết tắt/không chuẩn
  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      if (alias.startsWith(normalized) || normalized.startsWith(alias)) {
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

  // Cải tiến: Xử lý số gộp thành nhóm (1234 -> 12, 34)
  if (/^\d{4,}$/.test(numberString) && numberString.length % 2 === 0) {
    const numbers = [];
    for (let i = 0; i < numberString.length; i += 2) {
      numbers.push(numberString.substring(i, i + 2));
    }
    return numbers;
  }

  // Trường hợp bình thường
  return [numberString];
}

/**
 * Xử lý từ khóa đặc biệt và trả về danh sách số
 */
function processSpecialKeyword(keyword) {
  switch (keyword.toLowerCase()) {
    case "tai":
      return generateTaiNumbers();
    case "xiu":
      return generateXiuNumbers();
    case "chan":
      return generateChanNumbers();
    case "le":
      return generateLeNumbers();
    case "chanchan":
      return generateChanChanNumbers();
    case "lele":
      return generateLeLeNumbers();
    case "chanle":
      return generateChanLeNumbers();
    case "lechan":
      return generateLeChanNumbers();
    default:
      return [];
  }
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
