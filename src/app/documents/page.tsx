import { columns } from './columns'
import { DataTable } from './data-table'

// This would later come from your Azure storage
const documents = [
  {
    id: '1',
    name: 'Document 1.pdf',
    uploadedAt: '2024-01-01',
    type: 'PDF',
    size: '1.2 MB'
  },
  {
    id: '2',
    name: 'Presentation.pptx',
    uploadedAt: '2024-01-02',
    type: 'PPTX',
    size: '2.5 MB'
  }
]

export default function DocumentsPage() {
  return (
    <div className='grid gap-4'>
      <h1 className='text-3xl font-bold'>Documents</h1>
      <DataTable columns={columns} data={documents} />
    </div>
  )
}
