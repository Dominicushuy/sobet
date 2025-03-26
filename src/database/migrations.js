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

  // Thêm migration phiên bản 2 để thêm betMultiplier cho user
  db.version(2)
    .stores({
      // Schema không thay đổi
    })
    .upgrade((tx) => {
      // Thêm betMultiplier cho các user hiện có
      return tx.users.toCollection().modify((user) => {
        if (!user.betMultiplier) {
          user.betMultiplier = 0.8 // Đặt giá trị mặc định
        }
      })
    })
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
