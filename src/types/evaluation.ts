export interface EvaluationScore {
  pitch: number      // 音程 (0-10)
  rhythm: number     // リズム (0-10)
  expression: number // 表現 (0-10)
  technique: number  // テクニック (0-10)
}

export interface EvaluationComments {
  pitch: string      // 音程のコメント
  rhythm: string     // リズムのコメント
  expression: string // 表現のコメント
  technique: string  // テクニックのコメント
}

export interface Evaluation {
  id: string
  studentId: string
  instructorId: string
  videoRecordId: string
  scores: EvaluationScore
  comments: EvaluationComments
  generalComments?: string
  createdAt: string
  updatedAt: string
  sentToN8n: boolean
  sentToN8nAt?: string
}

export interface EvaluationInput {
  studentId: string
  instructorId: string
  videoRecordId: string
  scores: EvaluationScore
  comments: EvaluationComments
  generalComments?: string
}

export interface EvaluationSummary {
  totalEvaluations: number
  averageScores: EvaluationScore
  lastEvaluationDate?: string
}

export interface EvaluationFormData {
  studentId: string
  videoRecordId: string
  scores: EvaluationScore
  comments: EvaluationComments
  generalComments?: string
}

export interface EvaluationFilters {
  studentId?: string
  instructorId?: string
  videoRecordId?: string
  dateFrom?: string
  dateTo?: string
}

export type EvaluationStatus = 'draft' | 'completed' | 'sent' | 'error'