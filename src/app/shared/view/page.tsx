'use client'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { FileDown } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'

export default function SharedDocumentPage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const name = searchParams.get('name')

  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  useEffect(() => {
    const fetchPdf = async () => {
      if (!url) {
        setError('No document URL provided')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Fetch the PDF data from the SAS URL
        const pdfResponse = await fetch(url)
        if (!pdfResponse.ok) {
          throw new Error('Failed to fetch document')
        }

        const arrayBuffer = await pdfResponse.arrayBuffer()
        setPdfData(new Uint8Array(arrayBuffer))
      } catch (err) {
        console.error('Error fetching document:', err)
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdf()
  }, [url])

  const handleDownload = () => {
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = name ?? 'document'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Download started',
      description: 'Your document download has started.',
      duration: 3000
    })
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex justify-center items-center h-96'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className='text-center p-8 text-red-500'>
          <p className='text-lg font-medium'>Error</p>
          <p>{error}</p>
        </div>
      )
    }

    if (pdfData && name?.toLowerCase().endsWith('.pdf')) {
      return (
        <div style={{ height: '750px' }}>
          <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'>
            <Viewer fileUrl={pdfData} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      )
    }

    // Default case
    return (
      <div className='text-center p-8'>
        <p className='text-lg font-medium'>Document Ready</p>
        <p>Click the Download button to get this file.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-4'>
      <Card className='w-full shadow-lg'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>{name ?? 'Shared Document'}</CardTitle>
          <Button onClick={handleDownload} variant='outline'>
            <FileDown className='mr-2 h-4 w-4' />
            Download
          </Button>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
