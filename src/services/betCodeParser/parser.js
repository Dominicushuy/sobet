// src/services/betCodeParser/parser.js
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '@/config/defaults'
import { REGIONS } from '@/config/constants'

/**
 * Phân tích cú pháp mã cược thành các thành phần
 * @param {string} betCode - Mã cược cần phân tích
 * @returns {object} Kết quả phân tích
 */
export function parseBetCode(betCode) {
  try {
    // Chuẩn hóa input
    const normalizedCode = normalizeBetCode(betCode)

    // Tách mã thành các dòng riêng biệt
    const lines = splitToLines(normalizedCode)

    // Phân tích từng dòng
    const parsedLines = lines.map((line) => parseBetCodeLine(line))

    return {
      success: true,
      originalCode: betCode,
      normalizedCode,
      lines: parsedLines,
      errors: [],
    }
  } catch (error) {
    return {
      success: false,
      originalCode: betCode,
      normalizedCode: betCode,
      lines: [],
      errors: [
        {
          type: 'PARSE_ERROR',
          message: 'Lỗi khi phân tích mã cược',
          details: error.message,
        },
      ],
    }
  }
}

/**
 * Chuẩn hóa mã cược đầu vào
 * @param {string} betCode - Mã cược cần chuẩn hóa
 * @returns {string} Mã cược đã chuẩn hóa
 */
export function normalizeBetCode(betCode) {
  if (!betCode) return ''

  let normalized = betCode.trim()

  // Chuyển đổi xuống dòng thành khoảng trắng
  normalized = normalized.replace(/\r\n/g, '\n')

  // Xử lý các dấu chấm hoặc dấu phẩy thừa liên tiếp
  normalized = normalized.replace(/\.{2,}/g, '.')
  normalized = normalized.replace(/,{2,}/g, ',')

  // Xử lý dấu chấm và dấu phẩy ở đầu dòng
  normalized = normalized.replace(/^\./g, '')
  normalized = normalized.replace(/^,/g, '')

  // Thêm khoảng trắng sau dấu chấm đánh dấu đài
  normalized = normalized.replace(/(\w+)\.(\w+)/g, '$1. $2')

  // Xử lý các dấu cách thừa
  normalized = normalized.replace(/\s+/g, ' ')

  // Bỏ dấu cách trước và sau các dấu đặc biệt thường gặp
  normalized = normalized.replace(/\s*([x*,;:])\s*/g, '$1')

  // Xử lý dấu chấm để giữ lại khoảng trắng cần thiết cho phân tách số
  normalized = normalized.replace(/\s*\.\s*/g, '. ')
  normalized = normalized.replace(/\.\s+/g, '. ')

  // Xử lý dấu gạch ngang
  normalized = normalized.replace(/\s*-\s*/g, '-')

  return normalized
}

/**
 * Tách mã cược thành các dòng riêng biệt
 * @param {string} normalizedCode - Mã cược đã chuẩn hóa
 * @returns {string[]} Mảng các dòng cược
 */
export function splitToLines(normalizedCode) {
  if (!normalizedCode) return []

  // Tách theo dấu xuống dòng
  let lines = normalizedCode.split('\n')

  // Loại bỏ dòng trống
  lines = lines.filter((line) => line.trim().length > 0)

  return lines
}

/**
 * Phân tích một dòng mã cược
 * @param {string} line - Dòng mã cược cần phân tích
 * @returns {object} Kết quả phân tích cho dòng
 */
