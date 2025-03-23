// src/lib/list-blobs.ts
import { groupDocumentsByVersion } from './version-manager'

export interface BlobItem {
  id: string
  name: string
  uploadedAt: string
  type: string
  size: string
  hasVersions: boolean
  versionNumber?: number
  totalVersions?: number
  originalName?: string
}

export async function listBlobs(
  includeVersions: boolean = false
): Promise<BlobItem[]> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

  try {
    // Group documents by version
    const documentsWithVersions = await groupDocumentsByVersion(
      containerName,
      connectionString
    )

    // Generate the blob list based on whether we want to include all versions
    if (includeVersions) {
      // Return all versions of all documents
      return documentsWithVersions.flatMap((doc) =>
        doc.versions.map((version) => ({
          id: version.fileName,
          name: version.fileName,
          uploadedAt: version.uploadedAt.toLocaleDateString(),
          type: getContentType(version.fileName),
          size: version.size,
          hasVersions: doc.versions.length > 1,
          versionNumber: version.versionNumber,
          totalVersions: doc.versions.length,
          originalName: version.originalName
        }))
      )
    } else {
      // Return only the latest version of each document
      return documentsWithVersions.map((doc) => ({
        id: doc.latestVersion.fileName,
        name: doc.latestVersion.fileName,
        uploadedAt: doc.latestVersion.uploadedAt.toLocaleDateString(),
        type: getContentType(doc.latestVersion.fileName),
        size: doc.latestVersion.size,
        hasVersions: doc.versions.length > 1,
        versionNumber:
          doc.versions.length > 0 ? doc.latestVersion.versionNumber : 1,
        totalVersions: doc.versions.length,
        originalName: doc.originalName
      }))
    }
  } catch (error) {
    console.error('Error listing blobs:', error)
    throw error
  }
}

/**
 * Get document versions for a specific base name
 */
export async function getDocumentVersions(
  baseName: string
): Promise<BlobItem[]> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

  try {
    // Import dynamically to avoid circular dependencies
    const { getDocumentVersions } = await import('./version-manager')

    // Get all versions of this document
    const versions = await getDocumentVersions(
      baseName,
      containerName,
      connectionString
    )

    // Convert to BlobItem format
    return versions.map((version) => ({
      id: version.fileName,
      name: version.fileName,
      uploadedAt: version.uploadedAt.toLocaleDateString(),
      type: getContentType(version.fileName),
      size: version.size,
      hasVersions: versions.length > 1,
      versionNumber: version.versionNumber,
      totalVersions: versions.length,
      originalName: version.originalName
    }))
  } catch (error) {
    console.error('Error getting document versions:', error)
    throw error
  }
}

/**
 * Determine content type based on file extension
 */
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml'
  }

  return mimeTypes[extension] || 'application/octet-stream'
}
