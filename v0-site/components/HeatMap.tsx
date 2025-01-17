'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface HeatMapProps {
  data: Array<{ latitude: number; longitude: number; intensity: number }>
}

export default function HeatMap({ data }: HeatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)

  const updateMapData = useCallback((mapData: typeof data) => {
    if (!map.current) {
      console.log('Map not initialized, cannot update data')
      return
    }

    try {
      console.log('Updating map with data:', mapData)
      const features = mapData.map(point => ({
        'type': 'Feature' as const,
        'properties': {
          'intensity': point.intensity
        },
        'geometry': {
          'type': 'Point' as const,
          'coordinates': [point.longitude, point.latitude]
        }
      }))

      console.log('Created features:', features)

      if (!map.current.getSource('points')) {
        console.error('Points source not found, attempting to add it')
        map.current.addSource('points', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': []
          }
        })
      }

      const source = map.current.getSource('points') as mapboxgl.GeoJSONSource
      if (source) {
        source.setData({
          'type': 'FeatureCollection',
          'features': features
        })

        // Fit the map to the data points
        if (features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds()
          features.forEach((feature: any) => {
            bounds.extend(feature.geometry.coordinates as [number, number])
          })
          map.current!.fitBounds(bounds, {
            padding: 50,
            maxZoom: 13
          })
        }

        console.log('Map data updated successfully')
      } else {
        console.error('Points source still not found after attempting to add it')
      }
    } catch (err: any) {
      console.error('Error updating map data:', err)
      setError(`Failed to update map data: ${err.message}`)
    }
  }, [])

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9ib2Zsb3dicmFkIiwiYSI6ImNtNjA1cXZnOTA1bHUya284OHB4Z25lYTEifQ.Y8nuCyyyE_nKDEK4TaHduA'

    if (map.current) return

    console.log('Initializing Mapbox map...')

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [-73.98, 40.75],
        zoom: 11
      })

      map.current.on('style.load', () => {
        console.log('Map style loaded')
        setIsStyleLoaded(true)

        if (!map.current) return

        map.current.addSource('points', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': []
          }
        })

        map.current.addLayer({
          'id': 'points-heat',
          'type': 'heatmap',
          'source': 'points',
          'paint': {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 1,
              1, 3
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              20, 5
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'rgba(0, 255, 255, 0.8)',
              0.4, 'rgba(0, 255, 0, 0.9)',
              0.6, 'rgba(255, 255, 0, 1)',
              0.8, 'rgba(255, 0, 0, 1)',
              1, 'rgba(255, 0, 255, 1)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 10,
              20, 30
            ],
            'heatmap-opacity': 1
          }
        })

        map.current.addLayer({
          'id': 'points-circles',
          'type': 'circle',
          'source': 'points',
          'paint': {
            'circle-radius': 8,
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, '#0000ff',
              0.5, '#00ff00',
              1, '#ff0000'
            ],
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })

        console.log('Map layers added')

        if (data.length > 0) {
          console.log('Updating initial data after style load')
          updateMapData(data)
        }
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError(`Mapbox error: ${e.error?.message || 'Unknown error'}`)
      })

    } catch (err: any) {
      console.error('Error initializing map:', err)
      setError(`Failed to initialize map: ${err.message}`)
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [data, updateMapData])

  useEffect(() => {
    if (!map.current || !isStyleLoaded) {
      console.log('Map or style not ready, waiting...')
      return
    }

    console.log('Data changed, updating map')
    updateMapData(data)
  }, [data, isStyleLoaded, updateMapData])

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
      <div className="mt-2 text-sm text-gray-400">
        Heatmap data points: {data.length}
      </div>
    </div>
  )
}