export function parseBetCodeLine(line) {
  try {
    const trimmedLine = line.trim()

    // Xử lý các dòng đặc biệt
    // Kiểm tra xem có phải định dạng nhiều đài không (2dmn, 3dmn, 2dmt, ...)
    const multiStationMatch = trimmedLine.match(/^(\d+)(dmn|dmt|dn)(.*)$/i)
    if (multiStationMatch) {
      return parseMultiStationLine(trimmedLine, multiStationMatch)
    }

    // Phân tích đài
    const stationInfo = extractStationInfo(trimmedLine)
    const station = stationInfo.station

    // Phân tách phần còn lại sau khi lấy đài
    let remainingLine = stationInfo.remainingLine

    // Phân tích các số và kiểu đánh
    const numbersAndBetTypes = extractNumbersAndBetTypes(remainingLine)

    // Xác định kiểu cược dựa trên các phần đã phân tích
    const betType = determineBetType(numbersAndBetTypes.betTypeParts)

    // Xử lý các số cược
    const numbers = processNumbers(numbersAndBetTypes.numberParts, betType)

    // Phân tích số tiền
    const amount = parseAmount(numbersAndBetTypes.amountPart)

    return {
      originalLine: line,
      station,
      betType,
      numbers,
      amount,
      valid: Boolean(station && betType && numbers.length > 0 && amount > 0),
      error: null,
      details: {
        stationInfo,
        numbersAndBetTypes,
      },
    }
  } catch (error) {
    return {
      originalLine: line,
      station: null,
      betType: null,
      numbers: [],
      amount: 0,
      valid: false,
      error: {
        type: 'PARSE_LINE_ERROR',
        message: 'Lỗi khi phân tích dòng mã cược',
        details: error.message,
      },
    }
  }
}

/**
 * Phân tích dòng mã cược nhiều đài
 * @param {string} line - Dòng mã cược
 * @param {array} matches - Kết quả từ regex match
 * @returns {object} Kết quả phân tích dòng nhiều đài
 */
function parseMultiStationLine(line, matches) {
  const [, count, regionCode, remainingLine] = matches

  // Xác định region dựa trên code
  let region = REGIONS.SOUTH
  if (regionCode.toLowerCase() === 'dmn') {
    region = REGIONS.SOUTH
  } else if (regionCode.toLowerCase() === 'dmt') {
    region = REGIONS.CENTRAL
  } else if (regionCode.toLowerCase() === 'dn') {
    region = REGIONS.NORTH
  }

  // Tạo thông tin đài nhiều miền
  const station = {
    id: null,
    name: `${count} đài miền ${
      region === REGIONS.SOUTH
        ? 'Nam'
        : region === REGIONS.CENTRAL
        ? 'Trung'
        : 'Bắc'
    }`,
    alias: `${count}${regionCode}`,
    region,
    count: parseInt(count),
  }

  // Phân tích phần còn lại tương tự dòng bình thường
  const numbersAndBetTypes = extractNumbersAndBetTypes(remainingLine.trim())

  // Xác định kiểu cược
  const betType = determineBetType(numbersAndBetTypes.betTypeParts)

  // Xử lý các số cược
  const numbers = processNumbers(numbersAndBetTypes.numberParts, betType)

  // Phân tích số tiền
  const amount = parseAmount(numbersAndBetTypes.amountPart)

  return {
    originalLine: line,
    station,
    betType,
    numbers,
    amount,
    valid: Boolean(station && betType && numbers.length > 0 && amount > 0),
    error: null,
    multiStation: true,
    details: {
      stationCount: parseInt(count),
      regionCode,
      numbersAndBetTypes,
    },
  }
}

/**
 * Trích xuất thông tin đài từ dòng mã cược
 * @param {string} line - Dòng mã cược
 * @returns {object} Thông tin đài và phần còn lại của dòng
 */
