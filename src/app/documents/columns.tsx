'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileIcon } from 'lucide-react'

export type Document = {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <FileIcon className='h-4 w-4' />
          <a href='#' className='hover:underline text-blue-600'>
            {row.getValue('name')}
          </a>
        </div>
      )
    }
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
