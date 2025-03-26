// src/database/migrations.js
import { db } from './db'

export async function setupMigrations() {
  // Đăng ký các migrations
  db.version(1).stores({
    users: '++id, username, role, isActive',
    stations: '++id, name, region, aliases, isActive, [region+name]',
    betTypes: '++id, name, aliases, isActive',
    numberCombinations: '++id, name, aliases, isActive',
    betCodes:
      '++id, userId, content, parsedContent, stakeAmount, potentialWinning, createdAt, updatedAt, status, errors, [userId+createdAt]',
    lotteryResults:
      '++id, region, station, date, results, [region+station+date]',
    verificationResults:
      '++id, betCodeIds, resultsId, verifiedAt, [verifiedAt]',
    settings: 'key, value',
    userPayoutRates: '++id, userId, betTypeId, rate, [userId+betTypeId]',
    userStationMultipliers:
      '++id, userId, stationId, multiplier, [userId+stationId]',
  })

  // Đây là các migration trong tương lai
  /*
  db.version(2).stores({
    // Ví dụ về việc thêm một bảng mới trong tương lai
    betStatistics: '++id, betCodeId, resultId, winAmount, createdAt',
  }).upgrade(tx => {
    // Lôgic nâng cấp dữ liệu từ version 1 lên version 2
  })
  */

  // Thông báo migrations đã sẵn sàng
  console.log('Database migrations setup complete')
}

// Khởi chạy migrations khi cần thiết
export async function runMigrations() {
  try {
    await setupMigrations()
    await db.open()
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    // Xử lý các lỗi migration tại đây
  }
}
