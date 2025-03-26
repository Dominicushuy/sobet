// src/services/importers/resultImporter.js
import { db } from '@/database/db'
import {
  fetchLotteryResults,
  convertLotteryResults,
  hasLotteryResultForDate,
} from '../api/lotteryResultService'

/**
 * Import kết quả xổ số từ API hoặc file JSON vào database
 */
export async function importLotteryResults(date = null) {
  try {
    console.log('Bắt đầu import kết quả xổ số...')

    // Nếu đã có kết quả cho ngày này, không cần import lại
    if (date) {
      const hasResult = await hasLotteryResultForDate(db, date)
      if (hasResult) {
        console.log(
          `Đã có kết quả xổ số cho ngày ${
            date.toISOString().split('T')[0]
          }, không cần import lại`
        )
        return {
          success: true,
          importedCount: 0,
          message: `Đã có kết quả xổ số cho ngày ${
            date.toISOString().split('T')[0]
          }, không cần import lại`,
          alreadyExists: true,
        }
      }
    }

    // Lấy dữ liệu từ API
    const rawData = await fetchLotteryResults(date)

    // Chuyển đổi dữ liệu sang format phù hợp với database
    const formattedResults = convertLotteryResults(rawData)

    // Kiểm tra dữ liệu đã tồn tại
    const importedCount = await saveResultsToDb(formattedResults)

    console.log(`Đã import thành công ${importedCount} kết quả xổ số`)
    return {
      success: true,
      importedCount,
      message: `Đã import thành công ${importedCount} kết quả xổ số`,
      alreadyExists: false,
    }
  } catch (error) {
    console.error('Lỗi khi import kết quả xổ số:', error)
    return {
      success: false,
      error: error.message,
      alreadyExists: false,
    }
  }
}

/**
 * Lưu kết quả xổ số vào database, bỏ qua nếu đã tồn tại
 */
async function saveResultsToDb(results) {
  let importedCount = 0

  await db.transaction('rw', db.lotteryResults, async () => {
    for (const result of results) {
      // Kiểm tra kết quả đã tồn tại chưa
      const existingResult = await db.lotteryResults
        .where({
          region: result.region,
          station: result.station,
          date: result.date,
        })
        .first()

      if (!existingResult) {
        // Thêm mới nếu chưa tồn tại
        await db.lotteryResults.add(result)
        importedCount++
      }
    }
  })

  return importedCount
}

/**
 * Nhập kết quả xổ số từ dữ liệu JSON
 */
export async function importLotteryResultsFromJson(jsonData) {
  try {
    // Chuyển đổi dữ liệu sang format phù hợp với database
    const formattedResults = convertLotteryResults(jsonData)

    // Lưu vào database
    const importedCount = await saveResultsToDb(formattedResults)

    return {
      success: true,
      importedCount,
      message: `Đã import thành công ${importedCount} kết quả xổ số từ JSON`,
    }
  } catch (error) {
    console.error('Lỗi khi import kết quả xổ số từ JSON:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Xóa kết quả xổ số cũ (quá n ngày)
 */
export async function cleanupOldResults(retentionDays = 7) {
  try {
    // Tính ngày threshold
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - retentionDays)

    // Đếm trước khi xóa
    const countBefore = await db.lotteryResults.count()

    // Xóa kết quả cũ
    const deletedCount = await db.lotteryResults
      .where('date')
      .below(thresholdDate)
      .delete()

    return {
      success: true,
      deletedCount,
      message: `Đã xóa ${deletedCount} kết quả xổ số cũ (trước ${
        thresholdDate.toISOString().split('T')[0]
      })`,
    }
  } catch (error) {
    console.error('Lỗi khi xóa kết quả xổ số cũ:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
