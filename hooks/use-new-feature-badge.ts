import { useState, useEffect, useCallback } from "react"

const STORAGE_PREFIX = "new-feature-dismissed-"

export function useNewFeatureBadge(key: string, expirationDate: Date) {
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_PREFIX + key) === "true"
    const expired = Date.now() >= expirationDate.getTime()
    setShowBadge(!dismissed && !expired)
  }, [key, expirationDate])

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_PREFIX + key, "true")
    setShowBadge(false)
  }, [key])

  return { showBadge, dismiss }
}
