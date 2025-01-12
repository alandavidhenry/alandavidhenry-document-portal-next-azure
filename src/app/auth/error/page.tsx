'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <h2 className='text-center text-3xl font-bold text-red-600'>
          Authentication Error
        </h2>
        <div className='rounded-md bg-red-50 p-4'>
          <p className='text-sm text-red-800'>
            Error: {error}
          </p>
        </div>
      </div>
    </div>
  )
}