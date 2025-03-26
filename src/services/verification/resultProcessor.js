// src/services/verification/resultProcessor.js
import { db } from "@/database/db";
import { BET_CODE_STATUS } from "@/config/constants";
import { matchBetCodeWithResults } from "./matcher";

/**
 * Xử lý kết quả đối soát cho một mã cược
 * @param {object} betCode - Thông tin mã cược
 * @param {array} lotteryResults - Danh sách kết quả xổ số
 * @returns {object} Kết quả xử lý
 */
export async function processBetCodeVerification(betCode, lotteryResults) {
  if (!betCode || !lotteryResults || !Array.isArray(lotteryResults)) {
    return {
      success: false,
      error: "Dữ liệu đầu vào không hợp lệ",
    };
  }

  try {
    // Đối soát mã cược với kết quả xổ số
    const matchResult = matchBetCodeWithResults(betCode, lotteryResults);

    if (!matchResult.success) {
      return {
        success: false,
        error: matchResult.error || "Lỗi khi đối soát mã cược",
      };
    }

    // Cập nhật trạng thái mã cược
    const status = matchResult.totalWinAmount > 0 ? "won" : "lost";

    await db.betCodes.update(betCode.id, {
      status,
      verificationResult: matchResult,
      verifiedAt: new Date(),
    });

    // Lưu kết quả đối soát
    const verificationResult = {
      betCodeIds: [betCode.id],
      resultsId: lotteryResults.map((r) => r.id),
      verifiedAt: new Date(),
      result: {
        status,
        winAmount: matchResult.totalWinAmount,
        matches: matchResult.matches,
      },
    };

    const verificationId = await db.verificationResults.add(verificationResult);

    return {
      success: true,
      betCodeId: betCode.id,
      status,
      winAmount: matchResult.totalWinAmount,
      verificationId,
    };
  } catch (error) {
    console.error("Lỗi khi xử lý kết quả đối soát:", error);
    return {
      success: false,
      error: `Lỗi khi xử lý kết quả đối soát: ${error.message}`,
    };
  }
}

/**
 * Xử lý kết quả đối soát cho nhiều mã cược
 * @param {array} betCodes - Danh sách mã cược
 * @param {array} lotteryResults - Danh sách kết quả xổ số
 * @returns {object} Kết quả xử lý
 */
export async function processBatchVerification(betCodes, lotteryResults) {
  if (
    !betCodes ||
    !Array.isArray(betCodes) ||
    !lotteryResults ||
    !Array.isArray(lotteryResults)
  ) {
    return {
      success: false,
      error: "Dữ liệu đầu vào không hợp lệ",
    };
  }

  try {
    const results = [];
    const betCodeIds = [];
    const resultIds = lotteryResults.map((r) => r.id);

    // Đối soát từng mã cược
    for (const betCode of betCodes) {
      // Chỉ đối soát các mã cược chưa đối soát
      if (betCode.status !== BET_CODE_STATUS.PENDING) {
        continue;
      }

      const matchResult = matchBetCodeWithResults(betCode, lotteryResults);

      if (!matchResult.success) {
        console.error(
          `Lỗi khi đối soát mã cược ${betCode.id}: ${matchResult.error}`
        );
        continue;
      }

      // Cập nhật trạng thái mã cược
      const status = matchResult.totalWinAmount > 0 ? "won" : "lost";

      await db.betCodes.update(betCode.id, {
        status,
        verificationResult: matchResult,
        verifiedAt: new Date(),
      });

      betCodeIds.push(betCode.id);

      results.push({
        betCodeId: betCode.id,
        status,
        winAmount: matchResult.totalWinAmount,
      });
    }

    // Nếu không có mã cược nào được đối soát
    if (betCodeIds.length === 0) {
      return {
        success: true,
        message: "Không có mã cược nào cần đối soát",
        verifiedCount: 0,
      };
    }

    // Lưu kết quả đối soát chung
    const verificationResult = {
      betCodeIds,
      resultsId: resultIds,
      verifiedAt: new Date(),
      result: {
        verifiedCount: betCodeIds.length,
        results,
      },
    };

    const verificationId = await db.verificationResults.add(verificationResult);

    return {
      success: true,
      verifiedCount: betCodeIds.length,
      results,
      verificationId,
    };
  } catch (error) {
    console.error("Lỗi khi xử lý kết quả đối soát hàng loạt:", error);
    return {
      success: false,
      error: `Lỗi khi xử lý kết quả đối soát hàng loạt: ${error.message}`,
    };
  }
}

