export interface VideoRecord {
  id: string
  studentId: string
  studentName?: string // 新しいstudent_nameフィールド
  songId?: string // Optional in DB schema
  songTitle: string
  recordedAt: string // ISO date string (YYYY-MM-DD)
  createdAt: string
  updatedAt: string
}

export interface VideoRecordInput {
  studentId: string
  songId?: string // Optional in DB schema
  songTitle: string
  recordedAt: string // ISO date string (YYYY-MM-DD)
}

export interface VideoRecordWithStats extends VideoRecord {
  stats?: {
    totalEvaluations: number
    averageScore: number
    lastEvaluationDate?: string
  }
}

export interface VideoRecordListItem {
  id: string
  songId?: string
  songTitle: string
  recordedAt: string
  evaluationCount: number
  averageScore?: number
}