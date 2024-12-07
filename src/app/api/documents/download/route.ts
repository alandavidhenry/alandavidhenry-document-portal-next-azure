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
    const sasUrl = await generateSasToken(
      process.env.AZURE_STORAGE_CONTAINER_NAME!,
      name
    )

    return NextResponse.json({ url: sasUrl })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
