export interface EvaluationScore {
  pitch: number      // 音程 (0-10)
  rhythm: number     // リズム (0-10)
  expression: number // 表現 (0-10)
  technique: number  // テクニック (0-10)
}

export interface Evaluation {
  id: string
  studentId: string
  instructorId: string
  scores: EvaluationScore
  comments?: string
  createdAt: string
  updatedAt: string
  sentToN8n: boolean
  sentToN8nAt?: string
}

export interface EvaluationInput {
  studentId: string
  instructorId: string
  scores: EvaluationScore
  comments?: string
}

export interface EvaluationSummary {
  totalEvaluations: number
  averageScores: EvaluationScore
  lastEvaluationDate?: string
}

export interface EvaluationFormData {
  studentId: string
  scores: EvaluationScore
  comments?: string
}

export interface EvaluationFilters {
  studentId?: string
  instructorId?: string
  dateFrom?: string
  dateTo?: string
}

export type EvaluationStatus = 'draft' | 'completed' | 'sent' | 'error'