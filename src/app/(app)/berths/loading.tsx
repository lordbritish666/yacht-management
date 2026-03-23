export default function BerthsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-6 w-24 bg-slate-800 rounded" />
        <div className="h-4 w-80 bg-slate-800/50 rounded" />
      </div>

      {/* Legend */}
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-36 bg-slate-800/60 rounded-lg" />
        ))}
      </div>

      {/* Map */}
      <div className="h-80 bg-slate-800/60 rounded-2xl" />

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="h-10 bg-slate-800/40 border-b border-[#1f2937]" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-10 border-b border-[#1f2937] flex items-center px-4 gap-4">
            <div className="h-3 w-10 bg-slate-700/60 rounded" />
            <div className="h-5 w-24 bg-slate-700/40 rounded-full" />
            <div className="h-3 w-12 bg-slate-700/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
