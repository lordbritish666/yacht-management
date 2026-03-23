import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 0

// 1 metre = SCALE px (length drives how far boat extends from pier; width drives slot height)
const SCALE = 3

const STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  sailboat: { bg: 'rgba(8,40,80,0.92)',  border: '#2563eb', text: '#93c5fd', label: 'Sailboats'   },
  motor:    { bg: 'rgba(25,10,55,0.92)', border: '#7c3aed', text: '#c4b5fd', label: 'Motor Yachts' },
  large:    { bg: 'rgba(28,16,0,0.92)',  border: '#d97706', text: '#fcd34d', label: 'Large Yachts' },
  mega:     { bg: 'rgba(28,5,5,0.92)',   border: '#dc2626', text: '#fca5a5', label: 'Megayachts'   },
}

const PIERS = [
  { key: 'sailboat', letter: 'A', codes: ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10'] },
  { key: 'motor',    letter: 'B', codes: ['B-01','B-02','B-03','B-04','B-05','B-06','B-07','B-08','B-09','B-10'] },
  { key: 'large',    letter: 'C', codes: ['C-01','C-02','C-03','C-04','C-05','C-06','C-07'] },
  { key: 'mega',     letter: 'D', codes: ['D-01','D-02','D-03'] },
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Berth Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Top-down marina layout — berths are proportional to actual vessel dimensions.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        {Object.entries(STYLES).map(([key, s]) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium"
            style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
          >
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ backgroundColor: s.border }}
            />
            Pier {PIERS.find(p => p.key === key)?.letter} — {s.label}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-600">Scale: 1 m = {SCALE} px</span>
      </div>

      {/* ── Marina Map ─────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl border border-[#1a3a5c] overflow-x-auto"
        style={{
          background: 'linear-gradient(178deg, #051525 0%, #071d38 35%, #0a2e55 70%, #0d3b6e 100%)',
          minHeight: 340,
        }}
      >
        {/* Subtle horizontal wave lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px)',
          }}
        />

        {/* Basin watermark */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          <span className="text-4xl font-black tracking-[0.55em] text-white/[0.04] uppercase">
            Basin
          </span>
        </div>

        {/* Compass rose (simple) */}
        <div className="absolute top-14 right-5 text-slate-700 text-[10px] font-bold leading-none select-none">
          <div className="flex flex-col items-center gap-0.5">
            <span>N</span>
            <span className="text-[8px]">↑</span>
          </div>
        </div>

        {/* ── Quay ─────── */}
        <div className="bg-[#2a3441] border-b-4 border-[#3d4f63] px-8 py-3 flex items-center gap-3">
          {/* Bollard dots */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
          ))}
          <span className="mx-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Quay
          </span>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
          ))}
          <span className="ml-auto text-[10px] text-slate-600 italic">
            Telaga Marina, Langkawi
          </span>
        </div>

        {/* ── Piers ─────── */}
        <div className="flex items-start gap-10 px-10 pb-14 min-w-max">
          {PIERS.map(pier => {
            const style = STYLES[pier.key]
            const half = Math.ceil(pier.codes.length / 2)
            const leftCodes  = pier.codes.slice(0, half)
            const rightCodes = pier.codes.slice(half)

            return (
              <div key={pier.key} className="flex flex-col items-center">

                {/* Berths + walkway */}
                <div className="flex items-start">

                  {/* LEFT berths — right-aligned so they butt up against the pier */}
                  <div className="flex flex-col gap-px items-end">
                    {leftCodes.map(code => {
                      const b = berthMap.get(code) as any
                      if (!b) return null
                      const slotW = Math.round(b.length_m * SCALE)
                      const slotH = Math.max(Math.round(b.width_m * SCALE), 10)
                      return (
                        <BerthSlot
                          key={code}
                          code={code}
                          berth={b}
                          style={style}
                          w={slotW}
                          h={slotH}
                          side="left"
                        />
                      )
                    })}
                  </div>

                  {/* Pier walkway */}
                  <div
                    className="self-stretch shrink-0"
                    style={{
                      width: 12,
                      minHeight: 40,
                      backgroundColor: '#3d4f63',
                      borderLeft:  '1.5px solid #5a7a9a',
                      borderRight: '1.5px solid #5a7a9a',
                    }}
                  />

                  {/* RIGHT berths */}
                  <div className="flex flex-col gap-px items-start">
                    {rightCodes.map(code => {
                      const b = berthMap.get(code) as any
                      if (!b) return null
                      const slotW = Math.round(b.length_m * SCALE)
                      const slotH = Math.max(Math.round(b.width_m * SCALE), 10)
                      return (
                        <BerthSlot
                          key={code}
                          code={code}
                          berth={b}
                          style={style}
                          w={slotW}
                          h={slotH}
                          side="right"
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Pier label badge below */}
                <div
                  className="mt-3 px-3 py-0.5 rounded-full border text-[10px] font-bold"
                  style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
                >
                  Pier {pier.letter}
                </div>
              </div>
            )
          })}
        </div>

        {/* Harbour entrance */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center gap-3 px-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="w-px h-3 bg-slate-500/70" />
            <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">
              Harbour Entrance
            </span>
            <div className="w-px h-3 bg-slate-500/70" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
        </div>
      </div>

      {/* ── Specs table ─────────────────────────────────────────── */}
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
                const s = STYLES[b.category]
                return (
                  <tr key={b.code} className="hover:bg-[#1f2937]/50">
                    <td className="px-4 py-2 font-medium text-white">{b.code}</td>
                    <td className="px-4 py-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium border"
                        style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{b.length_m} m</td>
                    <td className="px-4 py-2 text-slate-300">{b.width_m} m</td>
                    <td className="px-4 py-2 text-slate-300">{b.depth_m} m</td>
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

// ─── BerthSlot ────────────────────────────────────────────────────────────────
function BerthSlot({
  code, berth, style, w, h, side,
}: {
  code: string
  berth: any
  style: { bg: string; border: string; text: string }
  w: number
  h: number
  side: 'left' | 'right'
}) {
  const num = code.split('-')[1] // "01", "02" …
  const showLabel = h >= 14      // only label if tall enough to read

  return (
    <div
      style={{
        width: w,
        height: h,
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: side === 'left' ? '3px 0 0 3px' : '0 3px 3px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        padding: '0 3px',
        position: 'relative',
        cursor: 'default',
      }}
      title={`${code} — ${berth.length_m} m × ${berth.width_m} m (depth ${berth.depth_m} m)`}
    >
      {showLabel && (
        <span style={{ color: style.text, fontSize: 7, lineHeight: 1, opacity: 0.9 }}>
          {num}
        </span>
      )}
      {/* Water-line tick mark on the open end */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [side === 'left' ? 'left' : 'right']: 0,
          width: 1,
          height: '60%',
          backgroundColor: style.border,
          opacity: 0.4,
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}
