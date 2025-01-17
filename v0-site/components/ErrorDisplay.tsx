import { AlertCircle } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
  details?: any
}

export default function ErrorDisplay({ message, details }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-2" />
          <strong className="font-bold">Error:</strong>
        </div>
        <span className="block sm:inline mt-2">{message}</span>
        {process.env.NODE_ENV === 'development' && details && (
          <pre className="mt-4 text-xs overflow-x-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

