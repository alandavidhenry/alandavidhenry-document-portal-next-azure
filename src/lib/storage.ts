import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol
} from '@azure/storage-blob'

export async function generateSasToken(
  containerName: string,
  blobName: string
) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)

  const startsOn = new Date()
  startsOn.setMinutes(startsOn.getMinutes() - 1)

  const expiresOn = new Date(startsOn)
  expiresOn.setMinutes(startsOn.getMinutes() + 30)

  const sasUrl = await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse('r'),
    startsOn,
    expiresOn,
    protocol: SASProtocol.Https,
    cacheControl: 'no-cache',
    contentDisposition: `attachment; filename="${blobName}"`
  })

  return sasUrl
}
