// src/database/schema.js
export const schema = {
  users: '++id, username, role, isActive',
  stations: '++id, name, region, aliases, isActive, [region+name]',
  betTypes: '++id, name, aliases, isActive',
  numberCombinations: '++id, name, aliases, isActive',
  betCodes: '++id, userId, content, createdAt, status, [userId+createdAt]',
  lotteryResults: '++id, region, station, date, results, [region+station+date]',
  verificationResults: '++id, betCodeIds, resultsId, verifiedAt, [verifiedAt]',
  settings: 'key, value',
  userPayoutRates: '++id, userId, betTypeId, rate, [userId+betTypeId]',
  userStationMultipliers:
    '++id, userId, stationId, multiplier, [userId+stationId]',
}
