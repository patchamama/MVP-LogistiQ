// Version configuration
// This is automatically populated from package.json during build
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.2.0'
export const LAST_UPDATED = '2025-12-23'

// For development: Show build timestamp
export const BUILD_TIMESTAMP = __APP_BUILD_TIME__ || new Date().toISOString()

// Check for app updates periodically
export const CHECK_UPDATE_INTERVAL = 60000 // 60 seconds in development, adjust for production
