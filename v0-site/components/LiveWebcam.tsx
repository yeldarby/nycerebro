'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface LiveWebcamProps {
  cameraId: string
}

export default function LiveWebcam({ cameraId }: LiveWebcamProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const updateImage = async () => {
    setLoading(true)
    setError(null)
    const epochTime = Math.floor(Date.now() / 1000)
    const originalUrl = `https://webcams.nyctmc.org/api/cameras/${cameraId}/image?t=${epochTime}`
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
    
    try {
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`Failed to load webcam image: ${response.status} ${response.statusText}`)
      }
      const blob = await response.blob()
      setImageUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      console.error('Error loading webcam image:', err)
      setError(err.message || 'Failed to load webcam image')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateImage()
    const interval = setInterval(updateImage, 2000)
    return () => clearInterval(interval)
  }, [cameraId])

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 text-white">Live Webcam</h2>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '480px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p className="text-center mb-4">{error}</p>
            <Button onClick={updateImage} variant="outline" className="flex items-center">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          imageUrl && (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Live webcam"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          )
        )}
      </div>
    </div>
  )
}

