'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  RowSelectionState,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'

interface DataTableProps<TData, TValue> {
  readonly columns: ColumnDef<TData, TValue>[]
  readonly data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const { data: session } = useSession()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Add sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  // Get the table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting
    }
  })

  // Get selected row data
  const selectedRows = table.getSelectedRowModel().rows
  const selectedFilenames = selectedRows.map(
    (row) => (row.original as any).name
  )
  const hasSelectedRows = selectedRows.length > 0

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (!hasSelectedRows || !session) return
    setShowDeleteConfirmation(true)
  }

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (!hasSelectedRows || !session || isDeleting) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ names: selectedFilenames })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Bulk delete failed')
      }

      await response.json()

      toast({
        title: 'Documents deleted',
        description: `Successfully deleted ${selectedRows.length} document(s)`,
        duration: 3000
      })

      // Reset selection
      setRowSelection({})

      // Refresh the page to update the document list
      window.location.reload()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Failed to delete documents',
        variant: 'destructive',
        duration: 3000
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Selection toolbar */}
      {hasSelectedRows && (
        <div className='flex items-center justify-between bg-muted/50 p-2 rounded-md'>
          <div className='text-sm'>
            {selectedRows.length} {selectedRows.length === 1 ? 'item' : 'items'}{' '}
            selected
          </div>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleBulkDelete}
            disabled={!session || isDeleting}
            className='gap-2'
          >
            <Trash2 className='h-4 w-4' />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-1'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽'
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          fileNames={selectedFilenames}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
