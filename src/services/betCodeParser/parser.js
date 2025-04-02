// src/services/betCodeParser/parser.js
import { defaultStations, defaultBetTypes } from '@/config/defaults'

/**
 * Phân tích mã cược đầu vào
 * @param {string} betCode - Mã cược đầu vào
 * @returns {object} Kết quả phân tích
 */
export function parseBetCode(betCode) {
  try {
    if (!betCode || typeof betCode !== 'string') {
      return { success: false, errors: [{ message: 'Mã cược không hợp lệ' }] }
    }

    // First, let's check for special cases with kéo pattern directly
    const initialLines = betCode
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
    if (initialLines.length >= 2) {
      const stationLine = initialLines[0]

      // Direct check for kéo pattern in any subsequent line
      for (let i = 1; i < initialLines.length; i++) {
        const currentLine = initialLines[i]
        // Precise regex to match kéo pattern including bet type and amount
        const keoMatch = currentLine.match(
          /(\d+)\/(\d+)(?:keo|k)(\d+)([a-z]+)(\d+(?:[,.]\d+)?)/i
        )

        if (keoMatch) {
          // We found a kéo pattern, process it specially
          const [fullMatch, start, next, end, betTypeText, amountText] =
            keoMatch

          // Parse the station
          const stationInfo = parseStation(stationLine)
          if (!stationInfo.success) {
            return {
              success: false,
              errors: [
                { message: `Cannot determine station: ${stationInfo.error}` },
              ],
            }
          }

          // Generate sequence
          const startNum = parseInt(start, 10)
          const nextNum = parseInt(next, 10)
          const endNum = parseInt(end, 10)
          const step = nextNum - startNum

          if (step <= 0) {
            // Invalid step, continue with regular parsing
            continue
          }

          // Generate sequence
          const sequence = []
          const padLength = Math.max(start.length, end.length)
          for (let i = startNum; i <= endNum; i += step) {
            sequence.push(i.toString().padStart(padLength, '0'))
          }

          // Identify bet type
          const betType = defaultBetTypes.find((bt) =>
            bt.aliases.some(
              (a) => a.toLowerCase() === betTypeText.toLowerCase()
            )
          )

          if (!betType) {
            // Invalid bet type, continue with regular parsing
            continue
          }

          // Parse amount
          const amount = parseAmount(amountText)

          // We have a valid kéo pattern, generate a special result
          const betLine = {
            valid: true,
            numbers: sequence,
            betType: {
              id: betType.name,
              name: betType.name,
              alias: betTypeText.toLowerCase(),
            },
            amount: amount,
            originalLine: currentLine,
          }

          return {
            success: true,
            station: stationInfo.data,
            lines: [betLine],
            wasReformatted: true,
            specialHandling: 'keo_pattern',
          }
        }
      }
    }

    // Trước khi bất kỳ xử lý nào, kiểm tra xem đây có phải chỉ là tên đài không
    // Nếu là chỉ mỗi tên đài (như "hn"), xử lý đặc biệt
    if (!betCode.includes('\n') && !betCode.includes(' ')) {
      const potentialStation = betCode.trim().toLowerCase()

      // Kiểm tra xem có phải là tên đài hợp lệ không
      let isValidStation = false
      let stationData = null

      // Kiểm tra trong tất cả các đài và aliases
      for (const station of defaultStations) {
        if (
          station.name.toLowerCase() === potentialStation ||
          (station.aliases &&
            station.aliases.some(
              (alias) => alias.toLowerCase() === potentialStation
            ))
        ) {
          isValidStation = true
          stationData = {
            name: station.name,
            region: station.region,
            multiStation: false,
          }
          if (station.region === 'north' && station.name === 'Miền Bắc') {
            stationData.multiStation = true
          }
          break
        }
      }

      // Nếu là tên đài hợp lệ, trả về kết quả phù hợp
      if (isValidStation && stationData) {
        return {
          success: false, // Không thành công vì không có mã cược
          station: stationData,
          lines: [],
          message: 'Đã xác định đài, nhưng chưa có mã cược',
          errors: [
            {
              message: 'Vui lòng thêm mã cược sau tên đài',
              type: 'MISSING_BET_INFO',
            },
          ],
        }
      }
    }

    // Chuẩn hóa dấu xuống dòng và khoảng trắng
    betCode = betCode.trim()

    // console.log('Bet code before normalization:', betCode)

    // Tiền xử lý: Tự động định dạng khi người dùng nhập đài và mã cược trên cùng một dòng
    if (!betCode.includes('\n')) {
      // Sử dụng split với regex mạnh hơn để xử lý tất cả loại khoảng trắng
      const parts = betCode.split(/\s+/)

      if (parts.length >= 2) {
        const potentialStation = parts[0].toLowerCase()

        // Xây dựng phần còn lại bằng cách loại bỏ phần đầu và khoảng trắng
        // Đảm bảo lấy chính xác phần còn lại, không phụ thuộc vào split
        const restOfText = betCode.substring(potentialStation.length).trim()

        // Kiểm tra xem phần đầu có phải là tên đài không
        let isValidStation = false

        // Kiểm tra trong tất cả các đài và aliases
        for (const station of defaultStations) {
          if (
            station.name.toLowerCase() === potentialStation ||
            (station.aliases &&
              station.aliases.some(
                (alias) => alias.toLowerCase() === potentialStation
              ))
          ) {
            isValidStation = true
            break
          }
        }

        // Kiểm tra mẫu đài nhiều miền (như 2dmn, 3dmt)
        if (/^\d+d(mn|mt|n|t)/i.test(potentialStation)) {
          isValidStation = true
        }

        // Nếu là đài hợp lệ và còn phần còn lại
        if (isValidStation && restOfText.length > 0) {
          // Kiểm tra nếu phần còn lại có số và kiểu cược
          const hasNumbers = /\d/.test(restOfText)

          // Danh sách kiểu cược phổ biến để kiểm tra
          const commonBetTypes = ['b', 'da', 'dd', 'xc', 'dau', 'duoi']

          for (const betType of commonBetTypes) {
            const pattern = new RegExp(`${betType}\\d*`, 'i')
            if (pattern.test(restOfText)) {
              break
            }
          }

          if (hasNumbers) {
            // Tự động thêm xuống dòng giữa đài và mã cược
            betCode = `${potentialStation}\n${restOfText}`
          }
        }
      }
    }

    // QUAN TRỌNG: Xử lý nhiều đài trong một đoạn mã cược
    const multipleStations = detectMultipleStations(betCode)

    if (multipleStations && multipleStations.length > 0) {
      return parseMultipleStationBetCode(multipleStations)
    }

    // Tiếp tục xử lý như bình thường
    const normalizedBetCode = betCode.trim().toLowerCase()

    // Phân tách các dòng
    const lines = normalizedBetCode
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
    if (lines.length === 0) {
      return { success: false, errors: [{ message: 'Mã cược trống' }] }
    }

    const station = parseStation(lines[0])
    if (!station.success) {
      return {
        success: false,
        errors: [{ message: `Không thể xác định đài: ${station.error}` }],
      }
    }

    // Phân tích từng dòng còn lại
    const parsedLines = []
    let hasValidLine = false

    // Kiểm tra xem dòng đầu tiên có chứa cả đài và số cược không
    const stationPart = extractStationPart(lines[0])
    const hasBetInfo =
      stationPart.length < lines[0].length && !isStationOnly(lines[0])

    // Xử lý phần số cược từ dòng đầu nếu có
    if (hasBetInfo) {
      const betPart = lines[0].substring(stationPart.length).trim()
      if (betPart) {
        const parsedLine = parseBetLine(betPart, station.data)
        parsedLine.originalLine = lines[0]
        parsedLine.lineIndex = 0

        parsedLines.push(parsedLine)
        if (parsedLine.valid) {
          hasValidLine = true
        }
      }
    }

    // Xử lý các dòng còn lại (bắt đầu từ dòng 1)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '') continue

      // Bỏ qua các dòng chỉ chứa tên đài
      if (isStationLine(line)) {
        continue
      }

      // Phân tích dòng
      const parsedLine = parseBetLine(line, station.data)
      parsedLine.originalLine = line
      parsedLine.lineIndex = i

      parsedLines.push(parsedLine)
      if (parsedLine.valid) {
        hasValidLine = true
      }
    }

    // Nếu chỉ có 1 dòng và không có số cược, có thể người dùng chỉ đang thử chọn đài
    if (lines.length === 1 && parsedLines.length === 0) {
      return {
        success: false,
        station: station.data,
        lines: [],
        message: 'Đã xác định đài, chưa có số cược',
        errors: [{ message: 'Vui lòng thêm thông tin cược sau tên đài' }],
      }
    }

    if (parsedLines.length === 0) {
      return {
        success: false,
        errors: [{ message: 'Không tìm thấy số cược' }],
      }
    }

    return {
      success: hasValidLine,
      station: station.data,
      lines: parsedLines,
      hasValidLine,
      wasReformatted: betCode !== normalizedBetCode,
    }
  } catch (error) {
    console.error('Lỗi khi phân tích mã cược:', error)
    return {
      success: false,
      errors: [{ message: `Lỗi phân tích mã cược: ${error.message}` }],
    }
  }
}

