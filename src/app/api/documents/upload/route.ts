import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (optional)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File size exceeds 50MB limit'
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Azure Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    )
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!
    )

    // Check if file already exists and append timestamp if it does
    let fileName = file.name
    const blobClient = containerClient.getBlockBlobClient(fileName)
    const exists = await blobClient.exists()

    if (exists) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const extension =
        fileName.lastIndexOf('.') > 0
          ? fileName.substring(fileName.lastIndexOf('.'))
          : ''
      const baseName = extension
        ? fileName.substring(0, fileName.lastIndexOf('.'))
        : fileName
      fileName = `${baseName}_${timestamp}${extension}`
    }

    const uploadBlobClient = containerClient.getBlockBlobClient(fileName)
    await uploadBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type || 'application/octet-stream'
      }
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: fileName
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
