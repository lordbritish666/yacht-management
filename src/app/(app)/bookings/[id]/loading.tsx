export default function BookingDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-slate-700 rounded" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-40 bg-slate-800 rounded" />
              <div className="h-5 w-16 bg-slate-800/60 rounded-full" />
            </div>
            <div className="h-3.5 w-52 bg-slate-800/40 rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details + movements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4">
            <div className="h-4 w-32 bg-slate-700 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2.5 w-16 bg-slate-700/50 rounded" />
                  <div className="h-4 w-28 bg-slate-700/70 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-3">
            <div className="h-4 w-36 bg-slate-700 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-800/60 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-3">
            <div className="h-4 w-28 bg-slate-700 rounded" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-9 bg-slate-700/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
