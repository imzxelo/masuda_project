'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabaseAuth } from '@/lib/supabase/auth-client'
import { createInstructorProfile, getInstructorByAuthUserId, InstructorProfile } from '@/lib/api/instructor-profile'

interface SupabaseAuthContextType {
  user: User | null
  session: Session | null
  instructorProfile: InstructorProfile | null
  isLoading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // セッションストレージからプロファイルを復元
  const restoreProfileFromStorage = (userId: string): InstructorProfile | null => {
    try {
      const stored = sessionStorage.getItem(`instructor_profile_${userId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('プロファイル復元エラー:', error)
    }
    return null
  }

  // セッションストレージにプロファイルを保存
  const saveProfileToStorage = (profile: InstructorProfile) => {
    try {
      sessionStorage.setItem(`instructor_profile_${profile.auth_user_id}`, JSON.stringify(profile))
    } catch (error) {
      console.error('プロファイル保存エラー:', error)
    }
  }

  // 講師プロファイルを取得または作成
  const handleUserProfile = async (user: User) => {
    if (!user) {
      setInstructorProfile(null)
      return
    }

    // まずセッションストレージから復元を試行
    const cachedProfile = restoreProfileFromStorage(user.id)
    if (cachedProfile && cachedProfile.id !== 'temp' && cachedProfile.id !== 'error') {
      setInstructorProfile(cachedProfile)
      return
    }

    try {
      // 既存の講師プロファイルを取得
      const existingProfile = await getInstructorByAuthUserId(user.id)
      
      if (existingProfile.success && existingProfile.data) {
        setInstructorProfile(existingProfile.data)
        saveProfileToStorage(existingProfile.data)
      } else {
        // プロファイルが存在しない場合は自動で新規作成
        const email = user.email || ''
        const userName = user.user_metadata?.name || user.user_metadata?.full_name || ''
        const name = userName.trim() || email.split('@')[0]
        
        const newProfile = await createInstructorProfile({
          name,
          email,
          auth_user_id: user.id
        })

        if (newProfile.success && newProfile.data) {
          setInstructorProfile(newProfile.data)
          saveProfileToStorage(newProfile.data)
        } else {
          console.error('講師プロファイル作成失敗:', newProfile.error)
          // エラーの場合でも一時的なプロファイルを作成
          const tempProfile = {
            id: 'temp',
            name,
            email,
            auth_user_id: user.id,
            is_active: true,
            created_at: new Date().toISOString()
          }
          setInstructorProfile(tempProfile)
        }
      }
    } catch (error) {
      console.error('講師プロファイル処理エラー:', error)
      // エラーの場合も最低限のプロファイルは設定
      const email = user.email || ''
      const name = email.split('@')[0]
      setInstructorProfile({
        id: 'error',
        name,
        email,
        auth_user_id: user.id,
        is_active: true,
        created_at: new Date().toISOString()
      })
    }
  }

  useEffect(() => {
    let mounted = true

    // 初期セッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabaseAuth.auth.getSession()
        if (!mounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // セッションストレージからの復元を先に試行
          const cachedProfile = restoreProfileFromStorage(session.user.id)
          if (cachedProfile && cachedProfile.id !== 'temp' && cachedProfile.id !== 'error') {
            setInstructorProfile(cachedProfile)
            setIsLoading(false)
            // バックグラウンドで最新データを取得して更新
            handleUserProfile(session.user)
          } else {
            await handleUserProfile(session.user)
          }
        }
      } catch (error) {
        console.error('初期セッション取得エラー:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        try {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // ログイン時はセッションストレージから復元を試行
            if (event === 'SIGNED_IN') {
              const cachedProfile = restoreProfileFromStorage(session.user.id)
              if (cachedProfile && cachedProfile.id !== 'temp' && cachedProfile.id !== 'error') {
                setInstructorProfile(cachedProfile)
                // バックグラウンドで最新データを取得
                handleUserProfile(session.user)
                return
              }
            }
            await handleUserProfile(session.user)
          } else {
            setInstructorProfile(null)
            // ログアウト時はセッションストレージをクリア
            try {
              const keys = Object.keys(sessionStorage)
              keys.forEach(key => {
                if (key.startsWith('instructor_profile_')) {
                  sessionStorage.removeItem(key)
                }
              })
            } catch (error) {
              console.error('セッションストレージクリアエラー:', error)
            }
          }
        } catch (error) {
          console.error('認証状態変更エラー:', error)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    // セッションストレージをクリア
    try {
      if (user?.id) {
        sessionStorage.removeItem(`instructor_profile_${user.id}`)
      }
    } catch (error) {
      console.error('セッションストレージクリアエラー:', error)
    }
    
    const { error } = await supabaseAuth.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    instructorProfile,
    isLoading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}