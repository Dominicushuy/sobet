// src/services/export/excelExporter.js
import * as XLSX from "xlsx";
import { formatMoney } from "@/utils/formatters";

/**
 * Xuất danh sách mã cược ra file Excel
 * @param {Array} betCodes - Danh sách mã cược
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File Excel
 */
export function exportBetCodesToExcel(betCodes, title = "Danh sách mã cược") {
  // Tạo workbook
  const wb = XLSX.utils.book_new();

  // Chuyển đổi dữ liệu sang định dạng phù hợp
  const data = betCodes.map((betCode, index) => {
    return {
      STT: index + 1,
      "Mã cược": betCode.content,
      "Tiền đóng": formatMoney(betCode.stakeAmount),
      "Tiền gốc": formatMoney(
        betCode.originalStakeAmount ||
          betCode.stakeAmount / (betCode.betMultiplier || 0.8)
      ),
      "Tiềm năng": formatMoney(betCode.potentialWinning),
      "Trạng thái": getStatusText(betCode.status),
      "Ngày tạo": formatDateTime(betCode.createdAt),
      "Ngày cập nhật": formatDateTime(betCode.updatedAt),
    };
  });

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Đặt chiều rộng cột
  const colWidths = [
    { wpx: 50 }, // STT
    { wpx: 250 }, // Mã cược
    { wpx: 100 }, // Tiền đóng
    { wpx: 100 }, // Tiền gốc
    { wpx: 100 }, // Tiềm năng
    { wpx: 100 }, // Trạng thái
    { wpx: 150 }, // Ngày tạo
    { wpx: 150 }, // Ngày cập nhật
  ];
  ws["!cols"] = colWidths;

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách mã cược");

  // Xuất file
  const excelData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Xuất kết quả đối soát ra file Excel
 * @param {Array} verificationResults - Danh sách kết quả đối soát
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File Excel
 */
export function exportVerificationResultsToExcel(
  verificationResults,
  title = "Kết quả đối soát"
) {
  // Tạo workbook
  const wb = XLSX.utils.book_new();

  // Chuyển đổi dữ liệu sang định dạng phù hợp
  const data = verificationResults.map((result, index) => {
    return {
      STT: index + 1,
      "Mã đối soát": result.id,
      "Số lượng mã cược": result.betCodeIds.length,
      "Kết quả": result.result ? "Đã đối soát" : "Chưa đối soát",
      "Ngày đối soát": formatDateTime(result.verifiedAt),
      "Ghi chú": result.notes || "",
    };
  });

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Đặt chiều rộng cột
  const colWidths = [
    { wpx: 50 }, // STT
    { wpx: 100 }, // Mã đối soát
    { wpx: 120 }, // Số lượng mã cược
    { wpx: 100 }, // Kết quả
    { wpx: 150 }, // Ngày đối soát
    { wpx: 200 }, // Ghi chú
  ];
  ws["!cols"] = colWidths;

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Kết quả đối soát");

  // Xuất file
  const excelData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Xuất kết quả xổ số ra file Excel
 * @param {Array} lotteryResults - Danh sách kết quả xổ số
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File Excel
 */
export function exportLotteryResultsToExcel(
  lotteryResults,
  title = "Kết quả xổ số"
) {
  // Tạo workbook
  const wb = XLSX.utils.book_new();

  // Chuyển đổi dữ liệu sang định dạng phù hợp
  const data = lotteryResults.map((result, index) => {
    // Lấy giải đặc biệt
    const specialPrize = result.results?.special?.join(", ") || "";

    return {
      STT: index + 1,
      Miền: getRegionName(result.region),
      Đài: result.station,
      Ngày: formatDate(result.date),
      "Giải đặc biệt": specialPrize,
      "Ngày nhập": formatDateTime(result.importedAt),
    };
  });

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Đặt chiều rộng cột
  const colWidths = [
    { wpx: 50 }, // STT
    { wpx: 80 }, // Miền
    { wpx: 120 }, // Đài
    { wpx: 100 }, // Ngày
    { wpx: 120 }, // Giải đặc biệt
    { wpx: 150 }, // Ngày nhập
  ];
  ws["!cols"] = colWidths;

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Kết quả xổ số");

  // Xuất file
  const excelData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Định dạng trạng thái thành text
 * @param {string} status - Trạng thái
 * @returns {string} Text hiển thị
 */
function getStatusText(status) {
  switch (status) {
    case "pending":
      return "Chờ đối soát";
    case "verified":
      return "Đã đối soát";
    case "won":
      return "Trúng thưởng";
    case "lost":
      return "Thua";
    case "deleted":
      return "Đã xóa";
    default:
      return status;
  }
}

/**
 * Định dạng tên miền
 * @param {string} region - Mã miền
 * @returns {string} Tên miền
 */
function getRegionName(region) {
  switch (region) {
    case "north":
      return "Miền Bắc";
    case "central":
      return "Miền Trung";
    case "south":
      return "Miền Nam";
    default:
      return region;
  }
}

/**
 * Định dạng ngày giờ
 * @param {Date|string} date - Ngày giờ
 * @returns {string} Ngày giờ đã định dạng
 */
function formatDateTime(date) {
  if (!date) return "";

  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Định dạng ngày
 * @param {Date|string} date - Ngày
 * @returns {string} Ngày đã định dạng
 */
function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}
