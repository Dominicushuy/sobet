// src/services/betCodeParser/formatter.js
import { defaultStations, defaultBetTypes } from '@/config/defaults'

/**
 * Chuẩn hóa mã cược đầu vào
 * @param {string} betCode - Mã cược đầu vào
 * @returns {string} Mã cược đã chuẩn hóa
 */
export function formatBetCode(betCode) {
  if (!betCode || typeof betCode !== 'string') {
    return betCode
  }

  // Phân tách các dòng
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')

  if (lines.length === 0) {
    return betCode
  }

  const formattedLines = []

  // Xử lý dòng đầu tiên (đài)
  const formattedStation = formatStation(lines[0])
  formattedLines.push(formattedStation)

  // Xử lý các dòng còn lại
  for (let i = 1; i < lines.length; i++) {
    // Bỏ qua các dòng chỉ chứa tên đài trung gian
    if (isStationOnlyLine(lines[i])) {
      continue
    }

    const formattedLine = formatBetLine(lines[i])
    formattedLines.push(formattedLine)
  }

  return formattedLines.join('\n')
}

/**
 * Kiểm tra xem dòng có phải chỉ chứa tên đài không
 */
function isStationOnlyLine(line) {
  // Loại bỏ dấu chấm cuối
  const cleanLine = line.replace(/\.$/, '').trim().toLowerCase()

  // Kiểm tra xem là tên đài đơn thuần không
  return defaultStations.some(
    (station) =>
      station.name.toLowerCase() === cleanLine ||
      station.aliases.some((alias) => alias === cleanLine)
  )
}

/**
 * Chuẩn hóa phần đài
 * @param {string} stationLine - Dòng chứa thông tin đài
 * @returns {string} Dòng đài đã chuẩn hóa
 */
function formatStation(stationLine) {
  // Loại bỏ dấu chấm cuối
  let formattedLine = stationLine.trim().replace(/\.$/, '')

  // Nếu đã có số cược, tách phần đài ra
  if (/\d/.test(formattedLine) && !formattedLine.match(/^\d+d/)) {
    const stationPart = extractStationPart(formattedLine)
    return stationPart
  }

  // Xử lý đài ghép không đúng định dạng
  const stationText = formattedLine.trim().toLowerCase()

  // Tìm các mẫu đài ghép liền nhau không dùng dấu phân cách
  const mergedStations = findMergedStations(stationText)
  if (mergedStations.found) {
    return mergedStations.formatted
  }

  // Xử lý các viết tắt gây nhầm lẫn
  if (stationText === 'dn') {
    const currentDay = getCurrentDayOfWeek()
    // Thứ 4 (ngày 3) có cả Đồng Nai và Đà Nẵng
    if (currentDay === 3) {
      return 'dnai' // Mặc định chọn Đồng Nai
    }
  }

  // Nếu không có gì để sửa, giữ nguyên
  return formattedLine
}

/**
 * Tìm và sửa đài ghép liền nhau không dùng dấu phân cách
 */
function findMergedStations(stationText) {
  for (const station1 of defaultStations) {
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      for (const station2 of defaultStations) {
        // Không xét ghép giữa đài với chính nó
        if (station1.name === station2.name) continue

        for (const alias2 of [
          station2.name.toLowerCase(),
          ...station2.aliases,
        ]) {
          // Nếu hai alias ghép lại bằng stationText
          if (stationText === alias1 + alias2) {
            return {
              found: true,
              formatted: `${alias1}.${alias2}`,
            }
          }
        }
      }
    }
  }

  return { found: false }
}

/**
 * Lấy ngày hiện tại trong tuần (0: Chủ nhật, 1-6: Thứ 2 - Thứ 7)
 */
function getCurrentDayOfWeek() {
  return new Date().getDay()
}

/**
 * Trích xuất phần đài từ một dòng
 */
function extractStationPart(line) {
  // Tìm vị trí của số đầu tiên hoặc kiểu cược
  let index = line.length

  // Tìm vị trí số đầu tiên (trừ trường hợp bắt đầu bằng 2d, 3d)
  const numberMatch = /(?<!\d[a-z])\d/.exec(line)
  if (numberMatch) {
    index = Math.min(index, numberMatch.index)
  }

  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  for (const alias of betTypeAliases) {
    const aliasPos = line.indexOf(alias)
    if (aliasPos !== -1) {
      index = Math.min(index, aliasPos)
    }
  }

  return line.substring(0, index).trim()
}

