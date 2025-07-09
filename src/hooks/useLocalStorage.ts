import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue] as const
}

// Specialized hook for commonly used localStorage patterns
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue)

  return {
    value,
    setValue,
    removeValue,
    reset: () => setValue(initialValue),
    clear: removeValue,
  }
}

// Hook for storing user preferences
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    language: 'ja',
    autoSave: true,
    notifications: true,
  })

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setPreferences])

  return {
    preferences,
    updatePreference,
    resetPreferences: removePreferences,
  }
}

// Hook for storing form drafts
export function useFormDraft<T extends Record<string, any>>(formName: string, initialData: T) {
  const [draft, setDraft, removeDraft] = useLocalStorage(`form-draft-${formName}`, initialData)

  const saveDraft = useCallback((data: Partial<T>) => {
    setDraft(prev => ({
      ...prev,
      ...data,
      _lastSaved: new Date().toISOString()
    }))
  }, [setDraft])

  const clearDraft = useCallback(() => {
    removeDraft()
  }, [removeDraft])

  const hasDraft = Object.keys(draft).length > 0 && '_lastSaved' in draft

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
    lastSaved: hasDraft ? draft._lastSaved : null,
  }
}