function extractStationInfo(line) {
  // Danh sách các từ trong dòng
  const words = line.split(/\s+/)

  let stationName = ''
  let stationFound = false
  let consumedWords = 0

  // Trường hợp đặc biệt: tên đài kết hợp với dấu chấm (vl.tv)
  if (words[0] && words[0].includes('.') && !words[0].match(/\d+\.\d+/)) {
    const stationParts = words[0].split('.')
    if (stationParts.length === 2) {
      const station1 = findStationByAlias(stationParts[0])
      const station2 = findStationByAlias(stationParts[1])

      if (station1 && station2) {
        stationName = `${station1.name} và ${station2.name}`
        stationFound = true
        consumedWords = 1

        // Tạo thông tin đài kết hợp
        const combinedStation = {
          id: null,
          name: stationName,
          alias: words[0],
          region: station1.region,
          stations: [station1, station2],
        }

        return {
          station: combinedStation,
          remainingLine: words.slice(consumedWords).join(' '),
        }
      }
    }
  }

  // Nếu không phải dạng kết hợp, thử tìm từng đài đơn lẻ
  for (let i = 0; i < words.length; i++) {
    const potentialStation = words.slice(0, i + 1).join(' ')
    const station = findStationByName(potentialStation)

    if (station) {
      stationName = potentialStation
      stationFound = true
      consumedWords = i + 1

      // Kiểm tra xem có đài thứ 2 được phân cách bằng dấu chấm không
      if (i + 1 < words.length && words[i + 1].startsWith('.')) {
        const nextPart = words[i + 1].substring(1)
        const nextStation = findStationByAlias(nextPart)

        if (nextStation) {
          stationName = `${station.name} và ${nextStation.name}`
          consumedWords = i + 2

          // Tạo thông tin đài kết hợp
          const combinedStation = {
            id: null,
            name: stationName,
            alias: `${station.aliases[0]}.${nextStation.aliases[0]}`,
            region: station.region,
            stations: [station, nextStation],
          }

          return {
            station: combinedStation,
            remainingLine: words.slice(consumedWords).join(' '),
          }
        }
      }

      return {
        station: {
          id: station.id,
          name: station.name,
          alias: station.aliases[0] || '',
          region: station.region,
        },
        remainingLine: words.slice(consumedWords).join(' '),
      }
    }
  }

  // Trường hợp không tìm thấy đài
  if (!stationFound) {
    // Tìm kiếm các alias đài ngắn (1-2 ký tự)
    const potentialStationAlias = words[0]
    const station = findStationByAlias(potentialStationAlias)

    if (station) {
      return {
        station: {
          id: station.id,
          name: station.name,
          alias: station.aliases[0] || '',
          region: station.region,
        },
        remainingLine: words.slice(1).join(' '),
      }
    }

    // Không tìm thấy đài nào
    return {
      station: null,
      remainingLine: line,
    }
  }

  return {
    station: null,
    remainingLine: line,
  }
}

/**
 * Tìm đài theo tên hoặc alias
 * @param {string} name - Tên hoặc alias của đài
 * @returns {object|null} Thông tin đài hoặc null nếu không tìm thấy
 */
function findStationByName(name) {
  if (!name) return null

  // Chuẩn hóa tên để so sánh
  const normalizedName = name.toLowerCase().trim()

  // Tìm kiếm theo tên đầy đủ
  const stationByName = defaultStations.find(
    (station) => station.name.toLowerCase() === normalizedName
  )

  if (stationByName) return stationByName

  // Nếu không tìm thấy theo tên đầy đủ, thử tìm theo alias
  return findStationByAlias(normalizedName)
}

/**
 * Tìm đài theo alias
 * @param {string} alias - Alias của đài
 * @returns {object|null} Thông tin đài hoặc null nếu không tìm thấy
 */
function findStationByAlias(alias) {
  if (!alias) return null

  // Chuẩn hóa alias để so sánh
  const normalizedAlias = alias.toLowerCase().trim()

  // Tìm kiếm theo alias
  return defaultStations.find((station) =>
    station.aliases.some((a) => a.toLowerCase() === normalizedAlias)
  )
}

/**
 * Trích xuất các phần số và kiểu cược từ dòng cược
 * @param {string} line - Dòng cược sau khi đã loại bỏ thông tin đài
 * @returns {object} Các phần số, kiểu cược và số tiền
 */
