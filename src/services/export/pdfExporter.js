// src/services/export/pdfExporter.js
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { BET_CODE_STATUS } from '@/config/constants'

/**
 * Xuất danh sách mã cược ra file PDF
 * @param {Array} betCodes - Danh sách mã cược cần xuất
 * @param {string} fileName - Tên file (không bao gồm phần mở rộng)
 */
export function exportToPdf(betCodes, fileName = 'BetCodes') {
  if (!betCodes || betCodes.length === 0) {
    console.error('Không có dữ liệu để xuất')
    return
  }

  try {
    // Khởi tạo tài liệu PDF
    const doc = new jsPDF('l', 'mm', 'a4') // landscape

    // Thêm tiêu đề
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('LỊCH SỬ MÃ CƯỢC', doc.internal.pageSize.getWidth() / 2, 15, {
      align: 'center',
    })

    // Thêm thông tin ngày xuất
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const exportDate = `Ngày xuất: ${format(new Date(), 'dd/MM/yyyy HH:mm', {
      locale: vi,
    })}`
    doc.text(exportDate, doc.internal.pageSize.getWidth() - 15, 10, {
      align: 'right',
    })

    // Chuẩn bị dữ liệu cho bảng
    const tableData = betCodes.map((betCode) => [
      betCode.id,
      betCode.content,
      (betCode.stakeAmount || 0).toLocaleString() + ' đ',
      (betCode.potentialWinning || 0).toLocaleString() + ' đ',
      format(new Date(betCode.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi }),
      getStatusText(betCode.status),
    ])

    // Tạo bảng
    doc.autoTable({
      startY: 25,
      head: [
        [
          'ID',
          'Nội dung',
          'Tiền cược',
          'Tiềm năng thắng',
          'Ngày tạo',
          'Trạng thái',
        ],
      ],
      body: tableData,
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 90 }, // Nội dung
        2: { cellWidth: 30 }, // Tiền cược
        3: { cellWidth: 35 }, // Tiềm năng thắng
        4: { cellWidth: 40 }, // Ngày tạo
        5: { cellWidth: 25 }, // Trạng thái
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 25 },
      didDrawPage: (data) => {
        // Thêm footer trên mỗi trang
        doc.setFontSize(8)
        doc.text(
          `Trang ${data.pageNumber} / ${data.pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      },
    })

    // Xuất file
    const finalFileName = `${fileName}_${format(new Date(), 'dd-MM-yyyy')}.pdf`
    doc.save(finalFileName)

    return true
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error)
    return false
  }
}

/**
 * Lấy text hiển thị của trạng thái
 * @param {string} status - Mã trạng thái
 * @returns {string} - Text hiển thị
 */
function getStatusText(status) {
  switch (status) {
    case BET_CODE_STATUS.PENDING:
      return 'Chờ xử lý'
    case BET_CODE_STATUS.VERIFIED:
      return 'Đã đối soát'
    case BET_CODE_STATUS.DELETED:
      return 'Đã xóa'
    default:
      return 'Không xác định'
  }
}

/**
 * Xuất chi tiết một mã cược ra file PDF
 * @param {Object} betCode - Mã cược cần xuất
 * @param {string} fileName - Tên file (không bao gồm phần mở rộng)
 */
export function exportBetCodeDetailToPdf(betCode, fileName = 'BetCodeDetail') {
  if (!betCode) {
    console.error('Không có dữ liệu để xuất')
    return
  }

  try {
    // Khởi tạo tài liệu PDF
    const doc = new jsPDF('p', 'mm', 'a4') // portrait

    // Thêm tiêu đề
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(
      `CHI TIẾT MÃ CƯỢC #${betCode.id}`,
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: 'center' }
    )

    // Thêm thông tin cơ bản
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    // Ngày tạo
    const createdDate = `Ngày tạo: ${format(
      new Date(betCode.createdAt),
      'HH:mm - dd/MM/yyyy',
      { locale: vi }
    )}`
    doc.text(createdDate, 15, 25)

    // Trạng thái
    const status = `Trạng thái: ${getStatusText(betCode.status)}`
    doc.text(status, doc.internal.pageSize.getWidth() - 15, 25, {
      align: 'right',
    })

    // Nội dung mã cược
    doc.setFont('helvetica', 'bold')
    doc.text('Nội dung mã cược:', 15, 35)
    doc.setFont('helvetica', 'normal')

    // Chia nội dung thành các dòng để tránh tràn trang
    const contentLines = doc.splitTextToSize(
      betCode.content,
      doc.internal.pageSize.getWidth() - 30
    )
    doc.text(contentLines, 15, 40)

    // Vị trí Y sau khi hiển thị nội dung
    let yPos = 40 + contentLines.length * 5

    // Thông tin tổng tiền
    doc.setFont('helvetica', 'bold')
    doc.text('Tổng tiền cược:', 15, yPos + 10)
    doc.text(
      'Tiềm năng thắng:',
      doc.internal.pageSize.getWidth() / 2 + 10,
      yPos + 10
    )

    doc.setFont('helvetica', 'normal')
    doc.text(`${betCode.stakeAmount?.toLocaleString() || 0} đ`, 50, yPos + 10)
    doc.text(
      `${betCode.potentialWinning?.toLocaleString() || 0} đ`,
      doc.internal.pageSize.getWidth() / 2 + 50,
      yPos + 10
    )

    // Chi tiết các dòng cược
    if (betCode.parsedContent && betCode.parsedContent.length > 0) {
      yPos += 20

      doc.setFont('helvetica', 'bold')
      doc.text('Chi tiết các dòng cược:', 15, yPos)

      // Dữ liệu cho bảng
      const tableData = betCode.parsedContent.map((line) => [
        line.multiStation ? line.station?.name : line.station?.name || 'N/A',
        line.numbers?.join(', ') || 'N/A',
        line.betType?.name || 'N/A',
        (line.amount?.toLocaleString() || 0) + ' đ',
      ])

      // Tạo bảng chi tiết dòng cược
      doc.autoTable({
        startY: yPos + 5,
        head: [['Đài', 'Số', 'Kiểu', 'Tiền']],
        body: tableData,
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        margin: { left: 15, right: 15 },
      })

      // Cập nhật vị trí Y
      yPos = doc.lastAutoTable.finalY + 10
    }

    // Hiển thị lỗi nếu có
    if (betCode.errors && betCode.errors.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 53, 69) // Red color for errors
      doc.text('Lỗi phát hiện:', 15, yPos)

      doc.setFont('helvetica', 'normal')

      betCode.errors.forEach((error, index) => {
        doc.text(
          `- ${error.message || 'Lỗi không xác định'}`,
          20,
          yPos + 5 + index * 5
        )
      })

      // Reset text color
      doc.setTextColor(0, 0, 0)
    }

    // Thêm footer
    doc.setFontSize(8)
    doc.text(
      `Xuất ngày: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )

    // Xuất file
    const finalFileName = `${fileName}_${betCode.id}_${format(
      new Date(),
      'dd-MM-yyyy'
    )}.pdf`
    doc.save(finalFileName)

    return true
  } catch (error) {
    console.error('Lỗi khi xuất PDF chi tiết:', error)
    return false
  }
}

// Export default
export default {
  exportToPdf,
  exportBetCodeDetailToPdf,
}
