export interface LoadingState {
  loading: boolean
  error?: string
  success?: boolean
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface RadarChartData {
  subject: string
  score: number
  fullMark: number
}

export interface SliderConfig {
  min: number
  max: number
  step: number
  marks?: { [key: number]: string }
}

export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
}