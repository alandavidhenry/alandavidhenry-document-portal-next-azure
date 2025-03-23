'use client'

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import React from 'react'

import { cn } from '@/lib/utils'

interface SortArrowsProps {
  readonly sorted: boolean
  readonly direction: 'asc' | 'desc' | false
  readonly className?: string
}

export function SortArrows({ sorted, direction, className }: SortArrowsProps) {
  const getSortIcon = () => {
    if (!sorted) {
      return (
        <ChevronsUpDown className='h-4 w-4 text-muted-foreground opacity-50' />
      )
    }

    return direction === 'asc' ? (
      <ArrowUp className='h-4 w-4' />
    ) : (
      <ArrowDown className='h-4 w-4' />
    )
  }

  return (
    <div className={cn('ml-1 inline-flex items-center', className)}>
      {getSortIcon()}
    </div>
  )
}
