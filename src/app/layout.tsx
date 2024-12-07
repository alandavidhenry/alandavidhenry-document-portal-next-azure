import { Inter } from 'next/font/google'

import { AuthProvider } from '@/components/providers/session-provider'

import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Portal',
  description: "Your organization's document portal"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AuthProvider>
          <main className='min-h-screen bg-background'>
            <div className='container mx-auto py-4'>{children}</div>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
