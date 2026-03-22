'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-red-400 text-sm font-medium mb-2">Something went wrong</p>
      <p className="text-slate-500 text-xs mb-4 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="text-xs text-sky-400 hover:text-sky-300 border border-sky-900 px-3 py-1.5 rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
