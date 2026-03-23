export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-28 bg-slate-800 rounded" />
          <div className="h-4 w-48 bg-slate-800/60 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-800 rounded-lg" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-800/60 rounded-xl" />
        ))}
      </div>

      {/* Three-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 bg-slate-800/60 rounded-xl" />
        ))}
      </div>

      {/* Marina map */}
      <div className="h-72 bg-slate-800/60 rounded-2xl" />

      {/* Table */}
      <div className="bg-slate-800/60 rounded-xl overflow-hidden">
        <div className="h-10 bg-slate-800 border-b border-slate-700/50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 border-b border-slate-800/80 flex items-center px-4 gap-4">
            <div className="h-3 w-12 bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-700/60 rounded" />
            <div className="h-3 w-28 bg-slate-700/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
