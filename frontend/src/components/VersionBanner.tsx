import { useEffect, useState } from 'react'
import { APP_VERSION, BUILD_TIMESTAMP } from '../config/version'

export default function VersionBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION)

  useEffect(() => {
    // Check for updates every 60 seconds
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/MVP-LogistiQ/version.json', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.version !== currentVersion) {
            setUpdateAvailable(true)
            setCurrentVersion(data.version)
          }
        }
      } catch (error) {
        // Silently fail if version check fails
      }
    }

    const interval = setInterval(checkForUpdates, 60000)
    return () => clearInterval(interval)
  }, [currentVersion])

  const handleUpdate = () => {
    // Clear service worker cache and reload
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName)
        })
      })
    }
    window.location.reload()
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            LogistiQ v{currentVersion}
          </span>
          {updateAvailable && (
            <button
              onClick={handleUpdate}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded font-semibold transition"
            >
              📦 Update Available - Click to Refresh
            </button>
          )}
        </div>
        <span className="text-xs opacity-75">
          Built: {new Date(BUILD_TIMESTAMP).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