function extractNumbersAndBetTypes(line) {
  if (!line) {
    return {
      numberParts: [],
      betTypeParts: [],
      amountPart: '',
    }
  }

  // Các pattern nhận diện bao gồm:
  // - Các số cách nhau bởi dấu chấm, phẩy, hoặc khoảng trắng: 12 34 56, 12.34.56, 12,34,56
  // - Các số dạng kéo: 10/20keo90
  // - Các kiểu cược: dd, xc, da, b, ...
  // - Số tiền ở cuối: 10, 0.5, 1,5, 10n

  // Tách các phần theo mẫu
  const betTypeMatches =
    line.match(
      /(?:dau|duoi|dd|xc|da|b(?!.{0,2}keo)|dao|xcd|\bn(?:to|hatto)\b)/gi
    ) || []

  // Xác định phần số tiền ở cuối
  let amountPart = ''
  const amountMatch = line.match(/(\d+(?:[.,]\d+)?)(n?)$/i)
  if (amountMatch) {
    amountPart = amountMatch[0]
    line = line.substring(0, line.lastIndexOf(amountMatch[0]))
  }

  // Xử lý các kiểu đánh kết hợp (dau10.duoi5)
  const combinedBetTypes = []

  const dauPattern = /dau(\d+(?:[.,]\d+)?)/gi
  const duoiPattern = /duoi(\d+(?:[.,]\d+)?)/gi

  let dauMatch
  while ((dauMatch = dauPattern.exec(line)) !== null) {
    combinedBetTypes.push({
      type: 'dau',
      amount: dauMatch[1],
    })
  }

  let duoiMatch
  while ((duoiMatch = duoiPattern.exec(line)) !== null) {
    combinedBetTypes.push({
      type: 'duoi',
      amount: duoiMatch[1],
    })
  }

  // Xử lý các kiểu đánh đặc biệt khác nếu có

  // Trích xuất các số và phần kéo
  const numberParts = []
  const numberPatterns = [
    /\d+[/.]\d+keo\d+/g, // Dạng kéo: 10/20keo90
    /\d+[-.,]\d+/g, // Dạng cặp số: 12-34, 12.34, 12,34
    /\d+/g, // Số đơn: 12, 34, 56
  ]

  for (const pattern of numberPatterns) {
    const matches = line.match(pattern) || []
    numberParts.push(...matches)
  }

  return {
    numberParts: [...new Set(numberParts)], // Loại bỏ trùng lặp
    betTypeParts: [...new Set(betTypeMatches)], // Loại bỏ trùng lặp
    amountPart,
    combined: combinedBetTypes.length > 0 ? combinedBetTypes : null,
  }
}

/**
 * Xác định kiểu cược từ các phần đã phân tích
 * @param {string[]} betTypeParts - Các phần liên quan đến kiểu cược
 * @returns {object|null} Thông tin kiểu cược
 */
function determineBetType(betTypeParts) {
  if (!betTypeParts || betTypeParts.length === 0) return null

  // Ưu tiên kiểu cược đầu tiên tìm thấy
  for (const part of betTypeParts) {
    // Kiểm tra từng kiểu cược có sẵn
    for (const betType of defaultBetTypes) {
      // So sánh trực tiếp với tên
      if (part.toLowerCase() === betType.name.toLowerCase()) {
        return {
          id: betType.id,
          name: betType.name,
          alias: part,
          payoutRate: betType.payoutRate,
        }
      }

      // So sánh với các alias
      for (const alias of betType.aliases) {
        if (part.toLowerCase() === alias.toLowerCase()) {
          return {
            id: betType.id,
            name: betType.name,
            alias: alias,
            payoutRate: betType.payoutRate,
          }
        }
      }
    }
  }

  // Kiểm tra các trường hợp đặc biệt
  // Các kiểu đầu/đuôi kết hợp với số tiền
  if (
    betTypeParts.some((part) => part.toLowerCase().includes('dau')) &&
    betTypeParts.some((part) => part.toLowerCase().includes('duoi'))
  ) {
    const ddBetType = defaultBetTypes.find((bt) => bt.aliases.includes('dd'))
    if (ddBetType) {
      return {
        id: ddBetType.id,
        name: ddBetType.name,
        alias: 'dd',
        payoutRate: ddBetType.payoutRate,
        combined: true,
      }
    }
  }

  // Nếu chỉ có đầu hoặc chỉ có đuôi
  if (betTypeParts.some((part) => part.toLowerCase().includes('dau'))) {
    const dauBetType = defaultBetTypes.find((bt) => bt.aliases.includes('dau'))
    if (dauBetType) {
      return {
        id: dauBetType.id,
        name: dauBetType.name,
        alias: 'dau',
        payoutRate: dauBetType.payoutRate,
      }
    }
  }

  if (
    betTypeParts.some(
      (part) =>
        part.toLowerCase().includes('duoi') ||
        part.toLowerCase().includes('dui')
    )
  ) {
    const duoiBetType = defaultBetTypes.find((bt) =>
      bt.aliases.includes('duoi')
    )
    if (duoiBetType) {
      return {
        id: duoiBetType.id,
        name: duoiBetType.name,
        alias: 'duoi',
        payoutRate: duoiBetType.payoutRate,
      }
    }
  }

  return null
}

