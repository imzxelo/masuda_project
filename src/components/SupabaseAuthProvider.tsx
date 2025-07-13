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
  signUp: (email: string, password: string) => Promise<{ error: any }>
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

  // 講師プロファイルを取得または作成
  const handleUserProfile = async (user: User) => {
    if (!user) {
      setInstructorProfile(null)
      return
    }

    try {
      // 既存の講師プロファイルを取得
      const existingProfile = await getInstructorByAuthUserId(user.id)
      
      if (existingProfile.success) {
        setInstructorProfile(existingProfile.data!)
      } else {
        // プロファイルが存在しない場合は新規作成
        const email = user.email || ''
        const name = user.user_metadata?.name || email.split('@')[0]
        
        const newProfile = await createInstructorProfile({
          name,
          email,
          auth_user_id: user.id
        })

        if (newProfile.success) {
          setInstructorProfile(newProfile.data!)
        } else {
          console.error('講師プロファイル作成失敗:', newProfile.error)
        }
      }
    } catch (error) {
      console.error('講師プロファイル処理エラー:', error)
    }
  }

  useEffect(() => {
    // 初期セッションを取得
    const getInitialSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await handleUserProfile(session.user)
      }
      
      setIsLoading(false)
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await handleUserProfile(session.user)
        } else {
          setInstructorProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabaseAuth.auth.signUp({
      email,
      password,
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