// src/services/betCodeParser/errorDetector.js
import { defaultStations, defaultBetTypes } from "@/config/defaults";

/**
 * Phát hiện lỗi trong mã cược
 * @param {string} betCode - Mã cược gốc
 * @param {object} parsedResult - Kết quả phân tích mã cược
 * @returns {object} Kết quả phát hiện lỗi
 */
export function detectErrors(betCode, parsedResult) {
  if (!parsedResult || !parsedResult.success) {
    return {
      hasErrors: true,
      errors: parsedResult.errors || [{ message: "Mã cược không hợp lệ" }],
    };
  }

  const errors = [];
  let hasValidLine = false;

  // Kiểm tra đài
  if (!parsedResult.station) {
    errors.push({
      type: "STATION_ERROR",
      message: "Không thể xác định đài",
      scope: "global",
    });
  } else {
    // Kiểm tra xem đài có hỗ trợ trong ngày hiện tại không
    const stationErrors = validateStation(parsedResult.station);
    if (stationErrors.length > 0) {
      errors.push(...stationErrors);
    }
  }

  // Kiểm tra từng dòng
  for (let i = 0; i < parsedResult.lines.length; i++) {
    const line = parsedResult.lines[i];

    // Bỏ qua các dòng trống
    if (!line.originalLine || line.originalLine.trim() === "") continue;

    const lineErrors = validateLine(line, parsedResult.station);

    // Thêm thông tin lỗi
    if (lineErrors.length > 0) {
      errors.push(
        ...lineErrors.map((error) => ({
          ...error,
          lineIndex: i,
          line: line.originalLine,
        }))
      );
    } else if (line.valid) {
      hasValidLine = true;
    }
  }

  // Kiểm tra nếu không có dòng nào hợp lệ
  if (parsedResult.lines.length > 0 && !hasValidLine) {
    errors.push({
      type: "NO_VALID_LINE",
      message: "Không có dòng cược nào hợp lệ",
      scope: "global",
    });
  }

  return {
    hasErrors: errors.length > 0,
    errors,
  };
}

/**
 * Kiểm tra tính hợp lệ của đài
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateStation(station) {
  const errors = [];

  if (station.multiStation) {
    // Kiểm tra số lượng đài
    if (station.count <= 0) {
      errors.push({
        type: "INVALID_STATION_COUNT",
        message: "Số lượng đài không hợp lệ",
        scope: "station",
      });
    }

    // Kiểm tra ngày xổ số của đài
    const currentDay = getCurrentDayOfWeek();
    if (!isValidDayForRegion(station.region, currentDay)) {
      errors.push({
        type: "INVALID_STATION_DAY",
        message: `Miền ${getRegionName(
          station.region
        )} không có xổ số vào ngày ${getDayName(currentDay)}`,
        scope: "station",
      });
    }
  } else if (station.stations) {
    // Nếu là nhiều đài cụ thể
    for (const subStation of station.stations) {
      const stationInfo = findStationByName(subStation.name);
      if (!stationInfo) {
        errors.push({
          type: "INVALID_STATION",
          message: `Đài ${subStation.name} không tồn tại`,
          scope: "station",
        });
        continue;
      }

      // Kiểm tra xem đài có xổ trong ngày không
      const currentDay = getCurrentDayOfWeek();
      if (!isStationAvailableOnDay(stationInfo, currentDay)) {
        errors.push({
          type: "STATION_NOT_AVAILABLE",
          message: `Đài ${stationInfo.name} không xổ vào ngày ${getDayName(
            currentDay
          )}`,
          scope: "station",
        });
      }
    }
  } else {
    // Đài đơn lẻ
    const stationInfo = findStationByName(station.name);
    if (!stationInfo) {
      errors.push({
        type: "INVALID_STATION",
        message: `Đài ${station.name} không tồn tại`,
        scope: "station",
      });
    } else if (station.name !== "Miền Bắc") {
      // Kiểm tra xem đài có xổ trong ngày không (không kiểm tra đối với Miền Bắc vì nó xổ hàng ngày)
      const currentDay = getCurrentDayOfWeek();
      if (!isStationAvailableOnDay(stationInfo, currentDay)) {
        errors.push({
          type: "STATION_NOT_AVAILABLE",
          message: `Đài ${stationInfo.name} không xổ vào ngày ${getDayName(
            currentDay
          )}`,
          scope: "station",
        });
      }
    }
  }

  return errors;
}

/**
 * Kiểm tra tính hợp lệ của một dòng cược
 * @param {object} line - Dòng cược
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateLine(line, station) {
  const errors = [];

  // Kiểm tra kiểu cược
  if (!line.betType) {
    errors.push({
      type: "NO_BET_TYPE",
      message: "Thiếu kiểu cược",
      scope: "line",
    });
  } else {
    // Kiểm tra kiểu cược có hợp lệ với đài không
    const betTypeErrors = validateBetType(line.betType, station);
    if (betTypeErrors.length > 0) {
      errors.push(...betTypeErrors);
    }
  }

  // Kiểm tra số cược
  if (!line.numbers || line.numbers.length === 0) {
    errors.push({
      type: "NO_NUMBERS",
      message: "Thiếu số cược",
      scope: "line",
    });
  } else {
    // Kiểm tra từng số
    for (const number of line.numbers) {
      const numberErrors = validateNumber(number, line.betType);
      if (numberErrors.length > 0) {
        errors.push(
          ...numberErrors.map((error) => ({
            ...error,
            number,
          }))
        );
      }
    }
  }

  // Kiểm tra số tiền cược
  if (!line.amount || line.amount <= 0) {
    errors.push({
      type: "INVALID_AMOUNT",
      message: "Số tiền cược không hợp lệ",
      scope: "line",
    });
  }

  return errors;
}

/**
 * Kiểm tra tính hợp lệ của kiểu cược với đài
 * @param {object} betType - Kiểu cược
 * @param {object} station - Thông tin đài
 * @returns {Array} Danh sách lỗi
 */
