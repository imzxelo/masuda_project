'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, Button, Input, LoadingSpinner } from '@/components/ui'
import StudentRegister from '@/components/StudentRegister'
import StudentEdit from '@/components/StudentEdit'
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
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isComposing, setIsComposing] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setSearchQuery(student.name)
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
    onSelect(student)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // IME変換中でない場合のみドロップダウンを開く
    if (!isComposing) {
      setIsDropdownOpen(true)
    }
    setHighlightedIndex(-1)
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
    // IME変換が完了したときにドロップダウンを開く
    setIsDropdownOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredStudents.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredStudents.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredStudents[highlightedIndex]) {
          handleStudentSelect(filteredStudents[highlightedIndex])
        }
        break
      case 'Escape':
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // 外側をクリックした時にドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 検索クエリが変更されたときにドロップダウンを開く（IME変換中は除く）
  useEffect(() => {
    if (debouncedSearchQuery && !selectedStudent && !isComposing) {
      setIsDropdownOpen(true)
    }
  }, [debouncedSearchQuery, selectedStudent, isComposing])
  
  const handleRegisterSuccess = () => {
    setShowRegisterForm(false)
    // 生徒リストを再読み込み
    loadStudents()
  }
  
  const handleRegisterCancel = () => {
    setShowRegisterForm(false)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    setEditingStudent(null)
    // 生徒リストを再読み込み
    loadStudents()
  }

  const handleEditCancel = () => {
    setShowEditForm(false)
    setEditingStudent(null)
  }

  if (showRegisterForm) {
    return (
      <StudentRegister 
        onSuccess={handleRegisterSuccess}
        onCancel={handleRegisterCancel}
      />
    )
  }

  if (showEditForm && editingStudent) {
    return (
      <StudentEdit 
        student={editingStudent}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    )
  }
  
  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">生徒選択</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegisterForm(true)}
            className="bg-white"
          >
            新しい生徒を登録
          </Button>
        </div>

        {/* Type-ahead Search Input */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="生徒名またはメールアドレスで検索..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => !isComposing && setIsDropdownOpen(true)}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {isLoading && (
              <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && !error && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                      index === highlightedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col flex-1" onClick={() => handleStudentSelect(student)}>
                        <span className="font-medium text-gray-900">{student.name}</span>
                        {student.email && (
                          <span className="text-sm text-gray-500">{student.email}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {student.notes && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {student.notes}
                          </span>
                        )}
                        {selectedStudent?.id === student.id && (
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditStudent(student)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="生徒情報を編集"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  {debouncedSearchQuery ? '該当する生徒が見つかりません' : 'アクティブな生徒がいません'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Student Display */}
        {selectedStudent && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-900">選択された生徒:</span>
                <div className="text-blue-800">{selectedStudent.name}</div>
                {selectedStudent.email && (
                  <div className="text-sm text-blue-600">{selectedStudent.email}</div>
                )}
                {selectedStudent.notes && (
                  <div className="text-sm text-blue-600">備考: {selectedStudent.notes}</div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditStudent(selectedStudent)}
                  className="p-2 text-blue-600 hover:text-blue-800 rounded"
                  title="生徒情報を編集"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
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

        {/* Usage Hints */}
        <div className="text-xs text-gray-500 text-center">
          <p>↑↓ キーで選択、Enter キーで確定、Esc キーでキャンセル</p>
        </div>
      </div>
    </Card>
  )
}