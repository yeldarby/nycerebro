'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [query, setQuery] = useState('')

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nycerebro-logo-vv86ktFCMU8WN3GWMSla8l5DbO8KMY.jpeg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-950/50 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-12">
        {/* Title */}
        <h1 className="text-7xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-text-shine tracking-tight">
          NYCerebro
        </h1>

        {/* Search form */}
        <form 
          action="/search" 
          className="w-full max-w-xl flex flex-col sm:flex-row gap-3 px-4"
        >
          <Input
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NYC cameras..."
            className="flex-1 h-12 bg-gray-900/50 border-purple-500/20 text-gray-100 placeholder:text-gray-400 text-lg rounded-lg"
          />
          <Button 
            type="submit"
            className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 rounded-lg text-lg"
          >
            Search
          </Button>
        </form>

        {/* Quick search links */}
        <div className="flex flex-wrap justify-center gap-3 px-4">
          {['weird', 'busy', 'bright', 'time square', 'traffic'].map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-6 py-2 rounded-full bg-gray-900/50 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-colors border border-purple-500/20 shadow-lg shadow-purple-500/10 font-mono"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

