'use client'

import { useState, useEffect, useRef } from 'react'
import { Instructor, InstructorSession } from '@/types/instructor'
import { useDebounce } from '@/hooks'

interface InstructorSelectProps {
  instructors: Instructor[]
  onSelect: (instructor: Instructor) => void
  className?: string
}

export default function InstructorSelect({ instructors, onSelect, className = '' }: InstructorSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isComposing, setIsComposing] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // アクティブな講師のみをフィルタリング
  const activeInstructors = instructors.filter(instructor => instructor.isActive)
  
  // 検索でフィルタリング
  const filteredInstructors = activeInstructors.filter(instructor =>
    instructor.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    instructor.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  const handleSelect = async (instructor: Instructor) => {
    setIsLoading(true)
    setSelectedInstructor(instructor)
    setSearchQuery(instructor.name)
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
    
    try {
      console.log('Selected instructor:', instructor)
      onSelect(instructor)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedInstructor(null)
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
          prev < filteredInstructors.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredInstructors.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredInstructors[highlightedIndex]) {
          handleSelect(filteredInstructors[highlightedIndex])
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
    if (debouncedSearchQuery && !selectedInstructor && !isComposing) {
      setIsDropdownOpen(true)
    }
  }, [debouncedSearchQuery, selectedInstructor, isComposing])

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          講師選択
        </h2>
        
        <div className="relative" ref={dropdownRef}>
          {/* 検索入力フィールド */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="講師名またはメールアドレスで検索..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => !isComposing && setIsDropdownOpen(true)}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((instructor, index) => (
                  <div
                    key={instructor.id}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                      index === highlightedIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelect(instructor)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{instructor.name}</span>
                        <span className="text-sm text-gray-500">{instructor.email}</span>
                      </div>
                      {selectedInstructor?.id === instructor.id && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  {debouncedSearchQuery ? '該当する講師が見つかりません' : 'アクティブな講師がいません'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 選択された講師の表示 */}
        {selectedInstructor && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-900">選択された講師:</span>
                <div className="text-blue-800">{selectedInstructor.name}</div>
                <div className="text-sm text-blue-600">{selectedInstructor.email}</div>
              </div>
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* 使用方法のヒント */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>↑↓ キーで選択、Enter キーで確定、Esc キーでキャンセル</p>
        </div>
      </div>
    </div>
  )
}