/**
 * Phát hiện nhiều đài trong mã cược
 * @param {string} betCode - Mã cược đầu vào
 * @returns {Array|null} Danh sách các cặp đài-dòng cược
 */
function detectMultipleStations(betCode) {
  const lines = betCode
    .trim()
    .split('\n')
    .filter((line) => line.trim() !== '')
  if (lines.length < 2) return null

  // Kiểm tra xem có ít nhất 2 dòng đài
  const stationLines = lines.filter((line) => isStationLine(line))
  if (stationLines.length < 2) return null

  const result = []
  let currentStation = null
  let currentBetLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (isStationLine(line)) {
      // Nếu đã có station và betLines, lưu lại vào result
      if (currentStation && currentBetLines.length > 0) {
        result.push({
          station: currentStation,
          betLines: [...currentBetLines],
        })
      }

      // Bắt đầu station mới
      currentStation = line
      currentBetLines = []
    } else {
      // Thêm dòng cược vào station hiện tại
      if (currentStation) {
        currentBetLines.push(line)
      }
    }
  }

  // Thêm cặp cuối cùng nếu có
  if (currentStation && currentBetLines.length > 0) {
    result.push({
      station: currentStation,
      betLines: [...currentBetLines],
    })
  }

  return result.length > 0 ? result : null
}

/**
 * Phân tích mã cược có nhiều đài
 * @param {Array} multipleStations - Danh sách các cặp đài-dòng cược
 * @returns {object} Kết quả phân tích
 */
function parseMultipleStationBetCode(multipleStations) {
  // Để dễ hiểu, chỉ xử lý station đầu tiên
  // Thông tin về nhiều station sẽ được xử lý ở lớp cao hơn (ChatContext)

  if (!multipleStations || multipleStations.length === 0) {
    return {
      success: false,
      errors: [{ message: 'Không có dữ liệu đài hợp lệ' }],
    }
  }

  // Phân tích station đầu tiên
  const firstStation = multipleStations[0]
  if (
    !firstStation.station ||
    !firstStation.betLines ||
    firstStation.betLines.length === 0
  ) {
    return {
      success: false,
      errors: [{ message: 'Dữ liệu đài không hợp lệ' }],
    }
  }

  // Tạo mã cược cho station đầu tiên để phân tích
  const singleStationBetCode = `${
    firstStation.station
  }\n${firstStation.betLines.join('\n')}`
  const result = parseBetCode(singleStationBetCode)

  if (result.success) {
    // Đánh dấu là có nhiều đài
    result.hasMultipleStations = true
    result.stationCount = multipleStations.length
  }

  return result
}

/**
 * Kiểm tra xem dòng có phải là dòng chỉ chứa tên đài không
 */
function isStationLine(line) {
  // Cải tiến: Kiểm tra kỹ lưỡng hơn để xác định dòng đài

  // 1. Loại bỏ dấu chấm cuối
  const cleanLine = line.replace(/\.+$/, '').trim().toLowerCase()

  // 2. Kiểm tra các mẫu đài nhiều miền (vd: 2dmn, 3dmt)
  if (/^\d+d(mn|mt|n|t|nam|trung)$/i.test(cleanLine)) {
    return true
  }

  // 3. Kiểm tra tên đài đơn lẻ
  for (const station of defaultStations) {
    if (
      station.name.toLowerCase() === cleanLine ||
      station.aliases.some((alias) => alias === cleanLine)
    ) {
      return true
    }
  }

  // 4. Kiểm tra mẫu "mb", "mt", "mn" và biến thể của chúng
  if (/^(mb|mt|mn|mienbac|mientrung|miennam|hanoi|hn)$/i.test(cleanLine)) {
    return true
  }

  // 5. Kiểm tra nếu là tổ hợp các đài (vd: vl.ct, dn.hue)
  if (cleanLine.includes('.')) {
    const parts = cleanLine.split('.')
    return parts.every((part) =>
      defaultStations.some(
        (station) =>
          station.name.toLowerCase() === part ||
          station.aliases.some((alias) => alias === part)
      )
    )
  }

  return false
}

/**
 * Kiểm tra xem dòng có phải chỉ chứa thông tin đài không (không có thông tin cược)
 */
function isStationOnly(line) {
  // Kiểm tra các mẫu đài miền nhiều đài (vd: 2dmn, 3mt)
  const multiStationPattern = /^\d+d(mn|mt|n|t|nam|trung)$/i
  if (multiStationPattern.test(line)) {
    return true
  }

  // Kiểm tra tên đài đơn lẻ
  if (isStationLine(line)) {
    return true
  }

  // Kiểm tra mẫu "mb", "mt", "mn" và biến thể của chúng
  const regionPattern = /^(mb|mt|mn|mienbac|mientrung|miennam|hanoi|hn)$/i
  if (regionPattern.test(line)) {
    return true
  }

  return false
}

/**
 * Kiểm tra xem một alias có phải là một phần của tên đài
 */
function isPartOfStationName(alias, line) {
  // Kiểm tra nếu line chính là một tên đài/alias của đài
  const isLineExactlyStation = defaultStations.some(
    (station) =>
      station.name.toLowerCase() === line.trim().toLowerCase() ||
      station.aliases.some((a) => a === line.trim().toLowerCase())
  )

  // Nếu line chính xác là tên đài, trả về true cho bất kỳ alias nào
  if (isLineExactlyStation) {
    return true
  }

  // Ngược lại kiểm tra nếu alias là một phần của tên đài
  for (const station of defaultStations) {
    if (
      station.aliases.some(
        (stationAlias) =>
          stationAlias.includes(alias) && line.includes(stationAlias)
      )
    ) {
      return true
    }
  }
  return false
}

/**
 * Kiểm tra xem một chuỗi có phải là từ khóa đặc biệt không
 * @param {string} str - Chuỗi cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
function isSpecialKeyword(str) {
  if (!str) return false
  const specialKeywords = [
    'tai',
    'xiu',
    'chan',
    'le',
    'chanchan',
    'lele',
    'chanle',
    'lechan',
  ]
  return specialKeywords.includes(str.toLowerCase())
}

/**
 * Kiểm tra xem ký tự tiếp theo có phải là một phần của từ khóa đặc biệt không
 * @param {string} currentStr - Chuỗi hiện tại
 * @param {string} nextChar - Ký tự tiếp theo
 * @returns {boolean} Kết quả kiểm tra
 */
function isPartOfSpecialKeyword(currentStr, nextChar) {
  const specialKeywords = [
    'tai',
    'xiu',
    'chan',
    'le',
    'chanchan',
    'lele',
    'chanle',
    'lechan',
    'keo',
  ]

  const testStr = (currentStr + nextChar).toLowerCase()

  // Check for "keo" pattern specifically
  if (currentStr.includes('/')) {
    // If currentStr already contains a "/", check if nextChar could be part of "keo"
    const lastPart = currentStr.split('/').pop().toLowerCase()
    if (lastPart === 'k' && nextChar.toLowerCase() === 'e') return true
    if (lastPart === 'ke' && nextChar.toLowerCase() === 'o') return true
    if (nextChar.toLowerCase() === 'k') return true
  }

  // Kiểm tra nếu chuỗi kết hợp khớp với bất kỳ từ khóa đặc biệt nào
  for (const keyword of specialKeywords) {
    if (keyword.startsWith(testStr)) {
      return true
    }
  }

  return false
}

