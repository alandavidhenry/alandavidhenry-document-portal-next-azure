import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { generateSasToken } from '@/lib/storage'

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    // Generate a longer-lived SAS token (e.g., 7 days)
    const sasUrl = await generateSasToken(
      process.env.AZURE_STORAGE_CONTAINER_NAME!,
      name,
      {
        permissions: 'r', // Read-only permission
        startsOn: new Date(Date.now() - 60 * 1000), // Start 1 minute ago
        expiresOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire in 7 days
        contentDisposition: `inline; filename="${name}"`
      }
    )

    // Create a shareable URL that points to our app's document viewer or direct download
    let shareUrl
    if (name.toLowerCase().endsWith('.pdf')) {
      // For PDFs, point to the in-app viewer
      const viewerUrl = `${request.nextUrl.origin}/shared/view?url=${encodeURIComponent(sasUrl)}&name=${encodeURIComponent(name)}`
      shareUrl = viewerUrl
    } else {
      // For non-PDFs, provide the direct download URL
      shareUrl = sasUrl
    }

    return NextResponse.json(
      { shareUrl },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: 'Failed to generate share URL' },
      { status: 500 }
    )
  }
}
