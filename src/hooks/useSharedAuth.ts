import { useState, useEffect } from 'react'

export function useSharedAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // クライアントサイドでのみ認証状態をチェック
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = sessionStorage.getItem('shared_password_authenticated')
        setIsAuthenticated(authStatus === 'true')
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const authenticate = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shared_password_authenticated', 'true')
      setIsAuthenticated(true)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('shared_password_authenticated')
      setIsAuthenticated(false)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    authenticate,
    logout
  }
}