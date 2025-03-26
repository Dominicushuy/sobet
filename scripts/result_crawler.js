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
 * Tạo chuỗi ngày chuẩn từ dữ liệu thô
 */
function formatDate(rawDate) {
  if (!rawDate) return ''
  const parts = rawDate.split('/')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return rawDate
}

/**
 * Trích xuất dữ liệu xổ số miền Bắc
 */
function extractMienBacData(document) {
  const boxKqxs = document.querySelector('.box_kqxs')
  if (!boxKqxs) {
    console.log('Không tìm thấy kết quả xổ số miền Bắc')
    return null
  }

  // Lấy thông tin tỉnh thành từ tiêu đề
  const titleElement = boxKqxs.querySelector('.title')
  let tenTinh = ''

  if (titleElement) {
    const tinhLink = titleElement.querySelector('a:first-child')
    if (tinhLink) {
      const tinhText = tinhLink.textContent
      tenTinh = tinhText.replace('KẾT QUẢ XỔ SỐ', '').trim()
    }
  }

  // Lấy thông tin ngày
  const ngayElement = boxKqxs.querySelector('.ngay a')
  const rawDate = ngayElement ? ngayElement.textContent.trim() : ''
  const ngay = formatDate(rawDate)

  // Lấy thông tin thứ
  const thuElement = boxKqxs.querySelector('.thu a')
  const thu = thuElement ? thuElement.textContent.trim() : ''

  // Lấy mã vé số
  const loaiVeElement = boxKqxs.querySelector('.loaive_content')
  const loaiVe = loaiVeElement ? loaiVeElement.textContent.trim() : ''

  // Tìm bảng kết quả xổ số
  const kqTable = boxKqxs.querySelector('table.box_kqxs_content')
  if (!kqTable) {
    console.log('Không tìm thấy bảng kết quả xổ số')
    return null
  }

  // Trích xuất kết quả các giải
  const ketQua = {
    giaiDacBiet: Array.from(kqTable.querySelectorAll('td.giaidb div')).map(
      (div) => div.textContent.trim()
    ),
    giaiNhat: Array.from(kqTable.querySelectorAll('td.giai1 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiNhi: Array.from(kqTable.querySelectorAll('td.giai2 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiBa: Array.from(kqTable.querySelectorAll('td.giai3 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiTu: Array.from(kqTable.querySelectorAll('td.giai4 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiNam: Array.from(kqTable.querySelectorAll('td.giai5 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiSau: Array.from(kqTable.querySelectorAll('td.giai6 div')).map((div) =>
      div.textContent.trim()
    ),
    giaiBay: Array.from(kqTable.querySelectorAll('td.giai7 div')).map((div) =>
      div.textContent.trim()
    ),
  }

  return {
    tinh: tenTinh,
    ngay,
    thu,
    loaiVe,
    ketQua,
  }
}

/**
 * Trích xuất dữ liệu xổ số miền Nam, Trung
 */
function extractMienNamTrungData(document) {
  const targetTable = document.querySelector('table.bkqmiennam')
  if (!targetTable) {
    console.log('Không tìm thấy bảng kết quả xổ số miền Nam/Trung')
    return null
  }

  // Lấy thông tin ngày và thứ
  const thuElement = targetTable.querySelector('.thu a')
  const thu = thuElement ? thuElement.textContent.trim() : ''

  const ngayElement = targetTable.querySelector('.ngay a')
  const rawDate = ngayElement ? ngayElement.textContent.trim() : ''
  const ngay = formatDate(rawDate)

  // Xử lý cho miền Nam và miền Trung
  const provinceTableNodes = targetTable.querySelectorAll('table.rightcl')
  const danhSachTinh = []

  provinceTableNodes.forEach((provinceTable) => {
    const tenTinh =
      provinceTable.querySelector('.tinh a')?.textContent.trim() || ''
    const maTinh =
      provinceTable.querySelector('.matinh')?.textContent.trim() || ''

    // Lấy thông tin các giải thưởng
    const ketQua = {
      giaiDacBiet: Array.from(
        provinceTable.querySelectorAll('.giaidb div')
      ).map((div) => div.textContent.trim()),
      giaiNhat: Array.from(provinceTable.querySelectorAll('.giai1 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiNhi: Array.from(provinceTable.querySelectorAll('.giai2 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiBa: Array.from(provinceTable.querySelectorAll('.giai3 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiTu: Array.from(provinceTable.querySelectorAll('.giai4 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiNam: Array.from(provinceTable.querySelectorAll('.giai5 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiSau: Array.from(provinceTable.querySelectorAll('.giai6 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiBay: Array.from(provinceTable.querySelectorAll('.giai7 div')).map(
        (div) => div.textContent.trim()
      ),
      giaiTam: Array.from(provinceTable.querySelectorAll('.giai8 div')).map(
        (div) => div.textContent.trim()
      ),
    }

    danhSachTinh.push({
      tinh: tenTinh,
      maTinh,
      ketQua,
    })
  })

  return {
    ngay,
    thu,
    cacTinh: danhSachTinh,
  }
}

/**
 * Lấy dữ liệu xổ số cho một ngày và miền cụ thể
 */
async function fetchLotteryResultByRegionAndDay(region, day) {
  try {
    console.log(`Đang lấy dữ liệu ${region} - ${day}...`)
    const url = `${API_CONFIG.baseUrl}/${region}/${day}.html`

    // Lấy HTML từ trang web
    const html = await fetchWithRetry(url)

    // Tạo DOM từ HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Trích xuất dữ liệu theo miền
    let result
    if (region === 'mien-bac') {
      result = extractMienBacData(doc)
    } else {
      result = extractMienNamTrungData(doc)
    }

    return result
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu ${region} - ${day}:`, error)
    return null
  }
}

/**
 * Lấy dữ liệu kết quả xổ số từ API
 */
export async function fetchLotteryResults(targetDate = null) {
  try {
    // Xác định ngày cần lấy dữ liệu
    let date = targetDate

    if (!date) {
      const now = new Date()
      const currentHour = now.getHours()

      // Quyết định lấy dữ liệu của ngày hiện tại hay ngày hôm qua
      if (currentHour >= 19) {
        date = now
      } else {
        date = new Date(now)
        date.setDate(date.getDate() - 1)
      }
    }

    // Xác định thứ của ngày cần lấy dữ liệu
    const dayOfWeek = date.getDay()
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

    console.log(
      `Lấy dữ liệu cho thứ: ${targetDayOfWeek} (${
        date.toISOString().split('T')[0]
      })`
    )

    // Cấu trúc dữ liệu kết quả
    const ketQuaXoSo = {
      metadata: {
        version: '1.1',
        nguon: API_CONFIG.baseUrl,
        ngayLayDuLieu: new Date().toISOString(),
        tongSoMien: API_CONFIG.regions.length,
        tongSoNgay: 1,
        thuDaLay: targetDayOfWeek,
        ngayDaLay: date.toISOString().split('T')[0],
        quyTacApDung: 'Lấy dữ liệu theo thời gian cụ thể của từng miền',
      },
      duLieu: {
        [targetDayOfWeek]: {},
      },
    }

    // Duyệt qua từng miền
    for (const mien of API_CONFIG.regions) {
      // Lấy dữ liệu
      const duLieu = await fetchLotteryResultByRegionAndDay(
        mien,
        targetDayOfWeek
      )
      ketQuaXoSo.duLieu[targetDayOfWeek][mien] = duLieu

      // Đợi giữa các request
      await delay(API_CONFIG.delayBetweenRequests)
    }

    return ketQuaXoSo
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu xổ số:', error)
    throw error
  }
}

/**
 * Kiểm tra xem đã có kết quả xổ số cho ngày cụ thể chưa
 */
export async function hasLotteryResultForDate(db, date) {
  // Reset time về 00:00:00 để so sánh chính xác ngày
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // Tạo ngày tiếp theo
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // Kiểm tra trong database
  const count = await db.lotteryResults
    .where('date')
    .between(targetDate, nextDay)
    .count()

  return count > 0
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
    if (!regionData) return // Skip if no data for this region

    const dbRegion = REGION_MAPPING[regionKey]

    if (regionKey === 'mien-bac') {
      // Xử lý miền Bắc
      results.push({
        region: dbRegion,
        station: regionData.tinh || 'Miền Bắc',
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
      if (regionData.cacTinh && Array.isArray(regionData.cacTinh)) {
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
    }
  })

  return results
}