/**
 * Xử lý các số cược từ các phần đã phân tích
 * @param {string[]} numberParts - Các phần liên quan đến số cược
 * @param {object} betType - Thông tin kiểu cược đã xác định
 * @returns {string[]} Danh sách các số cược
 */
function processNumbers(numberParts, betType) {
  if (!numberParts || numberParts.length === 0) return []

  const numbers = []

  for (const part of numberParts) {
    // Xử lý dạng kéo: 10/20keo90
    if (part.includes('keo')) {
      const keoNumbers = parseSequence(part)
      numbers.push(...keoNumbers)
      continue
    }

    // Xử lý dạng cặp số: 12-34, 12.34, 12,34
    if (part.match(/\d+[-.,]\d+/)) {
      const [num1, num2] = part.split(/[-.,]/)
      numbers.push(num1, num2)
      continue
    }

    // Xử lý số đơn
    if (/^\d+$/.test(part)) {
      numbers.push(part)
    }
  }

  // Loại bỏ trùng lặp và chuẩn hóa định dạng
  return [...new Set(numbers)].map((num) => num.trim())
}

/**
 * Phân tích số tiền từ chuỗi
 * @param {string} amountPart - Chuỗi chứa thông tin số tiền
 * @returns {number} Số tiền đã phân tích
 */
function parseAmount(amountPart) {
  if (!amountPart) return 0

  // Kiểm tra định dạng "n" ở cuối (nghìn)
  const hasN = amountPart.toLowerCase().endsWith('n')

  // Loại bỏ "n" nếu có
  let cleanedAmount = hasN ? amountPart.slice(0, -1) : amountPart

  // Loại bỏ các ký tự không phải số và dấu phân cách thập phân
  cleanedAmount = cleanedAmount.replace(/[^0-9,.]/g, '')

  // Xử lý dấu phân cách thập phân
  let amount = parseFloat(cleanedAmount.replace(/,/g, '.'))

  // Nhân 1000 nếu có "n"
  if (hasN) amount *= 1000

  return isNaN(amount) ? 0 : amount
}

/**
 * Phân tích dãy số kiểu kéo (sequence)
 * @param {string} sequencePart - Chuỗi chứa thông tin dãy số kéo
 * @returns {array} Mảng các số trong dãy
 */
function parseSequence(sequencePart) {
  // Mẫu regex cho dạng A/BkeoC
  const sequencePattern = /(\d+)[/.,](\d+)keo(\d+)/i
  const matches = sequencePart.match(sequencePattern)

  if (!matches) return []

  const [, start, next, end] = matches
  const startNumber = parseInt(start)
  const nextNumber = parseInt(next)
  const endNumber = parseInt(end)

  // Tính bước nhảy
  const step = nextNumber - startNumber

  // Xác định số chữ số cần đệm
  const padding = Math.max(start.length, end.length)

  // Tạo dãy số
  const result = []
  for (let i = startNumber; i <= endNumber; i += step) {
    result.push(String(i).padStart(padding, '0'))
  }

  return result
}

/**
 * Phân tích các tổ hợp số đặc biệt
 * @param {string} input - Chuỗi đầu vào
 * @returns {array} Mảng các số thuộc tổ hợp đặc biệt
 */
