export interface Student {
  id: string
  name: string
  email?: string
  grade?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StudentStats {
  totalEvaluations: number
  averageScores: {
    pitch: number
    rhythm: number
    expression: number
    technique: number
  }
  lastEvaluationDate?: string
  improvementTrend?: 'improving' | 'declining' | 'stable'
}

export interface StudentWithStats extends Student {
  stats?: StudentStats
}