import { supabase } from '@/lib/supabase/client'
import { Instructor, InstructorStats } from '@/types/instructor'
import { ApiResponse } from '@/types/api'

export async function getInstructors(): Promise<ApiResponse<Instructor[]>> {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data || [],
      message: '講師一覧を取得しました'
    }
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '講師一覧の取得に失敗しました'
    }
  }
}

export async function getInstructorById(id: string): Promise<ApiResponse<Instructor | null>> {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '講師情報を取得しました'
    }
  } catch (error) {
    console.error('Error fetching instructor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '講師情報の取得に失敗しました'
    }
  }
}

export async function getInstructorStats(instructorId: string): Promise<ApiResponse<InstructorStats>> {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('scores, created_at')
      .eq('instructor_id', instructorId)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          instructorId,
          totalEvaluations: 0,
          averageScores: { pitch: 0, rhythm: 0, expression: 0, technique: 0 }
        },
        message: '講師統計を取得しました'
      }
    }

    const totalEvaluations = data.length
    const averageScores = data.reduce(
      (acc, evaluation) => {
        const scores = evaluation.scores as any
        return {
          pitch: acc.pitch + scores.pitch,
          rhythm: acc.rhythm + scores.rhythm,
          expression: acc.expression + scores.expression,
          technique: acc.technique + scores.technique,
        }
      },
      { pitch: 0, rhythm: 0, expression: 0, technique: 0 }
    )

    Object.keys(averageScores).forEach((key) => {
      averageScores[key as keyof typeof averageScores] = 
        averageScores[key as keyof typeof averageScores] / totalEvaluations
    })

    const lastEvaluationDate = data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]?.created_at

    const stats: InstructorStats = {
      instructorId,
      totalEvaluations,
      averageScores,
      lastEvaluationDate
    }

    return {
      success: true,
      data: stats,
      message: '講師統計を取得しました'
    }
  } catch (error) {
    console.error('Error fetching instructor stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '講師統計の取得に失敗しました'
    }
  }
}

export async function createInstructor(instructor: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Instructor>> {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .insert({
        name: instructor.name,
        email: instructor.email,
        is_active: instructor.isActive
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '講師を作成しました'
    }
  } catch (error) {
    console.error('Error creating instructor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '講師の作成に失敗しました'
    }
  }
}

export async function updateInstructor(
  id: string,
  updates: Partial<Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Instructor>> {
  try {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.email) updateData.email = updates.email
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('instructors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '講師情報を更新しました'
    }
  } catch (error) {
    console.error('Error updating instructor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '講師情報の更新に失敗しました'
    }
  }
}