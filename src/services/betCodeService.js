// src/services/betCodeService.js
import { parseBetCode } from './betCodeParser/parser'
import { detectErrors } from './betCodeParser/errorDetector'
import { suggestFixes, fixBetCode } from './betCodeParser/errorFixer'
import { formatBetCode } from './betCodeParser/formatter'
import { calculateStake } from './calculator/stakeCalculator'
import { calculatePotentialPrize } from './calculator/prizeCalculator'

/**
 * Dịch vụ phân tích và xử lý mã cược
 */
export const betCodeService = {
  /**
   * Phân tích toàn diện một mã cược
   * @param {string} rawText - Mã cược thô
   * @returns {object} Kết quả phân tích
   */
  analyzeBetCode(rawText) {
    try {
      // Chuẩn hóa định dạng
      const formattedText = formatBetCode(rawText)
      const isFormatted = formattedText !== rawText

      // Phân tích mã cược
      const parseResult = parseBetCode(formattedText)

      // Phát hiện lỗi
      const errorResult = detectErrors(formattedText, parseResult)

      // Gợi ý sửa lỗi nếu có
      const fixSuggestions = errorResult.hasErrors
        ? suggestFixes(formattedText, errorResult)
        : { hasSuggestions: false, suggestions: [] }

      // Thử sửa lỗi tự động
      const fixResult = errorResult.hasErrors
        ? fixBetCode(formattedText, errorResult)
        : { success: false, fixed: '', changes: [] }

      // Nếu mã cược hợp lệ, tính toán số tiền và tiềm năng thắng
      let calculationResults = { stakeResult: null, prizeResult: null }

      if (parseResult.success && !errorResult.hasErrors) {
        calculationResults.stakeResult = calculateStake(parseResult)
        calculationResults.prizeResult = calculatePotentialPrize(parseResult)
      }

      // Kết quả phân tích cũng kiểm tra mã đã sửa nếu có
      let fixedCodeAnalysis = null
      if (fixResult.success) {
        const fixedParseResult = parseBetCode(fixResult.fixed)
        if (fixedParseResult.success) {
          const fixedStakeResult = calculateStake(fixedParseResult)
          const fixedPrizeResult = calculatePotentialPrize(fixedParseResult)

          fixedCodeAnalysis = {
            parseResult: fixedParseResult,
            stakeResult: fixedStakeResult,
            prizeResult: fixedPrizeResult,
          }
        }
      }

      return {
        success: parseResult.success && !errorResult.hasErrors,
        rawText,
        formattedText,
        isFormatted,
        parseResult,
        errorResult,
        fixSuggestions,
        fixResult,
        calculationResults,
        fixedCodeAnalysis,
      }
    } catch (error) {
      console.error('Error analyzing bet code:', error)
      return {
        success: false,
        error: error.message,
        rawText,
      }
    }
  },

  /**
   * Kiểm tra nhanh xem một mã cược có hợp lệ không
   * @param {string} text - Mã cược cần kiểm tra
   * @returns {boolean} Kết quả kiểm tra
   */
  isValidBetCode(text) {
    try {
      const formattedText = formatBetCode(text)
      const parseResult = parseBetCode(formattedText)
      const errorResult = detectErrors(formattedText, parseResult)

      return parseResult.success && !errorResult.hasErrors
    } catch (error) {
      return false
    }
  },

  /**
   * Trích xuất thông tin tóm tắt từ mã cược
   * @param {string} text - Mã cược
   * @returns {object} Thông tin tóm tắt
   */
  extractBetCodeSummary(text) {
    const analysis = this.analyzeBetCode(text)

    if (!analysis.success) {
      return {
        isValid: false,
        station: null,
        lineCount: 0,
        stakeAmount: 0,
        potentialWinning: 0,
      }
    }

    const { parseResult, calculationResults } = analysis
    const { stakeResult, prizeResult } = calculationResults

    return {
      isValid: true,
      station: parseResult.station,
      lineCount: parseResult.lines.length,
      stakeAmount: stakeResult.success ? stakeResult.totalStake : 0,
      potentialWinning: prizeResult.success ? prizeResult.totalPotential : 0,
      lines: parseResult.lines,
    }
  },
}

export default betCodeService
