// Version configuration
// Update this version when making changes or bug fixes
export const APP_VERSION = '0.1.0'
export const LAST_UPDATED = '2025-12-23'

// For development: Show build timestamp
export const BUILD_TIMESTAMP = __APP_BUILD_TIME__ || new Date().toISOString()

// Check for app updates periodically
export const CHECK_UPDATE_INTERVAL = 60000 // 60 seconds in development, adjust for production
