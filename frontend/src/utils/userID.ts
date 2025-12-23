/**
 * User ID Management
 * Generates and persists a unique user ID in localStorage
 * Used to associate API keys and user preferences
 */

export const getUserID = (): string => {
  const storageKey = 'logistiq_user_id'
  let userId = localStorage.getItem(storageKey)

  if (!userId) {
    // Generate a unique user ID if one doesn't exist
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(storageKey, userId)
  }

  return userId
}

export const clearUserID = (): void => {
  localStorage.removeItem('logistiq_user_id')
}
