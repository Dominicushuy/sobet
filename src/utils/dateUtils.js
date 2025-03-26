// src/utils/dateUtils.js

/**
 * Chuyển đổi từ ngày trong tuần sang chuỗi
 * @param {number} day - Ngày trong tuần (0-6)
 * @returns {string} Tên ngày trong tuần
 */
export function dayOfWeekToString(day) {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[day] || "";
}

/**
 * Chuyển đổi từ chuỗi ngày trong tuần sang số
 * @param {string} dayString - Tên ngày trong tuần
 * @returns {number} Ngày trong tuần (0-6)
 */
export function dayStringToNumber(dayString) {
  const days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return days[dayString.toLowerCase()] !== undefined
    ? days[dayString.toLowerCase()]
    : -1;
}

/**
 * Định dạng ngày thành chuỗi YYYY-MM-DD
 * @param {Date} date - Đối tượng ngày
 * @returns {string} Chuỗi ngày đã định dạng
 */
export function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Định dạng ngày thành chuỗi DD/MM/YYYY
 * @param {Date} date - Đối tượng ngày
 * @returns {string} Chuỗi ngày đã định dạng
 */
export function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Chuyển đổi ngày chuỗi sang đối tượng Date
 * @param {string} dateString - Chuỗi ngày
 * @returns {Date} Đối tượng Date
 */
export function parseDate(dateString) {
  // Kiểm tra format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const parts = dateString.split("/");
    return new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );
  }

  // Kiểm tra format YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) {
    const parts = dateString.split("-");
    return new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
  }

  // Sử dụng Date constructor cho các định dạng khác
  return new Date(dateString);
}

/**
 * Lấy ngày hiện tại trong tuần
 * @returns {number} Ngày trong tuần (0-6)
 */
export function getCurrentDayOfWeek() {
  return new Date().getDay();
}

/**
 * Lấy ngày của tuần trước
 * @param {number} day - Ngày trong tuần (0-6)
 * @returns {Date} Ngày của tuần trước
 */
export function getLastWeekDay(day) {
  const today = new Date();
  const currentDay = today.getDay();

  // Tính số ngày cần trừ
  let daysToSubtract = currentDay - day;
  if (daysToSubtract <= 0) {
    daysToSubtract += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() - daysToSubtract);

  return result;
}

/**
 * Lấy ngày của tuần tới
 * @param {number} day - Ngày trong tuần (0-6)
 * @returns {Date} Ngày của tuần tới
 */
export function getNextWeekDay(day) {
  const today = new Date();
  const currentDay = today.getDay();

  // Tính số ngày cần cộng
  let daysToAdd = day - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysToAdd);

  return result;
}

/**
 * Kiểm tra nếu thời gian hiện tại đã sau 16h
 * @returns {boolean} true nếu đã sau 16h
 */
export function isAfter4PM() {
  const now = new Date();
  return now.getHours() >= 16;
}

/**
 * Kiểm tra nếu thời gian hiện tại đã sau 18h30
 * @returns {boolean} true nếu đã sau 18h30
 */
export function isAfter6PM30() {
  const now = new Date();
  return (
    now.getHours() > 18 || (now.getHours() === 18 && now.getMinutes() >= 30)
  );
}

/**
 * Tính số ngày chênh lệch giữa hai ngày
 * @param {Date} date1 - Ngày thứ nhất
 * @param {Date} date2 - Ngày thứ hai
 * @returns {number} Số ngày chênh lệch
 */
export function daysBetween(date1, date2) {
  // Chuyển đổi thành ngày không có thời gian
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);

  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);

  // Tính chênh lệch
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export default {
  dayOfWeekToString,
  dayStringToNumber,
  formatDateToYYYYMMDD,
  formatDateToDDMMYYYY,
  parseDate,
  getCurrentDayOfWeek,
  getLastWeekDay,
  getNextWeekDay,
  isAfter4PM,
  isAfter6PM30,
  daysBetween,
};