/**
 * Đánh dấu mã cược đã đối soát theo kết quả xổ số
 * @param {number} betCodeId - ID mã cược
 * @param {array} verificationResult - Kết quả đối soát
 * @returns {object} Kết quả xử lý
 */
export async function markBetCodeAsVerified(betCodeId, verificationResult) {
  if (!betCodeId || !verificationResult) {
    return {
      success: false,
      error: "Dữ liệu đầu vào không hợp lệ",
    };
  }

  try {
    // Kiểm tra mã cược tồn tại
    const betCode = await db.betCodes.get(betCodeId);

    if (!betCode) {
      return {
        success: false,
        error: "Mã cược không tồn tại",
      };
    }

    // Cập nhật trạng thái mã cược
    const status = verificationResult.totalWinAmount > 0 ? "won" : "lost";

    await db.betCodes.update(betCodeId, {
      status,
      verificationResult,
      verifiedAt: new Date(),
    });

    return {
      success: true,
      betCodeId,
      status,
      winAmount: verificationResult.totalWinAmount,
    };
  } catch (error) {
    console.error("Lỗi khi đánh dấu mã cược đã đối soát:", error);
    return {
      success: false,
      error: `Lỗi khi đánh dấu mã cược đã đối soát: ${error.message}`,
    };
  }
}

/**
 * Phân tích kết quả đối soát theo ngày
 * @param {Date} date - Ngày cần phân tích
 * @returns {object} Kết quả phân tích
 */
export async function analyzeVerificationByDate(date) {
  if (!date) {
    date = new Date();
  }

  // Chuyển đổi thành đối tượng Date
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Ngày tiếp theo
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  try {
    // Lấy tất cả kết quả đối soát trong ngày
    const verificationResults = await db.verificationResults
      .where("verifiedAt")
      .between(targetDate, nextDay)
      .toArray();

    // Nếu không có kết quả đối soát
    if (verificationResults.length === 0) {
      return {
        success: true,
        date: targetDate,
        betCodeCount: 0,
        totalWinAmount: 0,
        winCount: 0,
        lostCount: 0,
      };
    }

    // Thu thập tất cả ID mã cược đã đối soát
    const allBetCodeIds = [];
    verificationResults.forEach((result) => {
      if (result.betCodeIds && Array.isArray(result.betCodeIds)) {
        allBetCodeIds.push(...result.betCodeIds);
      }
    });

    // Loại bỏ các ID trùng lặp
    const uniqueBetCodeIds = [...new Set(allBetCodeIds)];

    // Lấy thông tin chi tiết của các mã cược
    const betCodes = await db.betCodes
      .where("id")
      .anyOf(uniqueBetCodeIds)
      .toArray();

    // Tổng hợp kết quả
    const winCount = betCodes.filter((bc) => bc.status === "won").length;
    const lostCount = betCodes.filter((bc) => bc.status === "lost").length;

    const totalWinAmount = betCodes.reduce((sum, bc) => {
      if (
        bc.status === "won" &&
        bc.verificationResult &&
        bc.verificationResult.totalWinAmount
      ) {
        return sum + bc.verificationResult.totalWinAmount;
      }
      return sum;
    }, 0);

    return {
      success: true,
      date: targetDate,
      betCodeCount: uniqueBetCodeIds.length,
      totalWinAmount,
      winCount,
      lostCount,
      verificationCount: verificationResults.length,
    };
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả đối soát theo ngày:", error);
    return {
      success: false,
      error: `Lỗi khi phân tích kết quả đối soát theo ngày: ${error.message}`,
    };
  }
}
