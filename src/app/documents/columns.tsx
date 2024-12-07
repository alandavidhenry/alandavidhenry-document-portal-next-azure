'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export type Document = {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
}

function DocumentNameCell({ name }: { name: string }) {
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
    <div className='flex items-center gap-2'>
      <FileIcon className='h-4 w-4' />
      <button
        onClick={handleDownload}
        className='hover:underline text-blue-600 disabled:text-gray-400'
        disabled={!session || isDownloading}
      >
        {isDownloading ? 'Downloading...' : name}
      </button>
    </div>
  )
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <DocumentNameCell name={row.getValue('name')} />
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
  }
]