/**
 * Trích xuất phần đài từ một dòng
 */
function extractStationPart(line) {
  // Tìm vị trí của số đầu tiên hoặc kiểu cược
  let index = line.length

  // Xử lý đặc biệt cho trường hợp như "2dmn"
  const multiStationMatch = line.match(
    /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung)/i
  )
  if (multiStationMatch) {
    return line
  }

  // Tìm vị trí số đầu tiên
  const numberMatch = line.match(/(?<!\d[a-z])\d/)
  if (numberMatch) {
    index = Math.min(index, numberMatch.index)
  }

  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  for (const alias of betTypeAliases) {
    const aliasPos = line.indexOf(alias)
    if (aliasPos !== -1 && !isPartOfStationName(alias, line)) {
      index = Math.min(index, aliasPos)
    }
  }

  return line.substring(0, index).trim()
}

/**
 * Phân tích thông tin đài từ chuỗi
 * @param {string} stationString - Chuỗi chứa thông tin đài
 * @returns {object} Kết quả phân tích đài
 */
function parseStation(stationString) {
  // Loại bỏ dấu chấm cuối cùng nếu có
  const stationText = stationString.trim().toLowerCase().replace(/\.+$/, '')

  // Trường hợp đặc biệt: chuỗi chứa cả số, có thể là đài + số cược
  if (/\d/.test(stationText)) {
    // Kiểm tra đặc biệt cho đài nhiều miền trước
    const multipleStationMatch = stationText.match(
      /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung|mien nam|mien trung|miền nam|miền trung)/i
    )

    if (multipleStationMatch) {
      const count = parseInt(multipleStationMatch[1], 10)
      // Xác định miền dựa trên chuỗi phù hợp
      const regionPart = multipleStationMatch[2].toLowerCase()
      const isSouthern =
        regionPart === 'dmn' ||
        regionPart === 'dn' ||
        regionPart === 'dnam' ||
        regionPart === 'mn' ||
        regionPart === 'mnam' ||
        regionPart === 'mien nam' ||
        regionPart === 'miền nam'

      const region = isSouthern ? 'south' : 'central'

      return {
        success: true,
        data: {
          name: region === 'south' ? 'Miền Nam' : 'Miền Trung',
          region,
          count,
          multiStation: true,
        },
      }
    }

    // Trích xuất phần đài cho các trường hợp khác
    const stationPart = extractStationPart(stationText)
    return parseStation(stationPart)
  }

  // Kiểm tra đài miền Bắc
  const northStation = defaultStations.find(
    (s) =>
      s.region === 'north' &&
      (s.name.toLowerCase() === stationText ||
        s.aliases.some((a) => stationText === a))
  )

  if (northStation) {
    return {
      success: true,
      data: {
        name: northStation.name,
        region: 'north',
        multiStation: false,
      },
    }
  }

  // Kiểm tra đài miền Nam/Trung nhiều đài
  const multipleStationMatch = stationText.match(
    /^(\d+)(dmn|dmt|dn|dt|dnam|dtrung|mn|mt|mnam|mtrung)/i
  )

  if (multipleStationMatch) {
    const count = parseInt(multipleStationMatch[1], 10)
    // Xác định miền dựa trên chuỗi phù hợp
    const regionPart = multipleStationMatch[2].toLowerCase()
    const isSouthern =
      regionPart === 'dmn' ||
      regionPart === 'dn' ||
      regionPart === 'dnam' ||
      regionPart === 'mn' ||
      regionPart === 'mnam'

    const region = isSouthern ? 'south' : 'central'

    return {
      success: true,
      data: {
        name: region === 'south' ? 'Miền Nam' : 'Miền Trung',
        region,
        count,
        multiStation: true,
      },
    }
  }

  // Kiểm tra đài miền Nam/Trung
  const southCentralAliases = {
    mn: 'south',
    dmn: 'south',
    dn: 'south',
    dnam: 'south',
    miennam: 'south',
    'mien nam': 'south',
    'miền nam': 'south',
    'đài nam': 'south',
    'đài miền nam': 'south',
    mnam: 'south',
    mt: 'central',
    dmt: 'central',
    dt: 'central',
    dtrung: 'central',
    mientrung: 'central',
    'mien trung': 'central',
    'miền trung': 'central',
    'đài trung': 'central',
    'đài miền trung': 'central',
    mtrung: 'central',
  }

  if (southCentralAliases[stationText]) {
    return {
      success: true,
      data: {
        name:
          southCentralAliases[stationText] === 'south'
            ? 'Miền Nam'
            : 'Miền Trung',
        region: southCentralAliases[stationText],
        multiStation: true,
        count: 1, // Mặc định là 1 nếu không chỉ định
      },
    }
  }

  // Kiểm tra nhiều đài cụ thể
  if (
    stationText.includes('.') ||
    stationText.includes(',') ||
    stationText.includes(' ')
  ) {
    const stationParts = stationText.split(/[., ]+/).filter(Boolean)

    if (stationParts.length > 1) {
      const stationObjects = []
      let regionType = null

      for (const part of stationParts) {
        const station = findStationByAlias(part)
        if (station) {
          // Kiểm tra xem các đài có cùng miền không
          if (regionType === null) {
            regionType = station.region
          }

          stationObjects.push({
            name: station.name,
            region: station.region,
          })
        }
      }

      if (stationObjects.length > 0) {
        return {
          success: true,
          data: {
            stations: stationObjects,
            region: regionType || 'south', // Mặc định là miền Nam nếu không xác định được
            multiStation: false,
          },
        }
      }
    }
  }

  // Kiểm tra trường hợp đặc biệt: hai đài ghép liền (không có dấu phân cách)
  const mergedStations = findMergedStations(stationText)
  if (mergedStations.length === 2) {
    return {
      success: true,
      data: {
        stations: mergedStations,
        region: mergedStations[0].region,
        multiStation: false,
      },
    }
  }

  // Kiểm tra đài đơn lẻ
  const station = findStationByAlias(stationText)
  if (station) {
    return {
      success: true,
      data: {
        name: station.name,
        region: station.region,
        multiStation: false,
      },
    }
  }

  // Kiểm tra đài với tên đầy đủ
  for (const station of defaultStations) {
    const fullName = station.name.toLowerCase()
    const fullAliases = station.aliases.map((a) => a.toLowerCase())

    if (
      stationText === fullName ||
      fullAliases.includes(stationText) ||
      stationText.includes(fullName) ||
      fullAliases.some((a) => stationText.includes(a))
    ) {
      return {
        success: true,
        data: {
          name: station.name,
          region: station.region,
          multiStation: false,
        },
      }
    }
  }

  // Không tìm thấy đài phù hợp
  return {
    success: false,
    error: `Không tìm thấy đài phù hợp với "${stationText}"`,
  }
}

/**
 * Tìm các đài ghép liền nhau không có dấu phân cách
 * @param {string} text - Chuỗi đài
 * @returns {Array} Danh sách đài tìm thấy
 */
function findMergedStations(text) {
  const foundStations = []

  // Trường hợp đặc biệt: dnaictho, tp.dongthap
  for (const station1 of defaultStations) {
    // Thử tất cả các alias của đài 1
    for (const alias1 of [station1.name.toLowerCase(), ...station1.aliases]) {
      if (text.startsWith(alias1)) {
        const remainingText = text.substring(alias1.length)

        // Tìm đài thứ 2 trong phần còn lại
        for (const station2 of defaultStations) {
          // Không xét ghép giữa đài với chính nó
          if (station1.name === station2.name) continue

          for (const alias2 of [
            station2.name.toLowerCase(),
            ...station2.aliases,
          ]) {
            if (remainingText === alias2 || remainingText.startsWith(alias2)) {
              foundStations.push({
                name: station1.name,
                region: station1.region,
              })

              foundStations.push({
                name: station2.name,
                region: station2.region,
              })

              return foundStations
            }
          }
        }
      }
    }
  }

  // Thử tất cả các cách chia chuỗi thành 2 phần
  for (let i = 2; i < text.length - 1; i++) {
    const part1 = text.substring(0, i)
    const part2 = text.substring(i)

    const station1 = findStationByAlias(part1)
    const station2 = findStationByAlias(part2)

    if (station1 && station2) {
      foundStations.push({
        name: station1.name,
        region: station1.region,
      })

      foundStations.push({
        name: station2.name,
        region: station2.region,
      })

      break
    }
  }

  return foundStations
}