/**
 * Chuẩn hóa dòng cược
 * @param {string} line - Dòng cược
 * @returns {string} Dòng cược đã chuẩn hóa
 */
function formatBetLine(line) {
  // Bước 1: Xác định kiểu cược và tiền cược (thường ở cuối dòng)
  const betTypeAndAmountPatterns = []

  // Tìm tất cả các mẫu kiểu cược + số tiền
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  for (const alias of betTypeAliases) {
    betTypeAndAmountPatterns.push(
      new RegExp(`(${alias})(\\d+(?:[,.n]\\d+)?)`, 'gi')
    )
  }

  let normalizedLine = line.trim()

  // Sửa lỗi "xcdui" thành "xcduoi"
  normalizedLine = normalizedLine.replace(/xcdui/g, 'xcduoi')

  // Bước 2: Chuẩn hóa phần số cược
  // Thay thế các dấu phân cách không chuẩn bằng dấu chấm
  normalizedLine = normalizedLine.replace(/[,\- ]+/g, '.')

  // Loại bỏ các dấu chấm dư thừa/liên tiếp
  normalizedLine = normalizedLine.replace(/\.{2,}/g, '.')
  normalizedLine = normalizedLine.replace(/^\.|\.$/g, '')

  // Bước 3: Phân tích các dãy số liền nhau
  // Xác định chữ số cần xử lý (2 hoặc 3)
  const digitLength = determineDigitLength(normalizedLine)

  // Xử lý các trường hợp số không có dấu phân cách
  const noSeparatorPattern = new RegExp(
    `(\\d{${digitLength * 2},}(?!\\d*[a-z]))`,
    'g'
  )
  const noSeparatorMatch = normalizedLine.match(noSeparatorPattern)

  if (noSeparatorMatch) {
    for (const match of noSeparatorMatch) {
      // Phân tích thành từng cụm theo độ dài số
      const chunks = []

      for (let i = 0; i < match.length; i += digitLength) {
        if (i + digitLength <= match.length) {
          chunks.push(match.substr(i, digitLength))
        }
      }

      const replaced = chunks.join('.')
      normalizedLine = normalizedLine.replace(match, replaced)
    }
  }

  // Bước 4: Chuẩn hóa định dạng tiền cược
  // Xử lý trường hợp nhiều kiểu cược trên cùng dãy số
  // Ví dụ: 93.97da0,5.dd5 -> 93.97da0.5dd5 hoặc dau20.duoi10
  for (const pattern of betTypeAndAmountPatterns) {
    normalizedLine = normalizedLine.replace(
      pattern,
      (match, betType, amount) => {
        // Chuẩn hóa số tiền (đổi dấu , thành .)
        const normalizedAmount = amount.replace(/,/g, '.')
        return `${betType}${normalizedAmount}`
      }
    )
  }

  return normalizedLine
}

/**
 * Xác định độ dài chữ số phổ biến trong chuỗi số
 * @param {string} numbersStr - Chuỗi chứa các số
 * @returns {number} Độ dài chữ số (2 hoặc 3)
 */
function determineDigitLength(numbersStr) {
  // Tách các số
  const numbers = numbersStr.split('.').filter((n) => /^\d+$/.test(n))

  // Đếm số lượng số có 2 chữ số và 3 chữ số
  let twoDigitCount = 0
  let threeDigitCount = 0
  let fourDigitCount = 0

  for (const num of numbers) {
    if (num.length === 2) twoDigitCount++
    else if (num.length === 3) threeDigitCount++
    else if (num.length === 4) fourDigitCount++
  }

  // Nếu có nhiều số 3 chữ số hơn, trả về 3
  // Nếu có nhiều số 4 chữ số, trả về 4
  // Ngược lại trả về 2
  if (fourDigitCount > threeDigitCount && fourDigitCount > twoDigitCount) {
    return 4
  } else if (threeDigitCount > twoDigitCount) {
    return 3
  } else {
    return 2
  }
}

/**
 * Tạo mã cược chuẩn từ các thành phần
 * @param {string} station - Đài
 * @param {Array} lines - Các dòng cược
 * @returns {string} Mã cược chuẩn
 */
export function createStandardBetCode(station, lines = []) {
  if (!station) return ''

  const formattedStation = formatStation(station)
  const formattedLines = lines.map((line) => formatBetLine(line))

  return [formattedStation, ...formattedLines].join('\n')
}

/**
 * Tách mã cược thành các thành phần để dễ dàng xử lý
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Các thành phần của mã cược
 */
