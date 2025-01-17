import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  // For now, we'll just return random results
  const { data: cameras, error } = await supabase
    .from('cameras')
    .select('camera_id, latitude, longitude')
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bestMatch = cameras[Math.floor(Math.random() * cameras.length)].camera_id

  const heatmapData = cameras.map(camera => ({
    latitude: camera.latitude,
    longitude: camera.longitude,
    intensity: Math.random() // Random intensity for now
  }))

  return NextResponse.json({ bestMatch, heatmapData })
}

