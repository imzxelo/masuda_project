export interface EvaluationScore {
  pitch: number      // 音程 (0-100)
  rhythm: number     // リズム (0-100)
  expression: number // 表現 (0-100)
  technique: number  // テクニック (0-100)
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