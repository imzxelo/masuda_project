import { useState, useCallback, useEffect } from 'react'
import { useInstructorStore, useUIStore } from '@/stores'
import { getInstructors, getInstructorStats } from '@/lib/api'
import { Instructor, InstructorSession, InstructorStats } from '@/types/instructor'

export function useInstructor() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<InstructorStats | null>(null)
  
  const { 
    session, 
    isAuthenticated, 
    setSession, 
    clearSession, 
    updateLoginTime 
  } = useInstructorStore()
  
  const { addToast, setError } = useUIStore()

  const loadInstructors = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await getInstructors()
      
      if (result.success) {
        setInstructors(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '講師一覧の取得に失敗しました'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [setError, addToast])

  const authenticate = useCallback(async (instructor: Instructor): Promise<boolean> => {
    try {
      // まず古いセッションをクリア
      clearSession()
      
      const session: InstructorSession = {
        instructorId: instructor.id,
        name: instructor.name,
        loginAt: new Date().toISOString(),
        isActive: true
      }

      console.log('Creating new session:', session)
      setSession(session)
      
      // セッション設定後の確認
      setTimeout(() => {
        console.log('Session after setting:', session)
      }, 100)
      
      addToast({
        type: 'success',
        message: `${instructor.name}先生でログインしました`
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '認証に失敗しました'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return false
    }
  }, [setSession, clearSession, addToast, setError])

  const logout = useCallback(() => {
    clearSession()
    setStats(null)
    addToast({
      type: 'info',
      message: 'ログアウトしました'
    })
  }, [clearSession, addToast])

  const loadInstructorStats = useCallback(async (instructorId: string) => {
    try {
      setIsLoading(true)
      const result = await getInstructorStats(instructorId)
      
      if (result.success) {
        setStats(result.data || null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '講師統計の取得に失敗しました'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [setError, addToast])

  const refreshSession = useCallback(() => {
    if (session) {
      updateLoginTime()
    }
  }, [session, updateLoginTime])

  // Auto-load instructors on mount
  useEffect(() => {
    loadInstructors()
  }, [loadInstructors])

  // Auto-load stats when authenticated
  useEffect(() => {
    if (isAuthenticated && session && session.instructorId) {
      console.log('Loading instructor stats for:', session.instructorId)
      loadInstructorStats(session.instructorId)
    } else {
      console.log('Session state:', { isAuthenticated, session })
    }
  }, [isAuthenticated, session, loadInstructorStats])

  return {
    instructors,
    session,
    isAuthenticated,
    isLoading,
    stats,
    authenticate,
    logout,
    loadInstructors,
    loadInstructorStats,
    refreshSession,
  }
}