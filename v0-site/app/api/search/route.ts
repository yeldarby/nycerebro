import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    console.log('Sending request to Roboflow API...')
    const clipResponse = await fetch('https://detect.roboflow.com/infer/workflows/shortest-hackathon/embed-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.ROBOFLOW_API_KEY,
        inputs: {
          "image": {"type": "url", "value": "https://source.roboflow.com/c8QoUtY71EUIn6gsXQMkSt8K0fC3/lUis6HgjW32zZv1WYVKQ/thumb.jpg"},
          "query": query
        }
      })
    })

    if (!clipResponse.ok) {
      const errorText = await clipResponse.text()
      console.error('Roboflow API error response:', errorText)
      throw new Error(`Roboflow API error: ${clipResponse.status} ${clipResponse.statusText} - ${errorText}`)
    }

    const clipResult = await clipResponse.json()
    console.log('Roboflow API response:', JSON.stringify(clipResult, null, 2))

    if (!clipResult.outputs || !Array.isArray(clipResult.outputs) || clipResult.outputs.length === 0) {
      console.error('Invalid Roboflow API response structure:', clipResult)
      throw new Error('Invalid response structure from Roboflow API: Missing or empty outputs array')
    }

    const embedding = clipResult.outputs[0].embedding

    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.error('Invalid embedding in Roboflow API response:', clipResult.outputs[0])
      throw new Error('Invalid embedding in Roboflow API response: Expected non-empty array')
    }

    console.log('Querying Supabase...')
    const { data: matchedCameras, error } = await supabase.rpc('match_cameras', {
      query_embedding: embedding,
      match_threshold: 0, // Lowered threshold to get more results
      match_count: 25
    })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Supabase query result:', JSON.stringify(matchedCameras, null, 2))

    let cameras;
    if (!matchedCameras || matchedCameras.length === 0) {
      console.log('No matching cameras found. Returning all cameras.')
      const { data: allCameras, error: allCamerasError } = await supabase
        .from('cameras')
        .select('camera_id, latitude, longitude')
        .limit(25)

      if (allCamerasError) {
        console.error('Error fetching all cameras:', allCamerasError)
        throw new Error(`Error fetching all cameras: ${allCamerasError.message}`)
      }

      if (!allCameras || allCameras.length === 0) {
        return NextResponse.json({ error: 'No cameras found in the database' }, { status: 404 })
      }

      cameras = allCameras.map(camera => ({
        ...camera,
        distance: Math.random() // Assign random distances for visualization
      }))
    } else {
      cameras = matchedCameras;
    }

    console.log(`Found ${cameras.length} cameras`)
    console.log('Camera data:', JSON.stringify(cameras, null, 2))

    const validDistances = cameras.map((c: any) => c.distance).filter((d: number) => !isNaN(d))
    const maxDistance = Math.max(...validDistances)
    const minDistance = Math.min(...validDistances)

    console.log('Max distance:', maxDistance)
    console.log('Min distance:', minDistance)

    const heatmapData = cameras.map((camera: any) => {
      let intensity = null
      if (!isNaN(camera.distance) && maxDistance !== minDistance) {
        intensity = (maxDistance - camera.distance) / (maxDistance - minDistance)
      }
      console.log(`Camera ${camera.camera_id}: distance = ${camera.distance}, intensity = ${intensity}`)
      return {
        latitude: camera.latitude,
        longitude: camera.longitude,
        intensity: intensity
      }
    })

    console.log('Processed heatmap data:', JSON.stringify(heatmapData, null, 2))

    const bestMatch = cameras[0].camera_id

    return NextResponse.json({ bestMatch, heatmapData })
  } catch (error: any) {
    console.error('Search error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

