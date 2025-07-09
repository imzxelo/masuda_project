import { useState, useCallback } from 'react'
import { useUIStore } from '@/stores'

interface UseApiOptions {
  showToast?: boolean
  showLoading?: boolean
  loadingMessage?: string
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addToast, setLoading: setGlobalLoading } = useUIStore()
  
  const {
    showToast = true,
    showLoading = false,
    loadingMessage = '処理中...'
  } = options

  const execute = useCallback(async (...args: any[]) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (showLoading) {
        setGlobalLoading(true, loadingMessage)
      }

      const result = await apiFunction(...args)
      
      if (result.success) {
        setData(result.data)
        
        if (showToast && result.message) {
          addToast({
            type: 'success',
            message: result.message
          })
        }
        
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API呼び出しでエラーが発生しました'
      setError(errorMessage)
      
      if (showToast) {
        addToast({
          type: 'error',
          message: errorMessage
        })
      }
      
      throw error
    } finally {
      setIsLoading(false)
      
      if (showLoading) {
        setGlobalLoading(false)
      }
    }
  }, [apiFunction, showToast, showLoading, loadingMessage, addToast, setGlobalLoading])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  }
}