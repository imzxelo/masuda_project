'use client'

import { useState } from 'react'
import { Instructor, InstructorSession } from '@/types/instructor'

interface InstructorSelectProps {
  instructors: Instructor[]
  onSelect: (session: InstructorSession) => void
  className?: string
}

export default function InstructorSelect({ instructors, onSelect, className = '' }: InstructorSelectProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = async (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId)
    if (!instructor) return

    setIsLoading(true)
    try {
      const session: InstructorSession = {
        instructorId: instructor.id,
        name: instructor.name,
        loginAt: new Date().toISOString(),
        isActive: true
      }
      onSelect(session)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          講師選択
        </h2>
        
        <div className="space-y-3">
          {instructors.filter(instructor => instructor.isActive).map((instructor) => (
            <button
              key={instructor.id}
              onClick={() => handleSelect(instructor.id)}
              disabled={isLoading}
              className={`w-full p-3 text-left rounded-md border transition-colors ${
                selectedInstructor === instructor.id
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{instructor.name}</span>
                <span className="text-sm text-gray-500">{instructor.email}</span>
              </div>
            </button>
          ))}
        </div>

        {instructors.filter(instructor => instructor.isActive).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            アクティブな講師がいません
          </div>
        )}

        {isLoading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">ログイン中...</span>
          </div>
        )}
      </div>
    </div>
  )
}