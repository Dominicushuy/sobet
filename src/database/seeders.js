// src/database/seeders.js
import { db } from './db'
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '../config/defaults'

// Hàm hash đơn giản (trong thực tế nên sử dụng bcrypt hoặc argon2)
function simpleHash(password) {
  return `hashed_${password}_${Date.now()}` // Đây chỉ là mô phỏng, không sử dụng trong thực tế
}

export async function seedDatabase() {
  // Kiểm tra xem database đã được seed chưa
  const isSeeded = await db.settings.get('isSeeded')
  if (isSeeded && isSeeded.value) {
    console.log('Database already seeded')
    return
  }

  try {
    console.log('Seeding database...')

    // Tạo admin mặc định
    const adminId = await db.users.add({
      username: 'admin',
      password: simpleHash('admin123'), // Hash password
      role: 'admin',
      isActive: true,
      priceMultiplier: 0.76, // Giá nhân mặc định
      paybackRate: 0.95, // Hồi khi thu mặc định
      createdAt: new Date(),
    })

    // Seed một user thử nghiệm
    const testUserId = await db.users.add({
      username: 'testuser',
      password: simpleHash('test123'), // Hash password
      role: 'user',
      isActive: true,
      priceMultiplier: 0.76, // Giá nhân mặc định
      paybackRate: 0.95, // Hồi khi thu mặc định
      createdAt: new Date(),
    })

    // Seed stations
    const stationIds = await db.stations.bulkAdd(defaultStations, {
      allKeys: true,
    })
    console.log(`Added ${defaultStations.length} lottery stations`)

    // Seed bet types
    const betTypeIds = await db.betTypes.bulkAdd(defaultBetTypes, {
      allKeys: true,
    })
    console.log(`Added ${defaultBetTypes.length} bet types`)

    // Seed number combinations
    await db.numberCombinations.bulkAdd(defaultNumberCombinations)
    console.log(`Added ${defaultNumberCombinations.length} number combinations`)

    // Tạo tỉ lệ trúng thưởng mặc định cho test user
    const userPayoutRates = []
    for (let i = 0; i < betTypeIds.length; i++) {
      // Sử dụng payoutRate từ defaultBetTypes nếu là số đơn giản
      let defaultRate = defaultBetTypes[i].payoutRate
      // Nếu payoutRate là object phức tạp, sử dụng giá trị mặc định cho 2 chữ số
      if (typeof defaultRate === 'object' && defaultRate['2 digits']) {
        defaultRate = defaultRate['2 digits']
      }

      userPayoutRates.push({
        userId: testUserId,
        betTypeId: betTypeIds[i],
        rate: defaultRate,
        createdAt: new Date(),
      })
    }

    await db.userPayoutRates.bulkAdd(userPayoutRates)
    console.log(`Added ${userPayoutRates.length} user payout rates`)

    // Tạo tỉ lệ nhân mặc định cho các đài cho test user
    const userStationMultipliers = []
    for (let i = 0; i < stationIds.length; i++) {
      userStationMultipliers.push({
        userId: testUserId,
        stationId: stationIds[i],
        multiplier: 1, // Tỉ lệ nhân mặc định là 1
        createdAt: new Date(),
      })
    }

    await db.userStationMultipliers.bulkAdd(userStationMultipliers)
    console.log(
      `Added ${userStationMultipliers.length} user station multipliers`
    )

    // Lưu trạng thái đã seed
    await db.settings.put({ key: 'isSeeded', value: true })

    // Lưu cài đặt mặc định
    await db.settings.put({ key: 'maxUsers', value: 10 })
    await db.settings.put({ key: 'dataRetentionDays', value: 7 })
    await db.settings.put({ key: 'defaultPriceMultiplier', value: 0.76 })
    await db.settings.put({ key: 'defaultPaybackRate', value: 0.95 })

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}
