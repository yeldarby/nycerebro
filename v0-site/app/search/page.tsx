'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingScreen from './loading'
import LiveWebcam from '@/components/LiveWebcam'
import HeatMap from '@/components/HeatMap'
import ErrorDisplay from '@/components/ErrorDisplay'

interface SearchResult {
  bestMatch: string;
  heatmapData: Array<{ latitude: number; longitude: number; intensity: number }>;
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query || '')}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'An unknown error occurred')
        }
        
        console.log('Search results:', data)
        setResults(data)
      } catch (error: any) {
        console.error('Search error:', error)
        setError(error.message || 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Search Results for: {query}</h1>
      {results && (
        <>
          <LiveWebcam cameraId={results.bestMatch} />
          {results && results.heatmapData && results.heatmapData.length > 0 ? (
  <>
    <HeatMap data={results.heatmapData} />
    <pre className="mt-4 p-4 bg-gray-800 text-gray-200 rounded overflow-auto">
      {JSON.stringify(results.heatmapData, null, 2)}
    </pre>
  </>
) : (
  <div className="text-yellow-500 mb-4">No heatmap data available</div>
)}
        </>
      )}
    </div>
  )
}

