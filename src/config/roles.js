// src/config/roles.js
import { USER_ROLES } from './constants'

export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  STATION_CREATE: 'station:create',
  STATION_READ: 'station:read',
  STATION_UPDATE: 'station:update',
  STATION_DELETE: 'station:delete',

  BET_TYPE_CREATE: 'betType:create',
  BET_TYPE_READ: 'betType:read',
  BET_TYPE_UPDATE: 'betType:update',
  BET_TYPE_DELETE: 'betType:delete',

  BET_CODE_CREATE: 'betCode:create',
  BET_CODE_READ: 'betCode:read',
  BET_CODE_UPDATE: 'betCode:update',
  BET_CODE_DELETE: 'betCode:delete',

  RESULT_CREATE: 'result:create',
  RESULT_READ: 'result:read',
  RESULT_UPDATE: 'result:update',
  RESULT_DELETE: 'result:delete',

  VERIFICATION_CREATE: 'verification:create',
  VERIFICATION_READ: 'verification:read',

  RATE_CREATE: 'rate:create',
  RATE_READ: 'rate:read',
  RATE_UPDATE: 'rate:update',

  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
}

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.USER]: [
    PERMISSIONS.BET_CODE_CREATE,
    PERMISSIONS.BET_CODE_READ,
    PERMISSIONS.BET_CODE_UPDATE,
    PERMISSIONS.BET_CODE_DELETE,
    PERMISSIONS.RESULT_READ,
    PERMISSIONS.VERIFICATION_READ,
    PERMISSIONS.STATION_READ,
    PERMISSIONS.BET_TYPE_READ,
  ],
}

export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}
