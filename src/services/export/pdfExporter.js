// src/services/export/pdfExporter.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatMoney } from "@/utils/formatters";

/**
 * Xuất danh sách mã cược ra file PDF
 * @param {Array} betCodes - Danh sách mã cược
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File PDF
 */
export function exportBetCodesToPDF(betCodes, title = "Danh sách mã cược") {
  // Khởi tạo đối tượng PDF
  const doc = new jsPDF();

  // Đặt tiêu đề
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Chuẩn bị dữ liệu cho bảng
  const tableColumn = [
    "STT",
    "Mã cược",
    "Tiền đóng",
    "Tiềm năng",
    "Trạng thái",
    "Ngày tạo",
  ];
  const tableRows = betCodes.map((betCode, index) => [
    index + 1,
    betCode.content.length > 30
      ? betCode.content.substring(0, 27) + "..."
      : betCode.content,
    formatMoney(betCode.stakeAmount),
    formatMoney(betCode.potentialWinning),
    getStatusText(betCode.status),
    formatDate(betCode.createdAt),
  ]);

  // Tạo bảng
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 10 }, // STT
      1: { cellWidth: 50 }, // Mã cược
      2: { cellWidth: 25 }, // Tiền đóng
      3: { cellWidth: 25 }, // Tiềm năng
      4: { cellWidth: 25 }, // Trạng thái
      5: { cellWidth: 30 }, // Ngày tạo
    },
  });

  // Thêm thông tin tổng kết
  const totalStakeAmount = betCodes.reduce(
    (sum, betCode) => sum + (betCode.stakeAmount || 0),
    0
  );
  const totalPotentialWinning = betCodes.reduce(
    (sum, betCode) => sum + (betCode.potentialWinning || 0),
    0
  );

  const tableY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Tổng tiền đóng: ${formatMoney(totalStakeAmount)}`, 14, tableY);
  doc.text(
    `Tổng tiềm năng: ${formatMoney(totalPotentialWinning)}`,
    14,
    tableY + 7
  );
  doc.text(`Tổng số lượng: ${betCodes.length} mã cược`, 14, tableY + 14);

  // Thêm ngày giờ xuất báo cáo
  doc.setFontSize(8);
  doc.text(`Ngày xuất báo cáo: ${formatDateTime(new Date())}`, 14, tableY + 25);

  // Trả về blob
  return doc.output("blob");
}

/**
 * Xuất kết quả đối soát ra file PDF
 * @param {Array} verificationResults - Danh sách kết quả đối soát
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File PDF
 */
export function exportVerificationResultsToPDF(
  verificationResults,
  title = "Kết quả đối soát"
) {
  // Khởi tạo đối tượng PDF
  const doc = new jsPDF();

  // Đặt tiêu đề
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Chuẩn bị dữ liệu cho bảng
  const tableColumn = [
    "STT",
    "Mã đối soát",
    "Số lượng mã cược",
    "Kết quả",
    "Ngày đối soát",
    "Ghi chú",
  ];
  const tableRows = verificationResults.map((result, index) => [
    index + 1,
    result.id,
    result.betCodeIds.length,
    result.result ? "Đã đối soát" : "Chưa đối soát",
    formatDate(result.verifiedAt),
    result.notes && result.notes.length > 20
      ? result.notes.substring(0, 17) + "..."
      : result.notes || "",
  ]);

  // Tạo bảng
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 10 }, // STT
      1: { cellWidth: 25 }, // Mã đối soát
      2: { cellWidth: 30 }, // Số lượng mã cược
      3: { cellWidth: 25 }, // Kết quả
      4: { cellWidth: 30 }, // Ngày đối soát
      5: { cellWidth: 50 }, // Ghi chú
    },
  });

  // Thêm thông tin tổng kết
  const tableY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(
    `Tổng số lượng: ${verificationResults.length} lần đối soát`,
    14,
    tableY
  );

  // Thêm ngày giờ xuất báo cáo
  doc.setFontSize(8);
  doc.text(`Ngày xuất báo cáo: ${formatDateTime(new Date())}`, 14, tableY + 10);

  // Trả về blob
  return doc.output("blob");
}

/**
 * Xuất kết quả xổ số ra file PDF
 * @param {Array} lotteryResults - Danh sách kết quả xổ số
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File PDF
 */
export function exportLotteryResultsToPDF(
  lotteryResults,
  title = "Kết quả xổ số"
) {
  // Khởi tạo đối tượng PDF
  const doc = new jsPDF();

  // Đặt tiêu đề
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Chuẩn bị dữ liệu cho bảng
  const tableColumn = ["STT", "Miền", "Đài", "Ngày", "Giải đặc biệt"];
  const tableRows = lotteryResults.map((result, index) => {
    // Lấy giải đặc biệt
    const specialPrize = result.results?.special?.join(", ") || "";

    return [
      index + 1,
      getRegionName(result.region),
      result.station,
      formatDate(result.date),
      specialPrize,
    ];
  });

  // Tạo bảng
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 10 }, // STT
      1: { cellWidth: 25 }, // Miền
      2: { cellWidth: 40 }, // Đài
      3: { cellWidth: 25 }, // Ngày
      4: { cellWidth: 70 }, // Giải đặc biệt
    },
  });

  // Thêm thông tin tổng kết
  const tableY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Tổng số lượng: ${lotteryResults.length} kết quả xổ số`, 14, tableY);

  // Phân tích theo miền
  const northCount = lotteryResults.filter((r) => r.region === "north").length;
  const centralCount = lotteryResults.filter(
    (r) => r.region === "central"
  ).length;
  const southCount = lotteryResults.filter((r) => r.region === "south").length;

  doc.text(`Miền Bắc: ${northCount} kết quả`, 14, tableY + 7);
  doc.text(`Miền Trung: ${centralCount} kết quả`, 14, tableY + 14);
  doc.text(`Miền Nam: ${southCount} kết quả`, 14, tableY + 21);

  // Thêm ngày giờ xuất báo cáo
  doc.setFontSize(8);
  doc.text(`Ngày xuất báo cáo: ${formatDateTime(new Date())}`, 14, tableY + 32);

  // Trả về blob
  return doc.output("blob");
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
