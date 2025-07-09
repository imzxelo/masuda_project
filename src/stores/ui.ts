import { create } from 'zustand'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface UIState {
  isLoading: boolean
  loadingMessage: string
  toasts: ToastMessage[]
  error: string | null
  
  // Actions
  setLoading: (isLoading: boolean, message?: string) => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  loadingMessage: '',
  toasts: [],
  error: null,

  setLoading: (isLoading, message = '') => 
    set({ isLoading, loadingMessage: message }),
  
  addToast: (toast) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto-remove toast after duration
    setTimeout(() => {
      get().removeToast(id)
    }, toast.duration || 3000)
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    })),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}))