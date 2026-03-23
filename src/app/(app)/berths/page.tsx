import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 0

// Scale: 1m = 3px for length, 1m = 6px for width
const LEN_SCALE = 2.8
const WID_SCALE = 6

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  sailboat: { bg: 'bg-sky-950/80',    border: 'border-sky-700',    text: 'text-sky-300',    label: 'Sailboat' },
  motor:    { bg: 'bg-violet-950/80', border: 'border-violet-700', text: 'text-violet-300', label: 'Motor Yacht' },
  large:    { bg: 'bg-amber-950/80',  border: 'border-amber-700',  text: 'text-amber-300',  label: 'Large Yacht' },
  mega:     { bg: 'bg-rose-950/80',   border: 'border-rose-700',   text: 'text-rose-300',   label: 'Megayacht' },
}

const PIERS = [
  { key: 'sailboat', label: 'Pier A — Sailboats',     codes: ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10'] },
  { key: 'motor',    label: 'Pier B — Motor Yachts',  codes: ['B-01','B-02','B-03','B-04','B-05','B-06','B-07','B-08','B-09','B-10'] },
  { key: 'large',    label: 'Pier C — Large Yachts',  codes: ['C-01','C-02','C-03','C-04','C-05','C-06','C-07'] },
  { key: 'mega',     label: 'Pier D — Megayachts',    codes: ['D-01','D-02','D-03'] },
]

export default async function BerthsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const { data: berths } = await supabase
    .from('berths')
    .select('*')
    .eq('is_active', true)
    .order('code')

  const berthMap = new Map((berths ?? []).map(b => [b.code, b]))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Berth Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">Visual layout of all 30 berths. Sizes are to approximate scale.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORY_STYLES).map(([key, s]) => (
          <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.bg} ${s.border}`}>
            <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 ml-auto">
          <span className="text-xs text-slate-400">Scale: 1m ≈ {LEN_SCALE}px length · {WID_SCALE}px width</span>
        </div>
      </div>

      {/* Water */}
      <div className="relative bg-[#0a1628] border border-[#1a2a40] rounded-2xl p-6 space-y-8 overflow-x-auto">
        {/* Water texture label */}
        <div className="absolute top-3 right-4 text-[10px] text-slate-700 font-medium tracking-widest uppercase">
          Telaga Marina Basin
        </div>

        {PIERS.map(pier => {
          const pierBerths = pier.codes.map(code => berthMap.get(code)).filter(Boolean)
          const style = CATEGORY_STYLES[pier.key]

          return (
            <div key={pier.key} className="space-y-2">
              {/* Pier label */}
              <p className={`text-xs font-semibold uppercase tracking-widest ${style.text}`}>
                {pier.label}
              </p>

              {/* Pier walkway + berths */}
              <div className="flex items-end gap-1.5">
                {/* Pier walkway */}
                <div className="w-3 self-stretch bg-slate-600 rounded-l-md opacity-60" />

                {/* Berth slots */}
                <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
                  {pierBerths.map((b: any) => {
                    const h = Math.round(b.length_m * LEN_SCALE)
                    const w = Math.round(b.width_m * WID_SCALE)
                    return (
                      <div
                        key={b.code}
                        style={{ height: h, minWidth: w, width: w }}
                        className={`relative flex flex-col items-center justify-between border rounded-md p-1 shrink-0 ${style.bg} ${style.border}`}
                      >
                        {/* Berth code */}
                        <span className={`text-[9px] font-bold leading-none ${style.text}`}>
                          {b.code}
                        </span>
                        {/* Length label */}
                        <span className="text-[8px] text-slate-500 leading-none">
                          {b.length_m}m
                        </span>
                        {/* Mooring lines */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-slate-500 opacity-50" />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Water line below each pier */}
              <div className="h-px bg-gradient-to-r from-sky-900/40 via-sky-800/20 to-transparent" />
            </div>
          )
        })}

        {/* Harbour entrance */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">Harbour Entrance</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
      </div>

      {/* Specs table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Berth Specifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Code</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Category</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Length</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Width</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Depth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {(berths ?? []).map((b: any) => {
                const s = CATEGORY_STYLES[b.category]
                return (
                  <tr key={b.code} className="hover:bg-[#1f2937]/50">
                    <td className="px-4 py-2 font-medium text-white">{b.code}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${s.bg} ${s.border} ${s.text}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{b.length_m}m</td>
                    <td className="px-4 py-2 text-slate-300">{b.width_m}m</td>
                    <td className="px-4 py-2 text-slate-300">{b.depth_m}m</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