function parseSpecialCombinations(input) {
  let numbers = []

  // Tìm các tổ hợp đặc biệt
  for (const combination of defaultNumberCombinations) {
    // Kiểm tra tên đầy đủ
    if (input.toLowerCase().includes(combination.name.toLowerCase())) {
      // Xử lý dựa trên loại tổ hợp
      switch (combination.name) {
        case 'Tài':
          numbers = Array.from({ length: 50 }, (_, i) =>
            String(i + 50).padStart(2, '0')
          )
          break
        case 'Xỉu':
          numbers = Array.from({ length: 50 }, (_, i) =>
            String(i).padStart(2, '0')
          )
          break
        case 'Chẵn':
          numbers = Array.from({ length: 50 }, (_, i) =>
            String(i * 2).padStart(2, '0')
          )
          break
        case 'Lẻ':
          numbers = Array.from({ length: 50 }, (_, i) =>
            String(i * 2 + 1).padStart(2, '0')
          )
          break
        case 'Chẵn Chẵn':
          numbers = []
          for (let i = 0; i <= 9; i += 2) {
            for (let j = 0; j <= 9; j += 2) {
              numbers.push(`${i}${j}`)
            }
          }
          break
        case 'Lẻ Lẻ':
          numbers = []
          for (let i = 1; i <= 9; i += 2) {
            for (let j = 1; j <= 9; j += 2) {
              numbers.push(`${i}${j}`)
            }
          }
          break
        case 'Chẵn Lẻ':
          numbers = []
          for (let i = 0; i <= 9; i += 2) {
            for (let j = 1; j <= 9; j += 2) {
              numbers.push(`${i}${j}`)
            }
          }
          break
        case 'Lẻ Chẵn':
          numbers = []
          for (let i = 1; i <= 9; i += 2) {
            for (let j = 0; j <= 9; j += 2) {
              numbers.push(`${i}${j}`)
            }
          }
          break
        // Thêm xử lý cho các loại khác nếu cần
      }
      break
    }

    // Kiểm tra các alias
    for (const alias of combination.aliases) {
      if (input.toLowerCase().includes(alias.toLowerCase())) {
        // Xử lý dựa trên alias
        switch (alias.toLowerCase()) {
          case 'tai':
            numbers = Array.from({ length: 50 }, (_, i) =>
              String(i + 50).padStart(2, '0')
            )
            break
          case 'xiu':
            numbers = Array.from({ length: 50 }, (_, i) =>
              String(i).padStart(2, '0')
            )
            break
          case 'chan':
            numbers = Array.from({ length: 50 }, (_, i) =>
              String(i * 2).padStart(2, '0')
            )
            break
          case 'le':
            numbers = Array.from({ length: 50 }, (_, i) =>
              String(i * 2 + 1).padStart(2, '0')
            )
            break
          case 'chanchan':
            numbers = []
            for (let i = 0; i <= 9; i += 2) {
              for (let j = 0; j <= 9; j += 2) {
                numbers.push(`${i}${j}`)
              }
            }
            break
          case 'lele':
            numbers = []
            for (let i = 1; i <= 9; i += 2) {
              for (let j = 1; j <= 9; j += 2) {
                numbers.push(`${i}${j}`)
              }
            }
            break
          case 'chanle':
            numbers = []
            for (let i = 0; i <= 9; i += 2) {
              for (let j = 1; j <= 9; j += 2) {
                numbers.push(`${i}${j}`)
              }
            }
            break
          case 'lechan':
            numbers = []
            for (let i = 1; i <= 9; i += 2) {
              for (let j = 0; j <= 9; j += 2) {
                numbers.push(`${i}${j}`)
              }
            }
            break
          // Thêm xử lý cho các alias khác nếu cần
        }
        if (numbers.length > 0) break
      }
    }

    if (numbers.length > 0) break
  }

  return numbers
}

export default {
  parseBetCode,
  normalizeBetCode,
  splitToLines,
  parseBetCodeLine,
  parseSequence,
  parseSpecialCombinations,
}
