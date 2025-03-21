'use client'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PDFDocumentViewerProps {
  readonly fileName: string
}

export function PDFDocumentViewer({ fileName }: PDFDocumentViewerProps) {
  const router = useRouter()
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  // Fetch PDF data
  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true)
      try {
        // First get the SAS URL through our API
        const response = await fetch(
          `/api/documents/download?name=${encodeURIComponent(fileName)}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch PDF URL')
        }

        const { url } = await response.json()

        // IMPORTANT CHANGE: Use a server proxy to fetch the PDF to avoid CORS issues
        // Instead of fetching directly from Azure Blob, we'll fetch through our own API
        const proxyResponse = await fetch(
          `/api/documents/proxy?url=${encodeURIComponent(url)}`
        )

        if (!proxyResponse.ok) {
          throw new Error('Failed to fetch PDF from proxy')
        }

        const arrayBuffer = await proxyResponse.arrayBuffer()
        setPdfData(new Uint8Array(arrayBuffer))
      } catch (err) {
        console.error('Error fetching PDF:', err)
        setError(err instanceof Error ? err.message : 'Failed to load PDF')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdf()
  }, [fileName])

  // Extract rendering of PDF content to a separate function
  const renderPdfContent = () => {
    if (isLoading) {
      return <div className='flex justify-center p-4'>Loading...</div>
    }

    if (pdfData) {
      return (
        <div style={{ height: '750px' }}>
          <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'>
            <Viewer fileUrl={pdfData} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      )
    }

    return <div className='flex justify-center p-4'>No PDF data available</div>
  }

  if (error) {
    return (
      <div className='container mx-auto py-4'>
        <Card className='p-6'>
          <div className='flex flex-col gap-4 items-center'>
            <p className='text-red-500'>{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Documents
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Documents
          </Button>
          <h1 className='text-2xl font-bold'>{fileName}</h1>
        </div>

        <Card className='p-6'>{renderPdfContent()}</Card>
      </div>
    </div>
  )
}
