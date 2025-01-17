import './globals.css'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'

const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NYCerebro',
  description: 'Search NYC traffic cameras using CLIP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetBrainsMono.className} bg-gradient-to-b from-black via-gray-900 to-purple-950 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

