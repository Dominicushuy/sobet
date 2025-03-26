// src/services/export/excelExporter.js
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { BET_CODE_STATUS } from '@/config/constants'

/**
 * Xuất danh sách mã cược ra file Excel
 * @param {Array} betCodes - Danh sách mã cược cần xuất
 * @param {string} fileName - Tên file (không bao gồm phần mở rộng)
 */
export function exportToExcel(betCodes, fileName = 'BetCodes') {
  if (!betCodes || betCodes.length === 0) {
    console.error('Không có dữ liệu để xuất')
    return
  }

  try {
    // Chuẩn bị dữ liệu
    const data = betCodes.map((betCode) => {
      return {
        ID: betCode.id,
        'Nội dung': betCode.content,
        'Tiền cược': betCode.stakeAmount || 0,
        'Tiềm năng thắng': betCode.potentialWinning || 0,
        'Ngày tạo': format(new Date(betCode.createdAt), 'HH:mm - dd/MM/yyyy', {
          locale: vi,
        }),
        'Trạng thái': getStatusText(betCode.status),
      }
    })

    // Tạo workbook và worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mã cược')

    // Định dạng cột
    const columnWidths = [
      { wpx: 60 }, // ID
      { wpx: 300 }, // Nội dung
      { wpx: 100 }, // Tiền cược
      { wpx: 120 }, // Tiềm năng
      { wpx: 150 }, // Ngày tạo
      { wpx: 100 }, // Trạng thái
    ]
    worksheet['!cols'] = columnWidths

    // Xuất file
    const finalFileName = `${fileName}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`
    XLSX.writeFile(workbook, finalFileName)

    return true
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error)
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