/**
 * Tìm đài dựa trên alias
 */
function findStationByAlias(alias) {
  if (!alias) return null

  // Chuyển alias về lowercase để so sánh không phân biệt chữ hoa/thường
  const normalizedAlias = alias.toLowerCase()

  // Tìm kiếm đài dựa trên alias chính xác
  const exactMatch = defaultStations.find(
    (s) =>
      s.name.toLowerCase() === normalizedAlias ||
      s.aliases.some((a) => a.toLowerCase() === normalizedAlias)
  )

  if (exactMatch) return exactMatch

  // Nếu không tìm thấy đài chính xác, tìm kiếm đài có alias phù hợp nhất
  let bestMatch = null
  let bestScore = 0

  for (const station of defaultStations) {
    for (const a of station.aliases) {
      const aliasLower = a.toLowerCase()
      // Tính điểm phù hợp
      let score = 0
      if (normalizedAlias.includes(aliasLower)) {
        score = aliasLower.length
      } else if (aliasLower.includes(normalizedAlias)) {
        score = normalizedAlias.length
      }

      // Cập nhật bestMatch nếu tìm thấy alias phù hợp hơn
      if (score > bestScore) {
        bestScore = score
        bestMatch = station
      }
    }
  }

  return bestMatch
}

/**
 * Phân tích dòng cược
 * @param {string} line - Dòng cược
 * @param {object} station - Thông tin đài
 * @returns {object} Kết quả phân tích dòng cược
 */
