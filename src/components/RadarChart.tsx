'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { EvaluationScore } from '@/types/evaluation'

interface RadarChartProps {
  scores: EvaluationScore
  className?: string
}

export default function EvaluationRadarChart({ scores, className = '' }: RadarChartProps) {
  const data = [
    {
      subject: '音程',
      score: scores.pitch,
      fullMark: 100,
    },
    {
      subject: 'リズム',
      score: scores.rhythm,
      fullMark: 100,
    },
    {
      subject: '表現',
      score: scores.expression,
      fullMark: 100,
    },
    {
      subject: 'テクニック',
      score: scores.technique,
      fullMark: 100,
    },
  ]

  return (
    <div className={`w-full h-64 md:h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12, fill: '#374151' }}
            className="text-gray-700"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />
          <Radar
            name="評価"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}