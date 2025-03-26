// src/services/betCodeParser/validator.js
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from "@/config/defaults";

/**
 * Kiểm tra mã cược
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Kết quả kiểm tra
 */
export function validateBetCode(betCode) {
  if (!betCode || typeof betCode !== "string") {
    return { valid: false, errors: ["Mã cược không hợp lệ"] };
  }

  // Phân tách các dòng
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { valid: false, errors: ["Mã cược trống"] };
  }

  const results = {
    valid: true,
    stationValid: true,
    linesValid: true,
    station: null,
    errors: [],
    warnings: [],
    details: [],
  };

  // Kiểm tra đài
  const stationResult = validateStation(lines[0]);
  results.stationValid = stationResult.valid;

  if (!stationResult.valid) {
    results.valid = false;
    results.errors.push(`Đài không hợp lệ: ${stationResult.error}`);
  } else {
    results.station = stationResult.station;
  }

  // Kiểm tra từng dòng cược
  const lineStart = 1;
  let hasValidLine = false;

  for (let i = lineStart; i < lines.length; i++) {
    const lineResult = validateLine(lines[i], results.station);

    results.details.push({
      line: lines[i],
      lineIndex: i,
      ...lineResult,
    });

    if (!lineResult.valid) {
      results.linesValid = false;
      results.errors.push(`Dòng ${i + 1} không hợp lệ: ${lineResult.error}`);
    } else {
      hasValidLine = true;
    }
  }

  // Kiểm tra nếu không có dòng nào hợp lệ
  if (lines.length > 1 && !hasValidLine) {
    results.valid = false;
    results.errors.push("Không có dòng cược nào hợp lệ");
  }

  results.valid = results.stationValid && results.linesValid && hasValidLine;

  return results;
}

/**
 * Kiểm tra đài
 * @param {string} stationString - Chuỗi chứa thông tin đài
 * @returns {object} Kết quả kiểm tra đài
 */