function parseBetLine(line, station) {
  const result = {
    valid: false,
    numbers: [],
    amount: 0,
    betType: null,
    originalLine: line,
    additionalBetTypes: [],
    isPermutation: false, // Thêm flag isPermutation mặc định là false
  }

  try {
    // First, check for direct "da" with 3-digit numbers pattern
    const daWithDigitsPattern = /^([\d.]+)da(\d+)$/i
    const daMatch = line.match(daWithDigitsPattern)

    if (daMatch) {
      const numberPart = daMatch[1]

      // Check if we have any 3-digit numbers
      const numbers = numberPart.split('.')
      const hasThreeDigitNumbers = numbers.some((num) => num.length === 3)

      if (hasThreeDigitNumbers) {
        // Early validation for "da" bet type which only accepts 2-digit numbers
        const betTypeInfo = identifyBetType('da')
        if (betTypeInfo) {
          const validation = validateBetTypeDigitCount(betTypeInfo.id, 3)
          if (!validation.valid) {
            result.numbers = numbers
            result.betType = betTypeInfo
            result.valid = false
            result.error = validation.message
            return result
          }
        }
      }
    }

    const normalizedLine = line

    // // Check for multiple bet types pattern (eg: 66.88da1.b5)
    // // This improved pattern captures bet codes with multiple bet types on the same numbers
    // const multipleBetTypesPattern = /^([\d.]+)((?:[a-z]+\d+(?:[,.]\d+)?\.?)+)$/i
    // const multipleBetMatch = normalizedLine.match(multipleBetTypesPattern)

    // console.log('multipleBetMatch', multipleBetMatch)

    // if (multipleBetMatch) {
    //   const [fullMatch, numbersPart, betTypesPart] = multipleBetMatch

    //   // Process the numbers
    //   const numbers = numbersPart.split('.').filter((n) => n.trim() !== '')

    //   // Process all bet types
    //   const betTypesSegments = []
    //   let currentSegment = ''
    //   let inBetType = false

    //   for (let i = 0; i < betTypesPart.length; i++) {
    //     const char = betTypesPart[i]

    //     // If we find a letter after a number or at the beginning, it's a new bet type
    //     if (
    //       /[a-z]/i.test(char) &&
    //       (!inBetType ||
    //         /\d/.test(currentSegment.charAt(currentSegment.length - 1)))
    //     ) {
    //       if (inBetType && currentSegment) {
    //         betTypesSegments.push(currentSegment)
    //         currentSegment = ''
    //       }
    //       inBetType = true
    //       currentSegment += char
    //     } else {
    //       currentSegment += char
    //     }

    //     // If we reach a dot, end the current segment
    //     if (char === '.') {
    //       if (currentSegment) {
    //         // Remove the dot and add the segment
    //         betTypesSegments.push(currentSegment.slice(0, -1))
    //         currentSegment = ''
    //         inBetType = false
    //       }
    //     }
    //   }

    //   // Add the last segment if it exists
    //   if (currentSegment) {
    //     betTypesSegments.push(currentSegment)
    //   }

    //   // Process each bet type segment
    //   const betTypes = []
    //   for (const segment of betTypesSegments) {
    //     // Extract bet type and amount
    //     const betTypeMatch = segment.match(/([a-z]+)(\d+(?:[,.]\d+)?)/i)
    //     if (betTypeMatch) {
    //       const [_, betTypeText, amountText] = betTypeMatch
    //       const betType = identifyBetType(betTypeText)
    //       if (betType) {
    //         const amount = parseAmount(amountText)
    //         betTypes.push({ betType, amount })
    //       }
    //     }
    //   }

    //   // If we have valid numbers and bet types
    //   if (numbers.length > 0 && betTypes.length > 0) {
    //     // Check that all numbers have the same length
    //     const lengths = new Set(numbers.map((num) => num.length))
    //     if (lengths.size > 1) {
    //       result.valid = false
    //       result.error = 'Tất cả các số trong một dòng cược phải có cùng độ dài'
    //       result.numbers = numbers
    //       return result
    //     }

    //     // Set the primary bet type and additional bet types
    //     result.numbers = numbers
    //     result.betType = betTypes[0].betType
    //     result.amount = betTypes[0].amount
    //     result.valid = true

    //     // Add additional bet types
    //     for (let i = 1; i < betTypes.length; i++) {
    //       result.additionalBetTypes.push({
    //         betType: betTypes[i].betType,
    //         amount: betTypes[i].amount,
    //         numbers: numbers, // Share the same numbers
    //       })
    //     }

    //     return result
    //   }
    // }

    // Check for multiple bet types pattern (eg: 66.88da1.b5) or single bet type with decimal amount
    const multipleBetTypesPattern =
      /^([\d.,]+)([a-z]+\d+(?:[,.]\d+)?)(\.([a-z]+\d+(?:[,.]\d+)?)+)?$/i
    const multipleBetMatch = normalizedLine.match(multipleBetTypesPattern)

    if (multipleBetMatch) {
      const [
        fullMatch,
        numbersPart,
        firstBetTypePart,
        dotAndRest,
        remainingBetTypes,
      ] = multipleBetMatch

      // Process the numbers - be explicit about splitting on both commas and dots
      const numbers = numbersPart.split(/[,.]/).filter((n) => n.trim() !== '')

      // Check if this is a multiple bet types case (with dot separator)
      if (dotAndRest) {
        // Extract first bet type and amount
        const firstBetTypeMatch = firstBetTypePart.match(
          /([a-z]+)(\d+(?:[,.]\d+)?)/i
        )
        if (!firstBetTypeMatch) return result

        const [_, firstBetTypeText, firstAmountText] = firstBetTypeMatch
        const firstBetType = identifyBetType(firstBetTypeText)
        const firstAmount = parseAmount(firstAmountText)

        if (!firstBetType) return result

        // Process remaining bet types
        const betTypes = [{ betType: firstBetType, amount: firstAmount }]
        const remainingBetTypePattern = /([a-z]+)(\d+(?:[,.]\d+)?)/gi
        let betTypeMatch

        while (
          (betTypeMatch = remainingBetTypePattern.exec(remainingBetTypes)) !==
          null
        ) {
          const [__, betTypeText, amountText] = betTypeMatch
          const betType = identifyBetType(betTypeText)
          if (betType) {
            const amount = parseAmount(amountText)
            betTypes.push({ betType, amount })
          }
        }

        // If we have valid numbers and bet types
        if (numbers.length > 0 && betTypes.length > 0) {
          // Check that all numbers have the same length
          const lengths = new Set(numbers.map((num) => num.length))
          if (lengths.size > 1) {
            result.valid = false
            result.error =
              'Tất cả các số trong một dòng cược phải có cùng độ dài'
            result.numbers = numbers
            return result
          }

          // Set the primary bet type and additional bet types
          result.numbers = numbers
          result.betType = betTypes[0].betType
          result.amount = betTypes[0].amount
          result.valid = true

          // Add additional bet types
          for (let i = 1; i < betTypes.length; i++) {
            result.additionalBetTypes.push({
              betType: betTypes[i].betType,
              amount: betTypes[i].amount,
              numbers: numbers, // Share the same numbers
            })
          }

          return result
        }
      } else {
        // This is a single bet type (possibly with decimal amount)
        const betTypeMatch = firstBetTypePart.match(
          /([a-z]+)(\d+(?:[,.]\d+)?)/i
        )
        if (betTypeMatch) {
          const [_, betTypeText, amountText] = betTypeMatch
          const betType = identifyBetType(betTypeText)
          if (betType) {
            const amount = parseAmount(amountText)

            // Check number lengths
            const lengths = new Set(numbers.map((num) => num.length))
            if (lengths.size > 1) {
              result.valid = false
              result.error =
                'Tất cả các số trong một dòng cược phải có cùng độ dài'
              result.numbers = numbers
              return result
            }

            // NEW CODE: Add validation against bet type rules
            if (numbers.length > 0) {
              const digitCount = numbers[0].length
              const validation = validateBetTypeDigitCount(
                betType.id,
                digitCount
              )
              if (!validation.valid) {
                result.valid = false
                result.error = validation.message
                result.numbers = numbers
                return result
              }
            }

            // Set result
            result.numbers = numbers
            result.betType = betType
            result.amount = amount
            result.valid = true
            return result
          }
        }
      }
    }

    // SPECIAL DIRECT HANDLING FOR KÉO PATTERN
    // Handle kéo pattern as a special case first - new precise regex
    const keoRegex =
      /(\d+)\/(\d+)(?:keo|k)(\d+)([a-z]+)(\d+(?:[,.]\d+)?(?:\.([a-z]+)(\d+(?:[,.]\d+)?))?)/i
    const keoMatch = normalizedLine.match(keoRegex)

    if (keoMatch) {
      // Extract all components
      const [
        fullMatch,
        start,
        next,
        end,
        betTypeText,
        amountText,
        secondBetType,
        secondAmount,
      ] = keoMatch

      // Convert numbers
      const startNum = parseInt(start, 10)
      const nextNum = parseInt(next, 10)
      const endNum = parseInt(end, 10)
      const step = nextNum - startNum

      if (step > 0) {
        // Generate the sequence
        const sequence = []
        for (let i = startNum; i <= endNum; i += step) {
          sequence.push(
            i.toString().padStart(Math.max(start.length, end.length), '0')
          )
        }

        // Identify the primary bet type
        const betType = identifyBetType(betTypeText)
        if (betType) {
          // Parse amount
          const amount = parseAmount(amountText)

          // Build the result
          result.numbers = sequence
          result.betType = betType
          result.amount = amount
          result.valid = true

          // Check if there's a second bet type
          if (secondBetType) {
            const secondBetTypeObj = identifyBetType(secondBetType)
            if (secondBetTypeObj) {
              result.additionalBetTypes = [
                {
                  betType: secondBetTypeObj,
                  amount: parseAmount(secondAmount),
                  numbers: sequence, // Share the same numbers
                },
              ]
            }
          }

          return result
        }
      }
    }

    // Cải tiến: Xử lý các trường hợp đặc biệt

    // 1. Xử lý nhiều kiểu cược trong một dòng (ví dụ: 23.45dd10.dau5)
    const multipleBetTypes = extractMultipleBetTypes(normalizedLine)

    if (multipleBetTypes.length > 1) {
      // Trích xuất phần số
      const numbersPart = extractNumbersPart(normalizedLine)
      let numbers = parseNumbers(numbersPart, station)

      // Xử lý từ khóa đặc biệt như tai, xiu, chanchan, v.v.
      const specialKeywords = [
        'tai',
        'xiu',
        'chan',
        'le',
        'chanchan',
        'lele',
        'chanle',
        'lechan',
      ]
      let hasSpecialKeyword = false

      for (const keyword of specialKeywords) {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(numbersPart)) {
          hasSpecialKeyword = true
          break
        }
      }

      if (hasSpecialKeyword) {
        // Lưu ý: Hàm processNumber đã xử lý các từ khóa đặc biệt
        numbers = []
        const parts = numbersPart.split('.')
        for (const part of parts) {
          if (specialKeywords.includes(part.toLowerCase())) {
            const specialNumbers = processSpecialKeyword(part)
            numbers.push(...specialNumbers)
          } else if (/^\d+$/.test(part)) {
            numbers.push(part)
          } else if (part.match(/^(\d+)\/(\d+)(?:keo|k)(\d+)$/)) {
            // Process 'keo' sequences
            const processedNumbers = processNumber(part, station)
            numbers.push(...processedNumbers)
          }
        }
      }

      // Kiểm tra và xử lý các số dạng nhóm (1234, 0102, v.v.)
      const processedNumbers = []
      for (const num of numbers) {
        if (/^\d{4,}$/.test(num) && num.length % 2 === 0) {
          // Phân tách thành các cặp 2 chữ số
          for (let i = 0; i < num.length; i += 2) {
            processedNumbers.push(num.substring(i, i + 2))
          }
        } else {
          processedNumbers.push(num)
        }
      }

      // THÊM ĐOẠN CODE KIỂM TRA ĐỘ DÀI NHẤT QUÁN CỦA CÁC SỐ
      if (processedNumbers.length > 0) {
        // Kiểm tra độ dài của các số
        const lengths = new Set(processedNumbers.map((num) => num.length))
        if (lengths.size > 1) {
          result.numbers = processedNumbers
          result.valid = false
          result.error = 'Tất cả các số trong một dòng cược phải có cùng độ dài'
          return result
        }

        // NEW CODE: Add validation against bet type rules
        const digitCount = processedNumbers[0].length
        const betType = multipleBetTypes[0].betType
        const validation = validateBetTypeDigitCount(betType.id, digitCount)
        if (!validation.valid) {
          result.valid = false
          result.error = validation.message
          return result
        }

        result.numbers = processedNumbers
        result.betType = multipleBetTypes[0].betType
        result.amount = multipleBetTypes[0].amount
        result.valid = true

        // Thêm các kiểu cược bổ sung
        for (let i = 1; i < multipleBetTypes.length; i++) {
          result.additionalBetTypes.push({
            betType: multipleBetTypes[i].betType,
            amount: multipleBetTypes[i].amount,
            numbers: processedNumbers, // Dùng chung danh sách số
          })
        }

        return result
      }
    }

    // 2. Xử lý số gộp thành nhóm (ví dụ: 1234.5678da1)
    // Kiểm tra xem có số nào có 4 chữ số trở lên không
    const groupedNumberPatterns = normalizedLine.match(/\d{4,}/g)
    if (
      groupedNumberPatterns &&
      groupedNumberPatterns.some((p) => p.length % 2 === 0)
    ) {
      // Tách phần kiểu cược
      const parts = normalizedLine.split(/([a-z]+\d+(?:[,.]\d+)?)/i)

      if (parts.length >= 2) {
        const numbersPart = parts[0]
        const betTypePart = parts[1]

        const betTypeMatch = betTypePart.match(/([a-z]+)(\d+(?:[,.]\d+)?)/i)
        if (betTypeMatch) {
          const betTypeAlias = betTypeMatch[1].toLowerCase()
          const betType = identifyBetType(betTypeAlias)
          const amount = parseAmount(betTypeMatch[2] || '10')

          if (betType) {
            // Phân tích phần số
            const numParts = numbersPart.split('.')
            const processedNumbers = []

            for (const part of numParts) {
              // Kiểm tra nếu là từ khóa đặc biệt
              if (isSpecialKeyword(part)) {
                const specialNumbers = processSpecialKeyword(part)
                processedNumbers.push(...specialNumbers)
              } else if (/^\d{4,}$/.test(part) && part.length % 2 === 0) {
                // Tách thành các cặp 2 chữ số
                for (let i = 0; i < part.length; i += 2) {
                  processedNumbers.push(part.substring(i, i + 2))
                }
              } else if (/^\d+$/.test(part)) {
                processedNumbers.push(part)
              } else if (part.match(/^(\d+)\/(\d+)(?:keo|k)(\d+)$/)) {
                // Process 'keo' sequences
                const keoNumbers = processNumber(part, station)
                processedNumbers.push(...keoNumbers)
              }
            }

            // THÊM ĐOẠN CODE KIỂM TRA ĐỘ DÀI NHẤT QUÁN CỦA CÁC SỐ
            if (processedNumbers.length > 0) {
              // Kiểm tra độ dài của các số
              const lengths = new Set(processedNumbers.map((num) => num.length))
              if (lengths.size > 1) {
                result.numbers = processedNumbers
                result.valid = false
                result.error =
                  'Tất cả các số trong một dòng cược phải có cùng độ dài'
                return result
              }

              // NEW CODE: Add validation against bet type rules
              const digitCount = processedNumbers[0].length
              const validation = validateBetTypeDigitCount(
                betType.id,
                digitCount
              )
              if (!validation.valid) {
                result.valid = false
                result.error = validation.message
                return result
              }

              result.numbers = processedNumbers
              result.betType = betType
              result.amount = amount
              result.valid = true
              return result
            }
          }
        }
      }
    }

    // Xử lý cách thông thường nếu không phát hiện kiểu cược rõ ràng
    // Phân tích
    const numbers = []
    let currentNumber = ''
    let currentBetType = ''
    let currentAmount = ''
    let parsingState = 'number' // Trạng thái phân tích: 'number', 'betType', 'amount'

    // Trong hàm parseBetLine, thay đổi đoạn xử lý ký tự:
    for (let i = 0; i < normalizedLine.length; i++) {
      const char = normalizedLine[i]

      if (char === '.') {
        // Dấu chấm có thể là dấu phân cách số hoặc là dấu thập phân trong số tiền
        if (parsingState === 'amount') {
          // Nếu đang ở trạng thái phân tích số tiền, dấu chấm là một phần của số tiền
          currentAmount += char
        } else if (parsingState === 'number' && currentNumber) {
          // Thêm số hiện tại vào danh sách
          const processedNumbers = processNumber(currentNumber, station)
          numbers.push(...processedNumbers)
          currentNumber = ''
        } else if (parsingState === 'betType' && currentBetType) {
          // Đã có kiểu cược, nhưng gặp dấu chấm, có thể có nhiều kiểu cược
          result.betType = identifyBetType(currentBetType)
          currentBetType = ''
          parsingState = 'number'
        }
      } else if (/[0-9]/.test(char)) {
        // Ký tự số
        if (parsingState === 'number' || parsingState === 'amount') {
          if (parsingState === 'betType' && currentBetType) {
            // Chuyển từ betType sang amount
            result.betType = identifyBetType(currentBetType)
            currentBetType = ''
            parsingState = 'amount'
          }

          if (
            parsingState === 'number' &&
            hasCompleteBetTypeAndAmount(normalizedLine, i)
          ) {
            // Nếu phía sau có đủ kiểu cược và số tiền, kết thúc số hiện tại
            if (currentNumber) {
              const processedNumbers = processNumber(currentNumber, station)
              numbers.push(...processedNumbers)
              currentNumber = ''
            }
            // Chuyển sang phân tích kiểu cược
            parsingState = 'betType'
            currentBetType += char
          } else if (parsingState === 'amount') {
            currentAmount += char
          } else {
            currentNumber += char
          }
        } else {
          // Trong kiểu cược, có thể là phần của kiểu cược hoặc số tiền
          if (isBetTypeOrAmount(currentBetType + char)) {
            currentBetType += char
          } else {
            // Chuyển sang phân tích số tiền
            result.betType = identifyBetType(currentBetType)
            currentBetType = ''
            parsingState = 'amount'
            currentAmount += char
          }
        }
      } else if (char === '/' || char === 'k') {
        // Ký tự đặc biệt trong số
        if (parsingState === 'number') {
          currentNumber += char
        } else if (parsingState === 'betType') {
          currentBetType += char
        }
      } else if (isAlphabetChar(char)) {
        // Cải tiến: Kiểm tra kỹ hơn khi gặp ký tự chữ cái
        // Ký tự chữ cái - có thể là phần của kiểu cược hoặc là phần của kéo hoặc từ khóa đặc biệt

        // Improved check for "keo" pattern
        const isKeoPattern =
          currentNumber.includes('/') &&
          (char.toLowerCase() === 'k' ||
            (currentNumber.toLowerCase().includes('/k') &&
              char.toLowerCase() === 'e') ||
            (currentNumber.toLowerCase().includes('/ke') &&
              char.toLowerCase() === 'o'))

        if (
          parsingState === 'number' &&
          (isKeoPattern ||
            currentNumber.includes('/') ||
            isPartOfSpecialKeyword(currentNumber, char))
        ) {
          // Đang phân tích "kéo" hoặc các ký tự đặc biệt khác trong số
          currentNumber += char
        } else {
          // Chuyển sang kiểu cược
          if (parsingState === 'number' && currentNumber) {
            const processedNumbers = processNumber(currentNumber, station)
            numbers.push(...processedNumbers)
            currentNumber = ''
          }

          parsingState = 'betType'
          currentBetType += char
        }
      } else if (char === ',') {
        // Dấu phẩy có thể dùng trong số tiền
        if (parsingState === 'amount') {
          currentAmount += char
        } else if (parsingState === 'number' && currentNumber) {
          // Xử lý dấu phẩy như dấu chấm nếu đang ở phần số
          const processedNumbers = processNumber(currentNumber, station)
          numbers.push(...processedNumbers)
          currentNumber = ''
        }
      } else if (char === 'n' && parsingState === 'amount') {
        // Ký tự 'n' trong số tiền (nghìn)
        // Không thêm gì, bỏ qua
      }
    }

    // Xử lý phần cuối
    if (parsingState === 'number' && currentNumber) {
      const processedNumbers = processNumber(currentNumber, station)
      numbers.push(...processedNumbers)
    } else if (parsingState === 'betType' && currentBetType) {
      result.betType = identifyBetType(currentBetType)
    } else if (parsingState === 'amount' && currentAmount) {
      result.amount = parseAmount(currentAmount)
    }

    // Nếu vẫn chưa có kiểu cược, thử phân tích lại xem có vô tình bỏ qua không
    if (!result.betType && numbers.length > 0) {
      // Tìm kiểu cược ở cuối dòng (bao gồm cả trường hợp có khoảng trắng + chữ 'n' sau số tiền)
      const betTypeMatch = normalizedLine.match(
        /([a-z]+)(?:\s+)?(\d+(?:[,.]\d+)?(?:n)?)?$/i
      )
      if (betTypeMatch) {
        const potentialBetType = betTypeMatch[1].toLowerCase()
        const betType = identifyBetType(potentialBetType)

        if (betType) {
          result.betType = betType

          // Nếu có số tiền
          if (betTypeMatch[2]) {
            result.amount = parseAmount(betTypeMatch[2])
          }
        }
      }
    }

    // Đảm bảo không có số trùng lặp
    result.numbers = Array.from(new Set(numbers))

    // THÊM ĐOẠN CODE KIỂM TRA ĐỘ DÀI NHẤT QUÁN CỦA CÁC SỐ
    if (result.numbers.length > 0) {
      const lengths = new Set(result.numbers.map((num) => num.length))
      if (lengths.size > 1) {
        result.valid = false
        result.error = 'Tất cả các số trong một dòng cược phải có cùng độ dài'
        return result
      }

      // NEW CODE: Add validation against bet type rules
      if (result.valid && result.betType && result.numbers.length > 0) {
        const digitCount = result.numbers[0].length
        const validation = validateBetTypeDigitCount(
          result.betType.id,
          digitCount
        )
        if (!validation.valid) {
          result.valid = false
          result.error = validation.message
        }
      }
    }

    // Kiểm tra tính hợp lệ
    result.valid =
      result.numbers.length > 0 && result.betType && result.amount > 0

    // NEW CODE: Add compatibility validation between bet type and region
    if (result.valid && result.betType) {
      const compatibilityCheck = validateBetTypeRegionCompatibility(
        result.betType,
        station
      )
      if (!compatibilityCheck.valid) {
        result.valid = false
        result.error = compatibilityCheck.error
      }
    }

    return result
  } catch (error) {
    console.error('Lỗi khi phân tích dòng cược:', error, line)
    return {
      ...result,
      error: `Lỗi phân tích: ${error.message}`,
    }
  }
}

