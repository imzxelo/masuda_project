'use client'

import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg'
}

export default function Card({ 
  children, 
  padding = 'md', 
  shadow = 'md', 
  className = '', 
  ...props 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div 
      className={`bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}