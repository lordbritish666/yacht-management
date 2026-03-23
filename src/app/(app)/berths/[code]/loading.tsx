export default function BerthDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-slate-700 rounded mt-1" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-28 bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-slate-700/50 rounded" />
            <div className="h-5 w-16 bg-slate-700/50 rounded-full" />
          </div>
          <div className="h-3.5 w-44 bg-slate-800/40 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Specs */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-3">
          <div className="h-3 w-24 bg-slate-700/60 rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-slate-700/50 rounded" />
              <div className="h-3 w-20 bg-slate-700/40 rounded" />
              <div className="h-3 w-14 bg-slate-700/60 rounded ml-2" />
            </div>
          ))}
        </div>

        {/* Current booking + history */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4">
            <div className="h-4 w-36 bg-slate-700 rounded" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2.5 w-14 bg-slate-700/40 rounded" />
                  <div className="h-4 w-32 bg-slate-700/60 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <div className="h-10 bg-slate-800/40 border-b border-[#1f2937]" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-[#1f2937] flex items-center px-5 gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-700/60 rounded" />
                  <div className="h-3 w-24 bg-slate-700/40 rounded" />
                </div>
                <div className="h-5 w-20 bg-slate-700/40 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
