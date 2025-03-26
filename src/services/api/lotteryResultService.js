// src/services/api/lotteryResultService.js
import axios from 'axios'

// Cấu hình API
const API_CONFIG = {
  baseUrl: 'https://www.minhngoc.net.vn/ket-qua-xo-so',
  regions: ['mien-bac', 'mien-trung', 'mien-nam'],
  days: [
    'thu-hai',
    'thu-ba',
    'thu-tu',
    'thu-nam',
    'thu-sau',
    'thu-bay',
    'chu-nhat',
  ],
  delayBetweenRequests: 1000,
  maxRetries: 3,
}

// Ánh xạ từ tên miền sang region trong database
const REGION_MAPPING = {
  'mien-bac': 'north',
  'mien-trung': 'central',
  'mien-nam': 'south',
}

// Ánh xạ từ thứ sang ngày trong tuần
const DAY_MAPPING = {
  'thu-hai': 'monday',
  'thu-ba': 'tuesday',
  'thu-tu': 'wednesday',
  'thu-nam': 'thursday',
  'thu-sau': 'friday',
  'thu-bay': 'saturday',
  'chu-nhat': 'sunday',
}

/**
 * Tạo thời gian chờ giữa các request
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Lấy HTML từ URL với cơ chế thử lại
 */
async function fetchWithRetry(url, retries = API_CONFIG.maxRetries) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    if (retries <= 0) throw error
    console.log(
      `Thử lại (${API_CONFIG.maxRetries - retries + 1}/${
        API_CONFIG.maxRetries
      }): ${url}`
    )
    await delay(API_CONFIG.delayBetweenRequests)
    return fetchWithRetry(url, retries - 1)
  }
}

/**
 * Lấy dữ liệu kết quả xổ số từ API
 */
export async function fetchLotteryResults() {
  try {
    // Xác định thứ cần lấy dữ liệu dựa trên thời gian hiện tại
    const now = new Date()
    const currentHour = now.getHours()

    // Quyết định lấy dữ liệu của ngày hiện tại hay ngày hôm qua
    let targetDate
    if (currentHour >= 19) {
      targetDate = now
    } else {
      targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - 1)
    }

    // Xác định thứ của ngày cần lấy dữ liệu
    const dayOfWeek = targetDate.getDay()
    const daysMapping = [
      'chu-nhat',
      'thu-hai',
      'thu-ba',
      'thu-tu',
      'thu-nam',
      'thu-sau',
      'thu-bay',
    ]
    const targetDayOfWeek = daysMapping[dayOfWeek]

    // Giả lập việc lấy dữ liệu từ API - trong thực tế có thể thay bằng gọi API thực
    // Trong trường hợp này, chúng ta sẽ trả về dữ liệu mẫu tương tự như file JSON đã cung cấp

    // Trả về dữ liệu mẫu (có thể thay bằng gọi API thực tế sau này)
    return {
      metadata: {
        version: '1.1',
        nguon: API_CONFIG.baseUrl,
        ngayLayDuLieu: new Date().toISOString(),
        tongSoMien: API_CONFIG.regions.length,
        tongSoNgay: 1,
        thuDaLay: targetDayOfWeek,
        ngayDaLay: targetDate.toISOString().split('T')[0],
      },
      duLieu: {
        [targetDayOfWeek]: {
          // Dữ liệu sẽ được lấy từ API thực tế
          // Tạm thời trả về một cấu trúc giống với file JSON mẫu
        },
      },
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu xổ số:', error.message)
    throw error
  }
}

/**
 * Chuyển đổi dữ liệu JSON từ API sang định dạng phù hợp với database
 */
export function convertLotteryResults(rawData) {
  const results = []
  const data = rawData.duLieu
  const dayOfWeek = rawData.metadata.thuDaLay
  const date = rawData.metadata.ngayDaLay

  // Duyệt qua các miền
  Object.keys(data[dayOfWeek]).forEach((regionKey) => {
    const regionData = data[dayOfWeek][regionKey]
    const dbRegion = REGION_MAPPING[regionKey]

    if (regionKey === 'mien-bac') {
      // Xử lý miền Bắc
      results.push({
        region: dbRegion,
        station: regionData.tinh,
        date: new Date(regionData.ngay),
        dayOfWeek: DAY_MAPPING[dayOfWeek],
        results: {
          special: regionData.ketQua.giaiDacBiet,
          first: regionData.ketQua.giaiNhat,
          second: regionData.ketQua.giaiNhi,
          third: regionData.ketQua.giaiBa,
          fourth: regionData.ketQua.giaiTu,
          fifth: regionData.ketQua.giaiNam,
          sixth: regionData.ketQua.giaiSau,
          seventh: regionData.ketQua.giaiBay,
        },
        rawData: regionData,
        importedAt: new Date(),
      })
    } else {
      // Xử lý miền Nam và miền Trung
      regionData.cacTinh.forEach((tinhData) => {
        results.push({
          region: dbRegion,
          station: tinhData.tinh,
          date: new Date(regionData.ngay),
          dayOfWeek: DAY_MAPPING[dayOfWeek],
          results: {
            special: tinhData.ketQua.giaiDacBiet,
            first: tinhData.ketQua.giaiNhat,
            second: tinhData.ketQua.giaiNhi,
            third: tinhData.ketQua.giaiBa,
            fourth: tinhData.ketQua.giaiTu,
            fifth: tinhData.ketQua.giaiNam,
            sixth: tinhData.ketQua.giaiSau,
            seventh: tinhData.ketQua.giaiBay,
            eighth: tinhData.ketQua.giaiTam,
          },
          rawData: tinhData,
          importedAt: new Date(),
        })
      })
    }
  })

  return results
}
