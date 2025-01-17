import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: headers,
    })
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch image' }, { status: 500 })
  }
}

