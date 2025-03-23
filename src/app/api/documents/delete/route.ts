// src/app/api/documents/delete/route.ts
import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Helper function to delete a single document
async function deleteSingleDocument(
  containerClient: any,
  fileName: string
): Promise<boolean> {
  try {
    const blobClient = containerClient.getBlobClient(fileName)
    await blobClient.delete()
    return true
  } catch (error) {
    console.error(`Error deleting ${fileName}:`, error)
    return false
  }
}

// Helper function to handle a single file deletion request
async function handleSingleDelete(
  containerClient: any,
  name: string
): Promise<NextResponse> {
  const success = await deleteSingleDocument(containerClient, name)

  if (success) {
    return NextResponse.json({
      message: `Document "${name}" deleted successfully`
    })
  } else {
    return NextResponse.json(
      { error: `Failed to delete document "${name}"` },
      { status: 500 }
    )
  }
}

// Helper function to handle multiple file deletion request
async function handleMultipleDelete(
  containerClient: any,
  names: string[]
): Promise<NextResponse> {
  const results = await Promise.all(
    names.map(async (fileName) => {
      const deleted = await deleteSingleDocument(containerClient, fileName)
      return {
        name: fileName,
        deleted,
        error: deleted ? undefined : 'Failed to delete file'
      }
    })
  )

  const allSuccessful = results.every((r) => r.deleted)
  const message = allSuccessful
    ? `All ${results.length} documents deleted successfully`
    : `Some documents could not be deleted`

  return NextResponse.json({ message, results })
}

// Main DELETE handler
export async function DELETE(request: NextRequest) {
  // Check authentication
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get single file name from query parameters
    const name = request.nextUrl.searchParams.get('name')

    // Get multiple file names from request body
    const names = await extractNamesFromBody(request)

    // Validate input
    if (!name && (!names || names.length === 0)) {
      return NextResponse.json(
        { error: 'File name(s) required for deletion' },
        { status: 400 }
      )
    }

    // Initialize Azure Blob Storage client
    const containerClient = getContainerClient()

    // Process deletion based on input type
    if (name) {
      return handleSingleDelete(containerClient, name)
    }

    if (names && names.length > 0) {
      return handleMultipleDelete(containerClient, names)
    }

    // Shouldn't reach here if validation above works correctly
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document(s)' },
      { status: 500 }
    )
  }
}

// Helper function to extract file names from request body
async function extractNamesFromBody(
  request: NextRequest
): Promise<string[] | undefined> {
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      return body.names as string[] | undefined
    }
    return undefined
  } catch (error) {
    console.error('Error parsing request body:', error)
    return undefined
  }
}

// Helper function to get the container client
function getContainerClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString)
  return blobServiceClient.getContainerClient(containerName)
}
