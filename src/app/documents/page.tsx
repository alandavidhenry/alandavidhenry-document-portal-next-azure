import { DragDropUploader } from '@/components/drag-drop-uploader'
import { listBlobs } from '@/lib/list-blobs'

import { columns } from './columns'
import { DataTable } from './data-table'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  // Fetch documents from Azure Storage
  const documents = await listBlobs()

  return (
    <div className='grid gap-4'>
      {/* Fixed header with heading and upload button */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Documents</h1>
        <DragDropUploader />
      </div>

      {/* Data table */}
      <DataTable columns={columns} data={documents} />
    </div>
  )
}
