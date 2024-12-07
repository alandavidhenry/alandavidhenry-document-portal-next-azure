import { UploadButton } from '@/components/upload-button'
import { listBlobs } from '@/lib/list-blobs'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function DocumentsPage() {
  // Fetch documents from Azure Storage
  const documents = await listBlobs()

  return (
    <div className='grid gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Documents</h1>
        <UploadButton />
      </div>
      <DataTable columns={columns} data={documents} />
    </div>
  )
}
