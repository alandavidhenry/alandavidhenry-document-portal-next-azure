'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'

export type Document = {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
}

// Create a separate component for the cell
function DocumentNameCell({ name }: { name: string }) {
  const { data: session } = useSession()

  const handleDownload = async () => {
    if (!session) return

    try {
      const response = await fetch(
        `/api/documents/download?name=${encodeURIComponent(name)}`
      )

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const { url } = await response.json()

      const link = document.createElement('a')
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <FileIcon className='h-4 w-4' />
      <button
        onClick={handleDownload}
        className='hover:underline text-blue-600 disabled:text-gray-400'
        disabled={!session}
      >
        {name}
      </button>
    </div>
  )
}

// Use the component in the columns definition
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
