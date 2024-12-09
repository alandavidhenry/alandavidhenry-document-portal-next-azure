'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Download, FileIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

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
    cell: ({ row }) => <DownloadCell name={row.getValue('name')} />
  }
]
