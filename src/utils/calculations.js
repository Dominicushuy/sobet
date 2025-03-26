// src/utils/calculations.js

/**
 * Tính tổ hợp chập k của n phần tử - C(n,k)
 * @param {number} n - Tổng số phần tử
 * @param {number} k - Số phần tử cần chọn
 * @returns {number} Số tổ hợp
 */
export function calculateCombination(n, k) {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1

  // Tối ưu bằng cách tính C(n,k) = C(n,n-k) với k > n/2
  if (k > n / 2) {
    k = n - k
  }

  let result = 1
  for (let i = 0; i < k; i++) {
    result *= n - i
    result /= i + 1
  }

  return Math.round(result)
}

/**
 * Tính hoán vị của n phần tử - P(n)
 * @param {number} n - Số phần tử
 * @returns {number} Số hoán vị
 */
export function calculatePermutation(n) {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

/**
 * Tính hoán vị có lặp lại - P(n; n1, n2, ..., nk)
 * @param {number} n - Tổng số phần tử
 * @param {array} duplicates - Mảng số lần lặp lại của từng phần tử
 * @returns {number} Số hoán vị có lặp lại
 */
export function calculatePermutationWithDuplicates(n, duplicates) {
  let denominator = 1
  for (const count of duplicates) {
    denominator *= calculatePermutation(count)
  }
  return calculatePermutation(n) / denominator
}

/**
 * Tính số chỉnh hợp chập k của n phần tử - A(n,k)
 * @param {number} n - Tổng số phần tử
 * @param {number} k - Số phần tử cần chọn
 * @returns {number} Số chỉnh hợp
 */
export function calculateArrangement(n, k) {
  if (k < 0 || k > n) return 0
  if (k === 0) return 1

  let result = 1
  for (let i = 0; i < k; i++) {
    result *= n - i
  }

  return result
}

/**
 * Tính giai thừa
 * @param {number} n - Số cần tính giai thừa
 * @returns {number} Giai thừa của n
 */
export function factorial(n) {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

/**
 * Làm tròn số đến số chữ số thập phân cụ thể
 * @param {number} value - Giá trị cần làm tròn
 * @param {number} decimals - Số chữ số thập phân (mặc định: 2)
 * @returns {number} Giá trị đã làm tròn
 */
export function roundToDecimals(value, decimals = 2) {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Chuyển đổi định dạng chuỗi tiền thành số
 * @param {string} moneyString - Chuỗi tiền (vd: "1,000.50", "1.000,50")
 * @returns {number} Giá trị số
 */
export function parseMoneyString(moneyString) {
  if (!moneyString) return 0

  // Xác định định dạng (phẩy làm dấu thập phân hoặc chấm làm dấu thập phân)
  const hasCommaDecimal = /\d,\d{1,2}$/.test(moneyString)

  // Làm sạch chuỗi
  let cleanedString = moneyString.replace(/[^\d,.]/g, '')

  if (hasCommaDecimal) {
    // Định dạng Châu Âu: 1.000,50
    cleanedString = cleanedString.replace(/\./g, '') // Xóa dấu chấm phân cách hàng nghìn
    cleanedString = cleanedString.replace(',', '.') // Đổi dấu phẩy thành dấu chấm thập phân
  } else {
    // Định dạng Mỹ/UK: 1,000.50
    cleanedString = cleanedString.replace(/,/g, '') // Xóa dấu phẩy phân cách hàng nghìn
  }

  return parseFloat(cleanedString) || 0
}

/**
 * Định dạng số thành chuỗi tiền
 * @param {number} value - Giá trị cần định dạng
 * @param {boolean} useCommaDecimal - Sử dụng dấu phẩy làm dấu thập phân
 * @param {number} decimals - Số chữ số thập phân
 * @returns {string} Chuỗi tiền đã định dạng
 */
export function formatMoney(value, useCommaDecimal = false, decimals = 0) {
  if (value === null || value === undefined) return '0'

  // Làm tròn số
  const roundedValue = roundToDecimals(value, decimals)

  // Chuyển đổi thành định dạng hiển thị
  if (useCommaDecimal) {
    // Định dạng Châu Âu: 1.000,50
    return roundedValue
      .toFixed(decimals)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  } else {
    // Định dạng Mỹ/UK: 1,000.50
    return roundedValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export default {
  calculateCombination,
  calculatePermutation,
  calculatePermutationWithDuplicates,
  calculateArrangement,
  factorial,
  roundToDecimals,
  parseMoneyString,
  formatMoney,
}
