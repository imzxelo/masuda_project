export interface Instructor {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InstructorSession {
  instructorId: string
  name: string
  loginAt: string
  isActive: boolean
}

export interface InstructorStats {
  instructorId: string
  totalEvaluations: number
  averageScores: {
    pitch: number
    rhythm: number
    expression: number
    technique: number
  }
  lastEvaluationDate?: string
}