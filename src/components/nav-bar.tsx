'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

// Define navigation items
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Documents', href: '/documents' }
  // Add more navigation items here as needed
]

export function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Function to handle sign in with explicit callback URL
  const handleSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/documents' })
  }

  return (
    <nav className='bg-background border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo/Brand */}
          <div className='flex-shrink-0'>
            <Link href='/' className='text-xl font-bold'>
              Document Portal
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex md:items-center md:space-x-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Theme Toggle and Auth Button */}
          <div className='hidden md:flex md:items-center md:space-x-2'>
            <ThemeToggle />
            {session ? (
              <Button variant='outline' onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Button onClick={handleSignIn}>Sign In</Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center space-x-2'>
            <ThemeToggle />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='h-10 w-10'
            >
              <Menu className='h-6 w-6' />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 space-y-2 border-t animate-in slide-in-from-top'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className='pt-2 px-2'>
              {session ? (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  className='w-full py-3 text-base'
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
