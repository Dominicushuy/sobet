// src/utils/validators.js

/**
 * Kiểm tra email hợp lệ
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Kiểm tra tên người dùng hợp lệ
 * @param {string} username - Tên người dùng cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidUsername(username) {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
}

/**
 * Kiểm tra mật khẩu đạt yêu cầu độ mạnh
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isStrongPassword(password) {
  // Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
}

/**
 * Kiểm tra số điện thoại hợp lệ
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidPhoneNumber(phone) {
  const re = /^(\+?84|0)[3-9][0-9]{8}$/;
  return re.test(phone);
}

/**
 * Kiểm tra giá trị là số
 * @param {any} value - Giá trị cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isNumber(value) {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value !== "string") return false;

  // Loại bỏ dấu phân cách hàng nghìn (,) và kiểm tra
  const parsed = parseFloat(value.replace(/,/g, ""));
  return !isNaN(parsed);
}

/**
 * Kiểm tra giá trị là số dương
 * @param {any} value - Giá trị cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isPositiveNumber(value) {
  if (!isNumber(value)) return false;

  // Chuyển đổi về số
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  return num > 0;
}

/**
 * Kiểm tra giá trị nằm trong khoảng cho phép
 * @param {number} value - Giá trị cần kiểm tra
 * @param {number} min - Giá trị tối thiểu
 * @param {number} max - Giá trị tối đa
 * @returns {boolean} Kết quả kiểm tra
 */
export function isInRange(value, min, max) {
  if (!isNumber(value)) return false;

  // Chuyển đổi về số
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  return num >= min && num <= max;
}

/**
 * Kiểm tra mã cược có đúng định dạng
 * @param {string} betCode - Mã cược cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidBetCode(betCode) {
  if (!betCode || typeof betCode !== "string") return false;

  // Mã cược phải có ít nhất 2 dòng (đài và số cược)
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  if (lines.length < 2) return false;

  // Dòng đầu phải chứa tên đài
  const stationLine = lines[0].trim().toLowerCase();

  // Các đài/miền phổ biến
  const commonStations = [
    "mb",
    "mt",
    "mn",
    "mienbac",
    "mientrung",
    "miennam",
    "hcm",
    "tp",
    "tpho",
    "vl",
    "dn",
    "dt",
    "hn",
  ];

  // Kiểm tra dòng đầu tiên có chứa tên đài/miền không
  const hasStation = commonStations.some(
    (station) =>
      stationLine.includes(station) || stationLine.startsWith(station)
  );

  if (!hasStation) return false;

  // Kiểm tra ít nhất một dòng số cược
  const hasBetLine = lines.slice(1).some((line) => {
    // Phải có số và kiểu cược
    return /\d+/.test(line) && /[a-z]+\d+/i.test(line);
  });

  return hasBetLine;
}

/**
 * Kiểm tra ngày hợp lệ
 * @param {string} dateString - Chuỗi ngày cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidDate(dateString) {
  if (!dateString) return false;

  // Kiểm tra format DD/MM/YYYY hoặc YYYY-MM-DD
  const formats = [/^\d{1,2}\/\d{1,2}\/\d{4}$/, /^\d{4}-\d{1,2}-\d{1,2}$/];

  const isValidFormat = formats.some((format) => format.test(dateString));
  if (!isValidFormat) return false;

  // Chuyển đổi thành Date để kiểm tra
  const d = new Date(dateString);
  return !isNaN(d.getTime());
}

/**
 * Kiểm tra URL hợp lệ
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Kiểm tra JSON hợp lệ
 * @param {string} jsonString - Chuỗi JSON cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidPhoneNumber,
  isNumber,
  isPositiveNumber,
  isInRange,
  isValidBetCode,
  isValidDate,
  isValidUrl,
  isValidJson,
};
