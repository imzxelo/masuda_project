import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { InstructorSession } from '@/types/instructor'

interface InstructorState {
  session: InstructorSession | null
  isAuthenticated: boolean
  
  // Actions
  setSession: (session: InstructorSession) => void
  clearSession: () => void
  updateLoginTime: () => void
}

export const useInstructorStore = create<InstructorState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,

      setSession: (session) => set({ 
        session, 
        isAuthenticated: true 
      }),
      
      clearSession: () => set({ 
        session: null, 
        isAuthenticated: false 
      }),
      
      updateLoginTime: () => {
        const currentSession = get().session
        if (currentSession) {
          set({
            session: {
              ...currentSession,
              loginAt: new Date().toISOString()
            }
          })
        }
      },
    }),
    {
      name: 'instructor-session',
      partialize: (state) => ({ 
        session: state.session,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)