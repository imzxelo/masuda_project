'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, Button, Input, LoadingSpinner } from '@/components/ui'
import StudentRegister from '@/components/StudentRegister'
import { Student } from '@/types/student'
import { getStudents, searchStudents } from '@/lib/api/students'
import { useDebounce } from '@/hooks/useDebounce'

interface StudentSelectProps {
  onSelect: (student: Student) => void
  selectedStudent?: Student | null
  className?: string
}

export default function StudentSelect({ onSelect, selectedStudent, className = '' }: StudentSelectProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Load initial students
  useEffect(() => {
    loadStudents()
  }, [])

  // Search students when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery.trim())
    } else {
      loadStudents()
    }
  }, [debouncedSearchQuery])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getStudents()
      
      if (result.success) {
        setStudents(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setError(error instanceof Error ? error.message : '生徒データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await searchStudents(query)
      
      if (result.success) {
        setStudents(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error searching students:', error)
      setError(error instanceof Error ? error.message : '生徒検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student => student.isActive)
  }, [students])

  const handleStudentSelect = (student: Student) => {
    onSelect(student)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }
  
  const handleRegisterSuccess = () => {
    setShowRegisterForm(false)
    // 生徒リストを再読み込み
    loadStudents()
  }
  
  const handleRegisterCancel = () => {
    setShowRegisterForm(false)
  }

  if (showRegisterForm) {
    return (
      <StudentRegister 
        onSuccess={handleRegisterSuccess}
        onCancel={handleRegisterCancel}
      />
    )
  }
  
  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">生徒選択</h3>
          {selectedStudent && (
            <div className="text-sm text-gray-600">
              選択中: <span className="font-medium">{selectedStudent.name}</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="生徒名またはメールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {searchQuery && (
            <div className="text-sm text-gray-500">
              "{searchQuery}" の検索結果: {filteredStudents.length}件
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-gray-600">生徒データを読み込み中...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800 text-sm">
              <strong>エラー:</strong> {error}
            </div>
            <Button
              size="sm"
              onClick={loadStudents}
              className="mt-2"
            >
              再試行
            </Button>
          </div>
        )}

        {/* Students List */}
        {!isLoading && !error && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? '検索条件に一致する生徒が見つかりません' : 'アクティブな生徒がいません'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`w-full p-3 text-left rounded-md border transition-colors ${
                    selectedStudent?.id === student.id
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      {student.email && (
                        <div className="text-sm text-gray-500">{student.email}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {student.grade && (
                        <div className="text-sm bg-gray-200 px-2 py-1 rounded">
                          {student.grade}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Summary and Register Button */}
        {!isLoading && !error && (
          <div className="pt-3 border-t space-y-3">
            {filteredStudents.length > 0 && (
              <div className="text-sm text-gray-600">
                合計 {filteredStudents.length} 名の生徒が表示されています
              </div>
            )}
            
            {/* 生徒登録ボタン */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {filteredStudents.length === 0 ? '登録された生徒がいません' : '新しい生徒を登録する場合'}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowRegisterForm(true)}
                className="bg-white"
              >
                新しい生徒を登録
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}