/**
 * Trích xuất nhiều kiểu cược từ một dòng
 * @param {string} line - Dòng cần phân tích
 * @returns {Array} Danh sách các kiểu cược tìm thấy
 */
function extractMultipleBetTypes(line) {
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  const result = []

  // Chuẩn hóa line
  const normalizedLine = line
    .replace(/xcdui/g, 'xcduoi')
    .replace(/(\b|[^a-z])dui(\d+|$)/g, '$1duoi$2')
    .replace(/[,\- ]+/g, '.')
    .replace(/([a-z]+)\s+(\d+(?:[,.]\d+)?)/gi, '$1$2') // Loại bỏ khoảng trắng giữa kiểu cược và số tiền

  // Enhanced detection of multiple bet types separated by dots
  // This regular expression looks for patterns like 'da1.b5.dau10' in the line
  const combinedBetTypesRegex =
    /(?:^|\.)((?:[a-z]+\d+(?:[,.]\d+)?\.?)+)(?:$|\.)/i
  const betTypeMatch = normalizedLine.match(combinedBetTypesRegex)

  if (betTypeMatch) {
    // Get all bet type segments
    const betTypesStr = betTypeMatch[1]
    const betTypeSegments = []

    // Detect individual bet types in combined string
    let currentSegment = ''
    let inBetType = false

    for (let i = 0; i < betTypesStr.length; i++) {
      const char = betTypesStr[i]

      // If we find a letter after a number or at the beginning, it's a new bet type
      if (
        /[a-z]/i.test(char) &&
        (!inBetType ||
          /\d/.test(currentSegment.charAt(currentSegment.length - 1)))
      ) {
        if (inBetType && currentSegment) {
          betTypeSegments.push(currentSegment)
          currentSegment = ''
        }
        inBetType = true
        currentSegment += char
      } else {
        currentSegment += char
      }

      // If we reach a dot, end the current segment
      if (char === '.') {
        if (currentSegment) {
          // Remove the dot and add the segment
          betTypeSegments.push(currentSegment.slice(0, -1))
          currentSegment = ''
          inBetType = false
        }
      }
    }

    // Add the last segment if it exists
    if (currentSegment) {
      betTypeSegments.push(currentSegment)
    }

    // Process each bet type segment
    for (const segment of betTypeSegments) {
      // Find the bet type and amount parts
      const betTypeMatch = segment.match(/([a-z]+)(\d+(?:[,.]\d+)?)/i)

      if (betTypeMatch) {
        const [fullMatch, betTypeText, amountText] = betTypeMatch
        const betType = identifyBetType(betTypeText)

        if (betType) {
          const amount = parseAmount(amountText)
          result.push({
            betType,
            amount,
            fullSegment: segment,
          })
        }
      }
    }

    return result
  }

  // Fallback to original pattern matching if combined pattern doesn't match
  // Tạo pattern với word boundary (\b) để đảm bảo tìm đúng kiểu cược
  const betTypePattern = betTypeAliases
    .sort((a, b) => b.length - a.length)
    .map((alias) => `\\b${alias}\\b`)
    .join('|')

  // Tìm tất cả các kiểu cược trong dòng với regex cải tiến
  // Thêm hỗ trợ cho số tiền decimal với dấu phẩy hoặc dấu chấm
  const betTypeRegex = new RegExp(
    `(${betTypePattern})(\\d+(?:[,.]\\d+)?)`,
    'gi'
  )

  let match
  while ((match = betTypeRegex.exec(normalizedLine)) !== null) {
    const betTypeAlias = match[1].toLowerCase()
    const amountStr = match[2]
    const betType = identifyBetType(betTypeAlias)

    if (betType && amountStr) {
      result.push({
        betType,
        amount: parseAmount(amountStr),
      })
    }
  }

  return result
}

