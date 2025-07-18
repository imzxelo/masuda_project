'use client'

import { useState, useCallback } from 'react'
import { EvaluationScore, EvaluationComments } from '@/types/evaluation'

interface EvaluationSliderProps {
  initialScores?: EvaluationScore
  initialComments?: EvaluationComments
  onChange: (scores: EvaluationScore, comments: EvaluationComments) => void
  className?: string
}

const defaultScores: EvaluationScore = {
  pitch: 0,
  rhythm: 0,
  expression: 0,
  technique: 0,
}

const defaultComments: EvaluationComments = {
  pitch: '',
  rhythm: '',
  expression: '',
  technique: '',
}

const evaluationItems = [
  { key: 'pitch' as keyof EvaluationScore, label: '音程', color: 'bg-blue-500' },
  { key: 'rhythm' as keyof EvaluationScore, label: 'リズム', color: 'bg-green-500' },
  { key: 'expression' as keyof EvaluationScore, label: '表現', color: 'bg-purple-500' },
  { key: 'technique' as keyof EvaluationScore, label: 'テクニック', color: 'bg-orange-500' },
]

export default function EvaluationSlider({ 
  initialScores = defaultScores, 
  initialComments = defaultComments,
  onChange, 
  className = '' 
}: EvaluationSliderProps) {
  const [scores, setScores] = useState<EvaluationScore>(initialScores)
  const [comments, setComments] = useState<EvaluationComments>(initialComments)

  const handleScoreChange = useCallback((key: keyof EvaluationScore, value: number) => {
    const newScores = { ...scores, [key]: value }
    setScores(newScores)
    onChange(newScores, comments)
  }, [scores, comments, onChange])

  const handleCommentChange = useCallback((key: keyof EvaluationComments, value: string) => {
    const newComments = { ...comments, [key]: value }
    setComments(newComments)
    onChange(scores, newComments)
  }, [scores, comments, onChange])

  return (
    <div className={`space-y-8 ${className}`}>
      {evaluationItems.map(({ key, label, color }) => (
        <div key={key} className="space-y-3">
          <div className="flex items-center justify-between">
            <label 
              htmlFor={key} 
              className="block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
            <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
              {scores[key]}点
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              id={key}
              min="0"
              max="10"
              value={scores[key]}
              onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${color.replace('bg-', '').replace('-500', '')} 0%, ${color.replace('bg-', '').replace('-500', '')} ${scores[key] * 10}%, #e5e7eb ${scores[key] * 10}%, #e5e7eb 100%)`
              }}
              aria-label={`${label}の評価`}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={scores[key]}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
          </div>
          <div className="mt-3">
            <label 
              htmlFor={`${key}-comment`} 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}のコメント
            </label>
            <textarea
              id={`${key}-comment`}
              value={comments[key]}
              onChange={(e) => handleCommentChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              placeholder={`${label}について具体的なコメントを記入してください...`}
              aria-label={`${label}のコメント`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}