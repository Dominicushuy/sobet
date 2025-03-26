import { db } from './db'
import {
  defaultStations,
  defaultBetTypes,
  defaultNumberCombinations,
} from '../config/defaults'

export async function seedDatabase() {
  // Kiểm tra xem database đã được seed chưa
  const isSeeded = await db.settings.get('isSeeded')
  if (isSeeded && isSeeded.value) {
    console.log('Database already seeded')
    return
  }

  try {
    // Tạo admin mặc định
    await db.users.add({
      username: 'admin',
      password: 'admin123', // Trong thực tế nên hash password
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
    })

    // Seed stations
    await db.stations.bulkAdd(defaultStations)

    // Seed bet types
    await db.betTypes.bulkAdd(defaultBetTypes)

    // Seed number combinations
    await db.numberCombinations.bulkAdd(defaultNumberCombinations)

    // Lưu trạng thái đã seed
    await db.settings.put({ key: 'isSeeded', value: true })

    // Lưu cài đặt mặc định
    await db.settings.put({ key: 'maxUsers', value: 10 })

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