/**
 * Trích xuất phần số từ dòng cược
 */
function extractNumbersPart(line) {
  // Tìm vị trí kiểu cược đầu tiên
  const betTypeAliases = defaultBetTypes.flatMap((bt) => bt.aliases)
  let betTypeIndex = line.length

  for (const alias of betTypeAliases) {
    const regex = new RegExp(`\\b${alias}\\d*`, 'i')
    const match = regex.exec(line)
    if (match && match.index < betTypeIndex) {
      betTypeIndex = match.index
      break
    }
  }

  return line.substring(0, betTypeIndex).trim()
}

/**
 * Phân tích danh sách số từ phần số
 */
function parseNumbers(numbersPart, station) {
  const numbers = []
  const parts = numbersPart.split('.')

  for (const part of parts) {
    if (part.trim() === '') continue

    // Xử lý các trường hợp đặc biệt (keo, tai, xiu, ...)
    const processedNumbers = processNumber(part, station)
    numbers.push(...processedNumbers)
  }

  return numbers
}

/**
 * Xử lý chuỗi số cược và chuyển đổi thành mảng số
 */
function processNumber(numberString) {
  // Xử lý kéo: 10/20keo90 or 10/20k90
  // Enhanced to better handle the format directly
  const keoRegex = /^(\d+)\/(\d+)(?:keo|k)(\d+)$/i
  const keoMatch = numberString.match(keoRegex)

  if (keoMatch) {
    const start = parseInt(keoMatch[1], 10)
    const next = parseInt(keoMatch[2], 10)
    const end = parseInt(keoMatch[3], 10)

    const step = next - start
    // If step is invalid, just return original string to avoid errors
    if (step <= 0) return [numberString]

    const numbers = []
    // Generate sequence with proper padding
    const padLength = Math.max(keoMatch[1].length, keoMatch[3].length)
    for (let i = start; i <= end; i += step) {
      numbers.push(i.toString().padStart(padLength, '0'))
    }

    return numbers
  }

  // Handle other special keyword cases
  // Check for exact keyword match
  const lowerString = numberString.toLowerCase()

  switch (lowerString) {
    case 'tai':
      return generateTaiNumbers()
    case 'xiu':
      return generateXiuNumbers()
    case 'chan':
      return generateChanNumbers()
    case 'le':
      return generateLeNumbers()
    case 'chanchan':
      return generateChanChanNumbers()
    case 'lele':
      return generateLeLeNumbers()
    case 'chanle':
      return generateChanLeNumbers()
    case 'lechan':
      return generateLeChanNumbers()
  }

  // Handle grouped numbers
  if (/^\d{4,}$/.test(numberString) && numberString.length % 2 === 0) {
    const numbers = []
    for (let i = 0; i < numberString.length; i += 2) {
      numbers.push(numberString.substring(i, i + 2))
    }
    return numbers
  }

  // Return as is for normal numbers
  return [numberString]
}

/**
 * Xử lý từ khóa đặc biệt và trả về danh sách số
 */
function processSpecialKeyword(keyword) {
  switch (keyword.toLowerCase()) {
    case 'tai':
      return generateTaiNumbers()
    case 'xiu':
      return generateXiuNumbers()
    case 'chan':
      return generateChanNumbers()
    case 'le':
      return generateLeNumbers()
    case 'chanchan':
      return generateChanChanNumbers()
    case 'lele':
      return generateLeLeNumbers()
    case 'chanle':
      return generateChanLeNumbers()
    case 'lechan':
      return generateLeChanNumbers()
    default:
      return []
  }
}