export function decomposeBetCode(betCode) {
  if (!betCode || typeof betCode !== 'string') {
    return { station: '', lines: [] }
  }

  // Phân tách các dòng
  const lines = betCode
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')

  if (lines.length === 0) {
    return { station: '', lines: [] }
  }

  // Lấy phần đài
  const station = extractStationPart(lines[0])

  // Lấy phần số cược từ dòng đầu tiên nếu có
  let betLines = []
  const firstLineBetPart = lines[0].substring(station.length).trim()
  if (firstLineBetPart) {
    betLines.push(firstLineBetPart)
  }

  // Thêm các dòng còn lại, bỏ qua các dòng chỉ chứa tên đài
  for (let i = 1; i < lines.length; i++) {
    if (!isStationOnlyLine(lines[i])) {
      betLines.push(lines[i])
    }
  }

  return {
    station,
    lines: betLines,
  }
}

/**
 * Tìm và gợi ý sửa lỗi cú pháp mã cược
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Các gợi ý sửa lỗi
 */
export function suggestBetCodeFixes(betCode) {
  const suggestions = []

  // Kiểm tra đài ghép không đúng định dạng
  const decomposed = decomposeBetCode(betCode)
  const stationText = decomposed.station.trim().toLowerCase()

  // Tìm các mẫu đài ghép không dùng dấu phân cách
  const mergedStations = findMergedStations(stationText)
  if (mergedStations.found) {
    suggestions.push({
      type: 'STATION_FORMAT',
      message: `Đài ghép "${stationText}" nên được viết là "${mergedStations.formatted}" (có dấu chấm ở giữa)`,
      original: stationText,
      suggested: mergedStations.formatted,
    })
  }

  // Kiểm tra đài viết tắt gây nhầm lẫn
  if (stationText === 'dn') {
    suggestions.push({
      type: 'AMBIGUOUS_STATION',
      message: `"dn" có thể là Đồng Nai (dnai) hoặc Đà Nẵng (dnang), nên sử dụng tên đầy đủ hơn`,
      original: 'dn',
      suggested: ['dnai', 'dnang'],
    })
  }

  if (stationText === 'dt') {
    suggestions.push({
      type: 'AMBIGUOUS_STATION',
      message: `"dt" có thể là Đồng Tháp (dthap) hoặc 'đài trung' (dtrung), nên sử dụng tên đầy đủ hơn`,
      original: 'dt',
      suggested: ['dthap', 'dtrung'],
    })
  }

  // Kiểm tra các dòng kết thúc bằng dấu chấm
  const lines = betCode.split(/\r?\n/).filter((line) => line.trim() !== '')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Kiểm tra dòng kết thúc bằng dấu chấm
    if (/\.$/.test(line) && isStationOnlyLine(line)) {
      suggestions.push({
        type: 'TRAILING_DOTS',
        message: `Không nên để dấu chấm ở cuối tên đài "${line}"`,
        original: line,
        suggested: line.replace(/\.$/, ''),
      })
    }

    // Kiểm tra "xcdui" nên đổi thành "xcduoi"
    if (line.includes('xcdui')) {
      suggestions.push({
        type: 'BET_TYPE_FORMAT',
        message: `Kiểu cược "xcdui" nên được viết là "xcduoi"`,
        original: 'xcdui',
        suggested: 'xcduoi',
      })
    }

    // Kiểm tra định dạng số cược
    // Tìm các trường hợp số liền nhau không có dấu phân cách
    const digitLength = determineDigitLength(line)
    const noSeparatorPattern = new RegExp(
      `(\\d{${digitLength * 2},}(?!\\d*[a-z]))`,
      'g'
    )
    const noSeparatorMatch = line.match(noSeparatorPattern)

    if (noSeparatorMatch) {
      for (const match of noSeparatorMatch) {
        // Phân tích thành từng cụm theo độ dài số
        const chunks = []
        for (let j = 0; j < match.length; j += digitLength) {
          if (j + digitLength <= match.length) {
            chunks.push(match.substr(j, digitLength))
          }
        }

        const replaced = chunks.join('.')

        suggestions.push({
          type: 'NUMBER_FORMAT',
          message: `Dãy số "${match}" nên được phân tách bằng dấu chấm: "${replaced}"`,
          original: match,
          suggested: replaced,
        })
      }
    }
  }

  return {
    hasSuggestions: suggestions.length > 0,
    suggestions,
  }
}

export default {
  formatBetCode,
  createStandardBetCode,
  decomposeBetCode,
  suggestBetCodeFixes,
}
