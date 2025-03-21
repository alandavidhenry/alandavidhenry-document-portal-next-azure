'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

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

          {/* Auth Button */}
          <div className='hidden md:block'>
            {session ? (
              <Button variant='outline' onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Button onClick={handleSignIn}>Sign In</Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className='h-6 w-6' />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-2 space-y-1'>
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
            <div className='pt-2'>
              {session ? (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              ) : (
                <Button className='w-full' onClick={handleSignIn}>
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