/**
 * Kiểm tra xem chuỗi từ vị trí hiện tại có đủ thông tin cho kiểu cược và số tiền không
 * @param {string} line - Dòng cần kiểm tra
 * @param {number} currentPos - Vị trí hiện tại trong dòng
 * @returns {boolean} Có đủ thông tin hay không
 */
function hasCompleteBetTypeAndAmount(line, currentPos) {
  // Tìm kiểu cược ở phần còn lại của dòng
  const remainingLine = line.substring(currentPos)

  // Cải tiến: Sử dụng regex chính xác hơn để tìm kiểu cược
  // Tạo pattern regex từ các alias kiểu cược, sắp xếp theo độ dài để ưu tiên tìm kiếm các alias dài hơn trước
  const betTypePattern = defaultBetTypes
    .flatMap((bt) => bt.aliases)
    .sort((a, b) => b.length - a.length)
    .join('|')

  // Tìm kiểu cược và số tiền ở phần sau của dòng
  // Cải tiến: Sử dụng word boundary \b để đảm bảo tìm đúng kiểu cược hoàn chỉnh
  const betTypeRegex = new RegExp(
    `\\b(${betTypePattern})\\d+(?:[,.n]\\d+)?$`,
    'i'
  )
  return betTypeRegex.test(remainingLine)
}

/**
 * Kiểm tra xem chuỗi có thể là kiểu cược hoặc số tiền hay không
 */
function isBetTypeOrAmount(text) {
  // Kiểm tra nếu là kiểu cược
  const isBetType = defaultBetTypes.some((bt) =>
    bt.aliases.some((alias) => alias.startsWith(text.toLowerCase()))
  )

  // Hoặc kiểm tra nếu thuộc kiểu số liệu
  return isBetType || /^[0-9,.]+$/.test(text)
}

/**
 * Phân tích số tiền cược
 * @param {string} amountString - Chuỗi số tiền
 * @returns {number} Số tiền đã phân tích
 */
function parseAmount(amountString) {
  if (!amountString) return 0

  let cleaned = amountString.replace(/[^0-9,.]/g, '')
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  const amount = parseFloat(cleaned)
  if (isNaN(amount)) return 0

  return amount * 1000
}
/**
 * Xác định kiểu cược từ chuỗi
 */
function identifyBetType(betTypeString) {
  if (!betTypeString) return null

  const normalized = betTypeString.toLowerCase()

  // Xử lý các kiểu cược đặc biệt
  if (normalized === 'dui') return identifyBetType('duoi')
  if (normalized === 'xcdui') return identifyBetType('xcduoi')
  if (normalized === 'b7lo') return identifyBetType('b7l')
  if (normalized === 'b8lo') return identifyBetType('b8l')

  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      if (normalized === alias) {
        return {
          id: betType.name,
          name: betType.name,
          alias: alias,
        }
      }
    }
  }

  // Kiểm tra partial match cho các trường hợp viết tắt/không chuẩn
  for (const betType of defaultBetTypes) {
    for (const alias of betType.aliases) {
      if (alias.startsWith(normalized) || normalized.startsWith(alias)) {
        return {
          id: betType.name,
          name: betType.name,
          alias: alias,
        }
      }
    }
  }

  return null
}

/**
 * Kiểm tra xem ký tự có phải là chữ cái hay không
 */
function isAlphabetChar(char) {
  return /[a-z]/i.test(char)
}

// Add new validation helper function
function validateBetTypeDigitCount(betTypeId, digitCount) {
  const betType = defaultBetTypes.find((bt) => bt.name === betTypeId)
  if (!betType || !betType.betRule) {
    return { valid: true } // No rules defined, allow any
  }

  const allowedDigitRules = betType.betRule
  const isAllowed = allowedDigitRules.some(
    (rule) => rule === `${digitCount} digits`
  )

  if (!isAllowed) {
    return {
      valid: false,
      message: `Kiểu cược ${
        betType.name
      } chỉ chấp nhận ${allowedDigitRules.join(
        ', '
      )}, không hỗ trợ số ${digitCount} chữ số`,
    }
  }

  return { valid: true }
}

/**
 * Kiểm tra tính tương thích giữa kiểu cược và miền/đài
 * @param {object} betType - Thông tin kiểu cược
 * @param {object} station - Thông tin đài
 * @returns {object} Kết quả kiểm tra {valid: boolean, error: string}
 */
function validateBetTypeRegionCompatibility(betType, station) {
  // Nếu không có thông tin kiểu cược hoặc đài, trả về lỗi
  if (!betType || !station) {
    return {
      valid: false,
      error: 'Thiếu thông tin kiểu cược hoặc đài',
    }
  }

  // Tìm kiểu cược trong danh sách kiểu cược mặc định
  const defaultBetType = defaultBetTypes.find(
    (bt) =>
      bt.name === betType.id ||
      bt.aliases.some((a) => a.toLowerCase() === betType.alias?.toLowerCase())
  )

  // Nếu không tìm thấy kiểu cược, trả về lỗi
  if (!defaultBetType) {
    return {
      valid: false,
      error: `Kiểu cược ${betType.alias || betType.id} không tồn tại`,
    }
  }

  // Lấy danh sách các miền mà kiểu cược này có thể áp dụng
  const applicableRegions = defaultBetType.applicableRegions || []

  // Lấy miền của đài
  const stationRegion = station.region

  // Kiểm tra xem miền của đài có nằm trong danh sách các miền mà kiểu cược này có thể áp dụng hay không
  if (!applicableRegions.includes(stationRegion)) {
    return {
      valid: false,
      error: `Kiểu cược ${
        defaultBetType.name
      } không áp dụng cho miền ${mapRegionName(stationRegion)}`,
    }
  }

  // Nếu tất cả các kiểm tra đều thành công, trả về kết quả thành công
  return {
    valid: true,
  }
}

/**
 * Map tên miền sang tên hiển thị
 * @param {string} region - Mã miền
 * @returns {string} Tên miền hiển thị
 */
function mapRegionName(region) {
  const regionMap = {
    north: 'Miền Bắc',
    central: 'Miền Trung',
    south: 'Miền Nam',
  }
  return regionMap[region] || region
}

/**
 * Tạo danh sách số tài (50-99)
 */
function generateTaiNumbers() {
  const numbers = []
  for (let i = 50; i <= 99; i++) {
    numbers.push(i.toString().padStart(2, '0'))
  }
  return numbers
}

/**
 * Tạo danh sách số xỉu (00-49)
 */
function generateXiuNumbers() {
  const numbers = []
  for (let i = 0; i <= 49; i++) {
    numbers.push(i.toString().padStart(2, '0'))
  }
  return numbers
}

/**
 * Tạo danh sách số chẵn (00, 02, 04, ..., 98)
 */
function generateChanNumbers() {
  const numbers = []
  for (let i = 0; i <= 98; i += 2) {
    numbers.push(i.toString().padStart(2, '0'))
  }
  return numbers
}

/**
 * Tạo danh sách số lẻ (01, 03, 05, ..., 99)
 */
function generateLeNumbers() {
  const numbers = []
  for (let i = 1; i <= 99; i += 2) {
    numbers.push(i.toString().padStart(2, '0'))
  }
  return numbers
}

/**
 * Tạo danh sách số chẵn chẵn (00, 02, 04, ..., 88)
 */
function generateChanChanNumbers() {
  const numbers = []
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`)
    }
  }
  return numbers
}

/**
 * Tạo danh sách số lẻ lẻ (11, 13, 15, ..., 99)
 */
function generateLeLeNumbers() {
  const numbers = []
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`)
    }
  }
  return numbers
}

/**
 * Tạo danh sách số chẵn lẻ (01, 03, 05, ..., 89)
 */
function generateChanLeNumbers() {
  const numbers = []
  for (let i = 0; i <= 8; i += 2) {
    for (let j = 1; j <= 9; j += 2) {
      numbers.push(`${i}${j}`)
    }
  }
  return numbers
}

/**
 * Tạo danh sách số lẻ chẵn (10, 12, 14, ..., 98)
 */
function generateLeChanNumbers() {
  const numbers = []
  for (let i = 1; i <= 9; i += 2) {
    for (let j = 0; j <= 8; j += 2) {
      numbers.push(`${i}${j}`)
    }
  }
  return numbers
}

export default {
  parseBetCode,
}
