import { BlobServiceClient } from '@azure/storage-blob'

export interface BlobItem {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
}

export async function listBlobs(): Promise<BlobItem[]> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  const blobs: BlobItem[] = []

  try {
    for await (const blob of containerClient.listBlobsFlat()) {
      const properties = await containerClient
        .getBlobClient(blob.name)
        .getProperties()

      blobs.push({
        id: blob.name, // Using name as ID since it's unique
        name: blob.name,
        uploadedAt: properties.lastModified?.toLocaleDateString() ?? '',
        type: blob.properties.contentType ?? 'unknown',
        size: formatBytes(blob.properties.contentLength ?? 0)
      })
    }
  } catch (error) {
    console.error('Error listing blobs:', error)
    throw error
  }

  return blobs
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
