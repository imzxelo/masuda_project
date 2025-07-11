import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Student } from '@/types/student'

interface StudentState {
  selectedStudent: Student | null
  
  // Actions
  setSelectedStudent: (student: Student | null) => void
  clearSelectedStudent: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      selectedStudent: null,

      setSelectedStudent: (student) => set({ selectedStudent: student }),
      
      clearSelectedStudent: () => set({ selectedStudent: null }),
    }),
    {
      name: 'selected-student',
      partialize: (state) => ({ 
        selectedStudent: state.selectedStudent 
      }),
    }
  )
)