// src/database/db.js
import Dexie from 'dexie'
import { schema } from './schema'

class LotteryDatabase extends Dexie {
  constructor() {
    super('LotteryVerificationApp')
    this.version(1).stores(schema)

    // Liên kết bảng đến thuộc tính của class
    this.users = this.table('users')
    this.stations = this.table('stations')
    this.betTypes = this.table('betTypes')
    this.numberCombinations = this.table('numberCombinations')
    this.betCodes = this.table('betCodes')
    this.lotteryResults = this.table('lotteryResults')
    this.verificationResults = this.table('verificationResults')
    this.settings = this.table('settings')
    this.userPayoutRates = this.table('userPayoutRates')
    this.userStationMultipliers = this.table('userStationMultipliers')
  }
}

export const db = new LotteryDatabase()

// Hook phổ biến để kiểm tra database đã được khởi tạo chưa
export function useLiveQuery(querier, deps = []) {
  return Dexie.liveQuery(querier)
}