function validateBetType(betType, station) {
  const errors = [];

  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.id || bt.aliases.includes(betType.alias)
  );

  if (!betTypeInfo) {
    errors.push({
      type: "INVALID_BET_TYPE",
      message: `Kiểu cược ${betType.alias || betType.name} không hợp lệ`,
      scope: "bet_type",
    });
    return errors;
  }

  // Kiểm tra xem kiểu cược có áp dụng cho miền này không
  if (station && !betTypeInfo.applicableRegions.includes(station.region)) {
    errors.push({
      type: "INCOMPATIBLE_BET_TYPE",
      message: `Kiểu cược ${
        betTypeInfo.name
      } không áp dụng cho miền ${getRegionName(station.region)}`,
      scope: "bet_type",
    });
  }

  return errors;
}

/**
 * Kiểm tra tính hợp lệ của số cược
 * @param {string} number - Số cược
 * @param {object} betType - Kiểu cược
 * @returns {Array} Danh sách lỗi
 */
function validateNumber(number, betType) {
  const errors = [];

  if (!number) {
    errors.push({
      type: "INVALID_NUMBER",
      message: "Số cược không hợp lệ",
      scope: "number",
    });
    return errors;
  }

  // Kiểm tra định dạng số
  if (!/^\d+$/.test(number)) {
    errors.push({
      type: "INVALID_NUMBER_FORMAT",
      message: `Số cược "${number}" không đúng định dạng`,
      scope: "number",
    });
    return errors;
  }

  // Nếu không có thông tin kiểu cược, không thể kiểm tra thêm
  if (!betType) {
    return errors;
  }

  const betTypeInfo = defaultBetTypes.find(
    (bt) => bt.name === betType.id || bt.aliases.includes(betType.alias)
  );

  if (!betTypeInfo) {
    return errors;
  }

  // Kiểm tra số chữ số
  const validDigitCounts = Array.isArray(betTypeInfo.betRule)
    ? betTypeInfo.betRule.map((rule) => parseInt(rule.match(/\d+/)[0], 10))
    : [];

  if (
    validDigitCounts.length > 0 &&
    !validDigitCounts.includes(number.length)
  ) {
    const validDigitsText = validDigitCounts.join(", ");
    errors.push({
      type: "INVALID_DIGIT_COUNT",
      message: `Số cược "${number}" có ${number.length} chữ số, không phù hợp với kiểu cược ${betTypeInfo.name} (yêu cầu ${validDigitsText} chữ số)`,
      scope: "number",
    });
  }

  return errors;
}

/**
 * Lấy tên miền từ mã miền
 * @param {string} region - Mã miền
 * @returns {string} Tên miền
 */
function getRegionName(region) {
  const map = {
    north: "Bắc",
    central: "Trung",
    south: "Nam",
  };
  return map[region] || region;
}

/**
 * Lấy ngày hiện tại trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {number} Ngày trong tuần
 */
function getCurrentDayOfWeek() {
  return new Date().getDay();
}

/**
 * Lấy tên ngày từ số ngày trong tuần
 * @param {number} day - Số ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {string} Tên ngày
 */
function getDayName(day) {
  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  return days[day];
}

/**
 * Kiểm tra xem đài có xổ vào ngày hiện tại không
 * @param {object} station - Thông tin đài
 * @param {number} day - Ngày trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 * @returns {boolean} True nếu đài xổ vào ngày hiện tại
 */
function isStationAvailableOnDay(station, day) {
  if (!station || !station.schedule) {
    return false;
  }

  const dayMap = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
    daily: "daily",
  };

  const currentDayString = dayMap[day];

  // Xổ hàng ngày
  if (station.schedule.day === "daily") {
    return true;
  }

  // Xổ nhiều ngày - schedule là mảng
  if (Array.isArray(station.schedule)) {
    return station.schedule.some((sch) => sch.day === currentDayString);
  }

  // Xổ 1 ngày - schedule là object
  return station.schedule.day === currentDayString;
}

/**
 * Kiểm tra xem miền có xổ vào ngày hiện tại không
 * @param {string} region - Miền
 * @param {number} day - Ngày trong tuần
 * @returns {boolean} True nếu miền có xổ vào ngày hiện tại
 */
function isValidDayForRegion(region, day) {
  // Tất cả các miền đều có xổ mỗi ngày
  return true;
}

/**
 * Tìm thông tin đài theo tên
 * @param {string} name - Tên đài
 * @returns {object} Thông tin đài
 */
function findStationByName(name) {
  return defaultStations.find((s) => s.name === name);
}
