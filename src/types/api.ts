export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
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
  evaluation: {
    id: string
    studentName: string
    instructorName: string
    scores: {
      pitch: number
      rhythm: number
      expression: number
      technique: number
    }
    comments?: string
    evaluatedAt: string
  }
}

export interface N8nWebhookResponse {
  success: boolean
  message?: string
  id?: string
}