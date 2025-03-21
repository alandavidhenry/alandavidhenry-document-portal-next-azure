'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Download, FileIcon, QrCode, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

import { QrCodeModal } from '@/components/qr-code-modal'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export type Document = {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
}

function DocumentNameCell({ name, type }: { name: string; type: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!session || isLoading) return

    if (type.toLowerCase().includes('pdf')) {
      // Navigate to PDF viewer for PDF files
      router.push(`/documents/view/${encodeURIComponent(name)}`)
    } else {
      // Handle other file types with direct download
      handleDownload()
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/documents/download?name=${encodeURIComponent(name)}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      const { url } = await response.json()

      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert(error instanceof Error ? error.message : 'Failed to download file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <FileIcon className='h-4 w-4' />
      <button
        onClick={handleClick}
        className='hover:underline text-blue-600 disabled:text-gray-400'
        disabled={!session || isLoading}
      >
        {isLoading ? 'Loading...' : name}
      </button>
    </div>
  )
}

function DownloadCell({ name }: { name: string }) {
  const { data: session } = useSession()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!session || isDownloading) return

    setIsDownloading(true)
    try {
      const response = await fetch(
        `/api/documents/download?name=${encodeURIComponent(name)}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      const { url } = await response.json()

      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert(error instanceof Error ? error.message : 'Failed to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={handleDownload}
      disabled={!session || isDownloading}
      title='Download'
    >
      <Download className={isDownloading ? 'animate-pulse' : ''} />
    </Button>
  )
}

function ShareCell({ name }: { name: string }) {
  const { data: session } = useSession()
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)

  const generateShareUrl = async (): Promise<string> => {
    if (shareUrl) return shareUrl

    const response = await fetch(
      `/api/documents/share?name=${encodeURIComponent(name)}`
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Share link generation failed')
    }

    const data = await response.json()
    setShareUrl(data.shareUrl)
    return data.shareUrl
  }

  const handleShare = async () => {
    if (!session || isSharing) return

    setIsSharing(true)
    try {
      const url = await generateShareUrl()

      // Copy to clipboard
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Link copied to clipboard',
        description: 'The shareable link has been copied to your clipboard.',
        duration: 3000
      })
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: 'Failed to generate share link',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
        duration: 3000
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleShowQrCode = async () => {
    if (!session || isSharing) return

    setIsSharing(true)
    try {
      await generateShareUrl()
      setShowQrCode(true)
    } catch (error) {
      console.error('QR code generation error:', error)
      toast({
        title: 'Failed to generate QR code',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
        duration: 3000
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <>
      <div className='flex space-x-1'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleShare}
          disabled={!session || isSharing}
          title='Copy Share Link'
        >
          <Share2 className={isSharing ? 'animate-pulse' : ''} />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleShowQrCode}
          disabled={!session || isSharing}
          title='Generate QR Code'
        >
          <QrCode className={isSharing ? 'animate-pulse' : ''} />
        </Button>
      </div>

      {/* QR Code Modal */}
      {showQrCode && shareUrl && (
        <QrCodeModal
          url={shareUrl}
          fileName={name}
          onClose={() => setShowQrCode(false)}
        />
      )}
    </>
  )
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <DocumentNameCell
        name={row.getValue('name')}
        type={row.getValue('type')}
      />
    )
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Upload Date'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'size',
    header: 'Size'
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='flex space-x-1'>
        <DownloadCell name={row.getValue('name')} />
        <ShareCell name={row.getValue('name')} />
      </div>
    )
  }
]
