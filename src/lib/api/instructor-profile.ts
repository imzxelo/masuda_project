import { supabaseAuth } from '@/lib/supabase/auth-client'
import { ApiResponse } from '@/types/api'

export interface InstructorProfile {
  id: string
  name: string
  email: string
  auth_user_id: string
  is_active: boolean
  created_at: string
}

export interface CreateInstructorProfileInput {
  name: string
  email: string
  auth_user_id: string
}

/**
 * 新規ユーザー登録時に講師プロファイルを作成
 */
export async function createInstructorProfile(
  input: CreateInstructorProfileInput
): Promise<ApiResponse<InstructorProfile>> {
  try {
    const { data, error } = await supabaseAuth
      .from('instructors')
      .insert([
        {
          name: input.name,
          email: input.email,
          auth_user_id: input.auth_user_id,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('講師プロファイル作成エラー:', error)
      return {
        success: false,
        error: `講師プロファイルの作成に失敗しました: ${error.message}`
      }
    }

    return {
      success: true,
      data: data as InstructorProfile
    }
  } catch (error) {
    console.error('講師プロファイル作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '予期しないエラーが発生しました'
    }
  }
}

/**
 * auth_user_idから講師プロファイルを取得
 */
export async function getInstructorByAuthUserId(
  authUserId: string
): Promise<ApiResponse<InstructorProfile>> {
  try {
    const { data, error } = await supabaseAuth
      .from('instructors')
      .select('*')
      .eq('auth_user_id', authUserId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '講師プロファイルが見つかりません'
        }
      }
      
      console.error('講師プロファイル取得エラー:', error)
      return {
        success: false,
        error: `講師プロファイルの取得に失敗しました: ${error.message}`
      }
    }

    return {
      success: true,
      data: data as InstructorProfile
    }
  } catch (error) {
    console.error('講師プロファイル取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '予期しないエラーが発生しました'
    }
  }
}

/**
 * 講師プロファイルを更新
 */
export async function updateInstructorProfile(
  authUserId: string,
  updates: Partial<Pick<InstructorProfile, 'name' | 'email'>>
): Promise<ApiResponse<InstructorProfile>> {
  try {
    const { data, error } = await supabaseAuth
      .from('instructors')
      .update(updates)
      .eq('auth_user_id', authUserId)
      .select()
      .single()

    if (error) {
      console.error('講師プロファイル更新エラー:', error)
      return {
        success: false,
        error: `講師プロファイルの更新に失敗しました: ${error.message}`
      }
    }

    return {
      success: true,
      data: data as InstructorProfile
    }
  } catch (error) {
    console.error('講師プロファイル更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '予期しないエラーが発生しました'
    }
  }
}