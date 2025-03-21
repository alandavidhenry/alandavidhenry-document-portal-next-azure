'use client'

import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/documents'

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='text-center text-3xl font-bold'>
            Sign in to Document Portal
          </h2>
        </div>
        <button
          onClick={() => signIn('azure-ad', { callbackUrl })}
          className='group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700'
        >
          Sign in with Azure AD
        </button>
      </div>
    </div>
  )
}
