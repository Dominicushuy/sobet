// src/services/export/pdfExporter.js
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatMoney } from '@/utils/formatters'
import { format } from 'date-fns'

/**
 * Xuất thông tin mã cược ra file PDF
 * @param {object} betCode - Mã cược cần xuất
 * @returns {Blob} File PDF
 */
export function exportBetCodeToPDF(betCode) {
  // Khởi tạo đối tượng PDF với font Unicode để hỗ trợ tiếng Việt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
    compress: true,
  })

  const margin = 10

  try {
    // Cấu hình font chữ
    doc.setFont('helvetica')

    // Tính toán vị trí dựa trên kích thước của trang
    const pageWidth = doc.internal.pageSize.getWidth()

    const contentWidth = pageWidth - 2 * margin

    // Dựng Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PHIẾU MÃ CƯỢC', pageWidth / 2, margin + 5, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Mã phiếu: ${betCode.id?.substring(0, 8) || 'N/A'}`,
      margin,
      margin + 15
    )
    doc.text(
      `Ngày tạo: ${formatDateTime(betCode.createdAt)}`,
      pageWidth - margin,
      margin + 15,
      { align: 'right' }
    )

    // Thông tin cơ bản
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Thông tin cược:', margin, margin + 25)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Đài: ${betCode.station?.name || 'Không xác định'}`,
      margin,
      margin + 30
    )

    if (betCode.station?.multiStation && betCode.station?.count) {
      doc.text(
        `Số lượng đài: ${betCode.station.count}`,
        margin + 50,
        margin + 30
      )
    } else if (
      betCode.station?.stations &&
      betCode.station?.stations.length > 0
    ) {
      doc.text(
        `Đài: ${betCode.station.stations.map((s) => s.name).join(', ')}`,
        margin,
        margin + 30
      )
    }

    doc.text(
      `Tổng Số mã cược: ${betCode.lines?.length || 0}`,
      margin,
      margin + 35
    )
    doc.text(
      `Tiền cược: ${formatMoney(betCode.stakeAmount || 0)}đ`,
      margin,
      margin + 40
    )
    doc.text(
      `Tiềm năng thắng: ${formatMoney(betCode.potentialWinning || 0)}đ`,
      margin,
      margin + 45
    )

    // Vẽ đường kẻ ngăn cách
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, margin + 50, pageWidth - margin, margin + 50)

    // Chi tiết các dòng cược
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Chi tiết các dòng cược:', margin, margin + 55)

    // Tạo bảng cho các dòng cược
    if (betCode.lines && betCode.lines.length > 0) {
      const tableData = betCode.lines.map((line, index) => [
        index + 1,
        line.numbers?.join(', ') || 'N/A',
        line.betType?.alias || 'N/A',
        formatMoney(line.amount || 0) + 'đ',
        formatMoney(
          line.betType && line.amount
            ? calculatePotential(line.betType.alias, line.amount)
            : 0
        ) + 'đ',
      ])

      doc.autoTable({
        startY: margin + 60,
        head: [['STT', 'Số cược', 'Kiểu', 'Tiền cược', 'Tiềm năng']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [80, 80, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
        },
        margin: { left: margin, right: margin },
      })
    }

    // Thêm mã cược gốc
    const finalY = doc.lastAutoTable?.finalY || margin + 60
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Mã cược gốc:', margin, finalY + 10)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    // Phân tách dòng mã cược để hiển thị
    const betCodeLines = (
      betCode.formattedText ||
      betCode.originalText ||
      ''
    ).split('\n')
    let currentY = finalY + 15

    betCodeLines.forEach((line, index) => {
      doc.text(line, margin, currentY)
      currentY += 4
    })

    // Thêm chân trang
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    const footerText = 'Phiếu này chỉ có giá trị tham khảo.'
    doc.text(
      footerText,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )

    // Thêm thời gian in
    doc.text(
      `In lúc: ${formatDateTime(new Date())}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'right' }
    )

    // Trả về blob
    return doc.output('blob')
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error)

    // Tạo một trang PDF thông báo lỗi
    doc.setFontSize(12)
    doc.setTextColor(255, 0, 0)
    doc.text(
      'Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại.',
      margin,
      margin + 20
    )
    doc.text(`Lỗi: ${error.message}`, margin, margin + 30)

    return doc.output('blob')
  }
}

/**
 * Tính tiềm năng thắng dựa trên kiểu cược và số tiền
 * @param {string} betType - Kiểu cược
 * @param {number} amount - Số tiền cược
 * @returns {number} Tiềm năng thắng
 */
function calculatePotential(betType, amount) {
  // Tỉ lệ thắng cược dựa trên kiểu cược
  const rates = {
    dd: 75, // Đầu đuôi
    b: 75, // Bao lô (2 chữ số)
    xc: 650, // Xỉu chủ
    dau: 75, // Đầu
    duoi: 75, // Đuôi
    da: 750, // Đá
    xien: 350, // Xiên (2 số)
    nt: 75, // Nhất to
    b7l: 75, // Bao lô 7
    b8l: 75, // Bao lô 8
  }

  // Lấy tỉ lệ dựa trên kiểu cược, mặc định = 75
  const rate = rates[betType.toLowerCase()] || 75

  // Tính tiềm năng thắng
  return amount * rate
}

/**
 * Định dạng ngày giờ
 * @param {Date|string} date - Ngày giờ
 * @returns {string} Chuỗi ngày giờ đã định dạng
 */
function formatDateTime(date) {
  if (!date) return 'N/A'

  try {
    return format(new Date(date), 'HH:mm:ss dd/MM/yyyy')
  } catch (error) {
    return 'N/A'
  }
}

/**
 * Xuất nhiều mã cược ra một file PDF
 * @param {Array} betCodes - Danh sách mã cược
 * @param {string} title - Tiêu đề báo cáo
 * @returns {Blob} File PDF
 */
export function exportMultipleBetCodesToPDF(
  betCodes,
  title = 'Danh sách mã cược'
) {
  // Khởi tạo đối tượng PDF
  const doc = new jsPDF()

  // Đặt tiêu đề
  doc.setFontSize(16)
  doc.text(title, 14, 20)

  // Chuẩn bị dữ liệu cho bảng
  const tableColumn = [
    'STT',
    'Đài',
    'Dòng',
    'Tiền cược',
    'Tiềm năng',
    'Ngày tạo',
  ]

  const tableRows = betCodes.map((betCode, index) => [
    index + 1,
    betCode.station?.name || 'N/A',
    betCode.lines?.length || 0,
    formatMoney(betCode.stakeAmount || 0),
    formatMoney(betCode.potentialWinning || 0),
    formatDateTime(betCode.createdAt),
  ])

  // Tính tổng tiền
  const totalStake = betCodes.reduce(
    (sum, code) => sum + (code.stakeAmount || 0),
    0
  )
  const totalPotential = betCodes.reduce(
    (sum, code) => sum + (code.potentialWinning || 0),
    0
  )

  // Tạo bảng
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 15 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 35 },
    },
  })

  // Thêm tổng cộng
  const finalY = doc.lastAutoTable.finalY
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Tổng cộng: ${betCodes.length} mã cược`, 14, finalY + 10)
  doc.text(`Tổng tiền cược: ${formatMoney(totalStake)}đ`, 14, finalY + 16)
  doc.text(
    `Tổng tiềm năng thắng: ${formatMoney(totalPotential)}đ`,
    14,
    finalY + 22
  )

  // Thêm thời gian in
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`In lúc: ${formatDateTime(new Date())}`, 14, finalY + 30)

  // Trả về blob
  return doc.output('blob')
}

export default {
  exportBetCodeToPDF,
  exportMultipleBetCodesToPDF,
  exportBetCodesToPDF: exportBetCodeToPDF, // Compatibility with existing function
}
