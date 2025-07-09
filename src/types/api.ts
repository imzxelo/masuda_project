export interface ApiResponse<T> {
  data?: T
  success: boolean
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface N8nWebhookPayload {
  type: string
  timestamp: string
  data: {
    evaluationId: string
    studentId: string
    instructorId: string
    scores: {
      pitch: number
      rhythm: number
      expression: number
      technique: number
    }
    comments: {
      pitch: string
      rhythm: string
      expression: string
      technique: string
    }
    generalComments?: string
    createdAt: string
    metadata?: {
      totalScore: number
      maxScore: number
      retryCount?: number
    }
  }
}

export interface N8nWebhookResponse {
  success: boolean
  message?: string
  id?: string
}