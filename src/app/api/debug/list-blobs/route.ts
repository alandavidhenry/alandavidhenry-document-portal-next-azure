// src/app/api/debug/list-blobs/route.ts
import { BlobServiceClient } from '@azure/storage-blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

    // Log important info
    console.log('Attempting to list blobs from container:', containerName)

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    // First check if container exists
    const containerExists = await containerClient.exists()
    if (!containerExists) {
      return NextResponse.json({
        error: 'Container does not exist',
        containerName
      })
    }

    // List the blobs
    const blobs = []
    let blobCount = 0

    for await (const blob of containerClient.listBlobsFlat()) {
      blobCount++
      blobs.push({
        name: blob.name,
        contentType: blob.properties.contentType,
        contentLength: blob.properties.contentLength
      })

      // Just get the first 10 for debugging
      if (blobs.length >= 10) break
    }

    return NextResponse.json({
      success: true,
      containerExists,
      totalBlobsScanned: blobCount,
      blobs
    })
  } catch (error) {
    console.error('Error in list-blobs debug endpoint:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