function validateStation(stationString) {
  if (!stationString || stationString.trim() === "") {
    return { valid: false, error: "Không có thông tin đài" };
  }

  const stationText = stationString.trim().toLowerCase();

  // Kiểm tra đài miền Bắc
  const mbMatches = [
    "mb",
    "mienbac",
    "hanoi",
    "hn",
    "bac",
    "mien bac",
    "miền bắc",
    "hà nội",
    "daibac",
    "dbac",
    "đài bắc",
    "đài miền bắc",
    "db",
  ];
  if (mbMatches.includes(stationText)) {
    return {
      valid: true,
      station: {
        name: "Miền Bắc",
        region: "north",
        multiStation: false,
      },
    };
  }

  // Kiểm tra đài miền Nam/Trung nhiều đài
  const multipleStationMatch = stationText.match(
    /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung)/
  );
  if (multipleStationMatch) {
    const count = parseInt(multipleStationMatch[1], 10);
    if (count <= 0) {
      return { valid: false, error: "Số lượng đài không hợp lệ" };
    }

    const region = multipleStationMatch[2].includes("n") ? "south" : "central";

    return {
      valid: true,
      station: {
        name: region === "south" ? "Miền Nam" : "Miền Trung",
        region,
        multiStation: true,
        count,
      },
    };
  }

  // Kiểm tra đài miền Nam/Trung
  const regionMatches = {
    south: [
      "mn",
      "dmn",
      "dn",
      "dnam",
      "miennam",
      "mien nam",
      "miền nam",
      "đài nam",
      "đài miền nam",
      "mnam",
    ],
    central: [
      "mt",
      "dmt",
      "dt",
      "dtrung",
      "mientrung",
      "mien trung",
      "miền trung",
      "đài trung",
      "đài miền trung",
      "mtrung",
    ],
  };

  for (const [region, aliases] of Object.entries(regionMatches)) {
    if (aliases.includes(stationText)) {
      return {
        valid: true,
        station: {
          name: region === "south" ? "Miền Nam" : "Miền Trung",
          region,
          multiStation: true,
          count: 1,
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
      const stations = [];
      let region = null;

      for (const part of stationParts) {
        const station = findStationByAlias(part);
        if (station) {
          stations.push({
            name: station.name,
            region: station.region,
          });

          if (region === null) {
            region = station.region;
          }
        } else {
          return { valid: false, error: `Đài "${part}" không hợp lệ` };
        }
      }

      if (stations.length > 0) {
        return {
          valid: true,
          station: {
            stations,
            region: stations[0].region,
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
      valid: true,
      station: {
        name: station.name,
        region: station.region,
        multiStation: false,
      },
    };
  }

  return {
    valid: false,
    error: `Không tìm thấy đài phù hợp với "${stationText}"`,
  };
}

/**
 * Kiểm tra một dòng cược
 * @param {string} line - Dòng cược
 * @param {object} station - Thông tin đài
 * @returns {object} Kết quả kiểm tra dòng cược
 */
function validateLine(line, station) {
  if (!line || line.trim() === "") {
    return { valid: false, error: "Dòng trống" };
  }

  try {
    const result = {
      valid: false,
      numbers: [],
      betType: null,
      amount: 0,
      error: null,
    };

    // Phân tích dòng cược
    const { numbers, betType, amount } = extractLineComponents(line);

    // Kiểm tra số cược
    if (!numbers || numbers.length === 0) {
      result.error = "Thiếu số cược";
      return result;
    }

    // Kiểm tra kiểu cược
    if (!betType) {
      result.error = "Thiếu kiểu cược";
      return result;
    }

    // Kiểm tra số tiền
    if (!amount || amount <= 0) {
      result.error = "Số tiền cược không hợp lệ";
      return result;
    }

    // Kiểm tra tính hợp lệ của kiểu cược với miền
    const betTypeObj = getBetTypeInfo(betType);
    if (!betTypeObj) {
      result.error = `Kiểu cược "${betType}" không hợp lệ`;
      return result;
    }

    if (station && !betTypeObj.applicableRegions.includes(station.region)) {
      result.error = `Kiểu cược "${betType}" không áp dụng cho ${
        station.region === "south"
          ? "miền Nam"
          : station.region === "central"
          ? "miền Trung"
          : "miền Bắc"
      }`;
      return result;
    }

    // Kiểm tra tính hợp lệ của số với kiểu cược
    for (const number of numbers) {
      const validDigitCounts = Array.isArray(betTypeObj.betRule)
        ? betTypeObj.betRule.map((rule) => parseInt(rule.match(/\d+/)[0], 10))
        : [];

      if (
        validDigitCounts.length > 0 &&
        !validDigitCounts.includes(number.length)
      ) {
        result.error = `Số "${number}" có ${
          number.length
        } chữ số, không phù hợp với kiểu cược "${betType}" (yêu cầu ${validDigitCounts.join(
          ", "
        )} chữ số)`;
        return result;
      }
    }

    result.valid = true;
    result.numbers = numbers;
    result.betType = betTypeObj;
    result.amount = amount;

    return result;
  } catch (error) {
    return { valid: false, error: `Lỗi phân tích: ${error.message}` };
  }
}

/**
 * Trích xuất các thành phần từ một dòng cược
 * @param {string} line - Dòng cược
 * @returns {object} Các thành phần trích xuất được
 */
function extractLineComponents(line) {
  // Xử lý số cược, kiểu cược và số tiền
  const normalizedLine = line.trim().toLowerCase();
  const result = {
    numbers: [],
    betType: null,
    amount: 0,
  };

  // Phân tách các số cược (chia theo dấu ., dấu cách hoặc dấu phẩy)
  const parts = normalizedLine.split(/[,. ]+/);
  if (parts.length < 2) {
    // Chưa đủ thành phần
    return result;
  }

  // Kiểm tra phần cuối có chứa kiểu cược và số tiền không
  const lastPart = parts[parts.length - 1];
  const betTypeMatch = lastPart.match(/([a-z]+)(\d+(?:[,.]\d+)?)?$/i);

  if (betTypeMatch) {
    // Có kiểu cược và có thể có số tiền
    result.betType = betTypeMatch[1].toLowerCase();

    if (betTypeMatch[2]) {
      // Có số tiền
      const amountStr = betTypeMatch[2].replace(",", ".");
      result.amount = parseFloat(amountStr);

      // Nếu số quá nhỏ, có thể là đơn vị nghìn đồng
      if (result.amount < 100) {
        result.amount *= 1000;
      }
    }

    // Thêm các số cược (trừ phần cuối nếu nó chỉ chứa kiểu cược và số tiền)
    const betTypeMatchDirect = parts[parts.length - 1].match(
      /^[a-z]+\d+(?:[,.]\d+)?$/i
    );
    const numbersEndIndex = betTypeMatchDirect
      ? parts.length - 1
      : parts.length;

    for (let i = 0; i < numbersEndIndex; i++) {
      if (parts[i].match(/^\d+$/)) {
        result.numbers.push(parts[i]);
      } else {
        // Xử lý các kiểu số đặc biệt (tai, xiu, chan, le, ...)
        const specialNumbers = processSpecialNumber(parts[i]);
        if (specialNumbers.length > 0) {
          result.numbers.push(...specialNumbers);
        }
      }
    }
  } else {
    // Không có kiểu cược hoặc số tiền
    // Thử tìm kiểu cược và số tiền trong các phần
    for (let i = parts.length - 1; i >= 0; i--) {
      const betTypeMatch = parts[i].match(/^([a-z]+)(\d+(?:[,.]\d+)?)?$/i);
      if (betTypeMatch) {
        result.betType = betTypeMatch[1].toLowerCase();

        if (betTypeMatch[2]) {
          // Có số tiền
          const amountStr = betTypeMatch[2].replace(",", ".");
          result.amount = parseFloat(amountStr);

          // Nếu số quá nhỏ, có thể là đơn vị nghìn đồng
          if (result.amount < 100) {
            result.amount *= 1000;
          }
        }

        // Thêm các số cược (trừ phần chứa kiểu cược và số tiền)
        for (let j = 0; j < i; j++) {
          if (parts[j].match(/^\d+$/)) {
            result.numbers.push(parts[j]);
          } else {
            // Xử lý các kiểu số đặc biệt (tai, xiu, chan, le, ...)
            const specialNumbers = processSpecialNumber(parts[j]);
            if (specialNumbers.length > 0) {
              result.numbers.push(...specialNumbers);
            }
          }
        }

        break;
      }
    }
  }

  return result;
}

/**
 * Xử lý các từ khóa đặc biệt để tạo ra danh sách số
 * @param {string} keyword - Từ khóa đặc biệt
 * @returns {Array} Danh sách số
 */
function processSpecialNumber(keyword) {
  const keoMatch = keyword.match(/^(\d+)\/(\d+)(?:keo|k)(\d+)$/);
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

  switch (keyword.toLowerCase()) {
    case "tai":
      return generateNumbers(50, 99);
    case "xiu":
      return generateNumbers(0, 49);
    case "chan":
      return generateEvenNumbers(0, 98);
    case "le":
      return generateOddNumbers(1, 99);
    case "chanchan":
      return generateEvenEvenNumbers();
    case "lele":
      return generateOddOddNumbers();
    case "chanle":
      return generateEvenOddNumbers();
    case "lechan":
      return generateOddEvenNumbers();
    default:
      return [];
  }
}

/**
 * Tạo danh sách số trong khoảng
 * @param {number} start - Số bắt đầu
 * @param {number} end - Số kết thúc
 * @returns {Array} Danh sách số
 */
function generateNumbers(start, end) {
  const numbers = [];
  for (let i = start; i <= end; i++) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn trong khoảng
 * @param {number} start - Số bắt đầu
 * @param {number} end - Số kết thúc
 * @returns {Array} Danh sách số chẵn
 */
function generateEvenNumbers(start, end) {
  const numbers = [];
  for (let i = start % 2 === 0 ? start : start + 1; i <= end; i += 2) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ trong khoảng
 * @param {number} start - Số bắt đầu
 * @param {number} end - Số kết thúc
 * @returns {Array} Danh sách số lẻ
 */
function generateOddNumbers(start, end) {
  const numbers = [];
  for (let i = start % 2 === 1 ? start : start + 1; i <= end; i += 2) {
    numbers.push(i.toString().padStart(2, "0"));
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn chẵn
 * @returns {Array} Danh sách số chẵn chẵn
 */
function generateEvenEvenNumbers() {
  const numbers = [];
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ lẻ
 * @returns {Array} Danh sách số lẻ lẻ
 */
function generateOddOddNumbers() {
  const numbers = [];
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số chẵn lẻ
 * @returns {Array} Danh sách số chẵn lẻ
 */
function generateEvenOddNumbers() {
  const numbers = [];
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tạo danh sách số lẻ chẵn
 * @returns {Array} Danh sách số lẻ chẵn
 */
function generateOddEvenNumbers() {
  const numbers = [];
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`);
    }
  }
  return numbers;
}

/**
 * Tìm đài dựa trên alias
 * @param {string} alias - Alias của đài
 * @returns {object} Thông tin đài
 */
function findStationByAlias(alias) {
  return defaultStations.find(
    (s) => s.name.toLowerCase() === alias || s.aliases.some((a) => a === alias)
  );
}

/**
 * Lấy thông tin kiểu cược từ alias
 * @param {string} alias - Alias của kiểu cược
 * @returns {object} Thông tin kiểu cược
 */
function getBetTypeInfo(alias) {
  return defaultBetTypes.find((bt) => bt.aliases.some((a) => a === alias));
}
