export default function BookingsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-slate-800 rounded" />
        <div className="h-9 w-32 bg-slate-800 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-slate-800/60 rounded-lg" />
        ))}
        <div className="ml-auto h-8 w-48 bg-slate-800/60 rounded-lg" />
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="h-10 bg-slate-800/40 border-b border-[#1f2937]" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-[#1f2937] flex items-center px-4 gap-4">
            <div className="h-3 w-32 bg-slate-700/60 rounded" />
            <div className="h-3 w-20 bg-slate-700/40 rounded" />
            <div className="h-3 w-16 bg-slate-700/40 rounded" />
            <div className="h-5 w-16 bg-slate-700/40 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
