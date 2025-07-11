import { supabase } from '@/lib/supabase/client'
import { Student, StudentWithStats, StudentStats } from '@/types/student'
import { ApiResponse } from '@/types/api'

export async function getStudents(): Promise<ApiResponse<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      grade: item.grade,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.created_at
    }))

    return {
      success: true,
      data: mappedData,
      message: '生徒一覧を取得しました'
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒一覧の取得に失敗しました'
    }
  }
}

export async function getStudentById(id: string): Promise<ApiResponse<Student | null>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '生徒情報を取得しました'
    }
  } catch (error) {
    console.error('Error fetching student:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒情報の取得に失敗しました'
    }
  }
}

export async function getStudentWithStats(id: string): Promise<ApiResponse<StudentWithStats | null>> {
  try {
    // Get student basic info
    const studentResponse = await getStudentById(id)
    if (!studentResponse.success || !studentResponse.data) {
      return studentResponse as ApiResponse<StudentWithStats | null>
    }

    // Get evaluation stats
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations_v2')
      .select('pitch, rhythm, expression, technique, created_at')
      .eq('student_id', id)

    if (evalError) {
      throw evalError
    }

    const student = studentResponse.data
    let stats: StudentStats | undefined = undefined

    if (evaluations && evaluations.length > 0) {
      const totalEvaluations = evaluations.length
      const averageScores = evaluations.reduce(
        (acc, evaluation) => {
          return {
            pitch: acc.pitch + evaluation.pitch,
            rhythm: acc.rhythm + evaluation.rhythm,
            expression: acc.expression + evaluation.expression,
            technique: acc.technique + evaluation.technique,
          }
        },
        { pitch: 0, rhythm: 0, expression: 0, technique: 0 }
      )

      Object.keys(averageScores).forEach((key) => {
        averageScores[key as keyof typeof averageScores] = 
          averageScores[key as keyof typeof averageScores] / totalEvaluations
      })

      const lastEvaluationDate = evaluations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at

      stats = {
        totalEvaluations,
        averageScores,
        lastEvaluationDate
      }
    }

    const studentWithStats: StudentWithStats = {
      ...student,
      stats
    }

    return {
      success: true,
      data: studentWithStats,
      message: '生徒情報と統計を取得しました'
    }
  } catch (error) {
    console.error('Error fetching student with stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒情報の取得に失敗しました'
    }
  }
}

export async function createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name: student.name,
        email: student.email,
        grade: student.grade,
        is_active: student.isActive
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = {
      id: data.id,
      name: data.name,
      email: data.email,
      grade: data.grade,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.created_at
    }

    return {
      success: true,
      data: mappedData,
      message: '生徒を作成しました'
    }
  } catch (error) {
    console.error('Error creating student:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒の作成に失敗しました'
    }
  }
}

export async function updateStudent(
  id: string,
  updates: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Student>> {
  try {
    const updateData: any = {}
    
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.grade !== undefined) updateData.grade = updates.grade
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = {
      id: data.id,
      name: data.name,
      email: data.email,
      grade: data.grade,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return {
      success: true,
      data: mappedData,
      message: '生徒情報を更新しました'
    }
  } catch (error) {
    console.error('Error updating student:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒情報の更新に失敗しました'
    }
  }
}

export async function searchStudents(query: string): Promise<ApiResponse<Student[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name')

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      grade: item.grade,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.created_at
    }))

    return {
      success: true,
      data: mappedData,
      message: '生徒検索結果を取得しました'
    }
  } catch (error) {
    console.error('Error searching students:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒検索に失敗しました'
    }
  }
}