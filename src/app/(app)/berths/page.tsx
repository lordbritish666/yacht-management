import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MarinaMap } from '@/components/berths/MarinaMap'
import { BerthWithStatus } from '@/types'

export const revalidate = 30

const STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  sailboat: { bg: 'rgba(8,40,80,0.92)',  border: '#2563eb', text: '#93c5fd', label: 'Pier A — Sailboats'   },
  motor:    { bg: 'rgba(25,10,55,0.92)', border: '#7c3aed', text: '#c4b5fd', label: 'Pier B — Motor Yachts' },
  large:    { bg: 'rgba(28,16,0,0.92)',  border: '#d97706', text: '#fcd34d', label: 'Pier C — Large Yachts' },
  mega:     { bg: 'rgba(28,5,5,0.92)',   border: '#dc2626', text: '#fca5a5', label: 'Pier D — Megayachts'   },
}

export default async function BerthsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: berths }, { data: activeBookings }] = await Promise.all([
    supabase.from('berths').select('*').eq('is_active', true).order('code'),
    supabase.from('bookings')
      .select('*, berth:berths(*), vessel_movements(*)')
      .in('status', ['active', 'upcoming'])
      .lte('arrival_date', today)
      .gte('departure_date', today),
  ])

  const berthStatusMap = new Map<string, { status: string; booking?: any }>()
  for (const booking of (activeBookings ?? [])) {
    const movements: { type: string }[] = booking.vessel_movements ?? []
    const lastMovement = movements.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]
    let status = booking.status === 'upcoming' ? 'reserved' : 'occupied'
    if (booking.status === 'active' && lastMovement?.type === 'departure') status = 'away'
    berthStatusMap.set(booking.berth_id, { status, booking })
  }

  const berthsWithStatus: BerthWithStatus[] = (berths ?? []).map(b => {
    const info = berthStatusMap.get(b.id)
    return { ...b, status: (info?.status ?? 'vacant') as any, current_booking: info?.booking }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Berth Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Top-down marina layout — berth sizes are proportional to real vessel dimensions.
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
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: s.border }} />
            {s.label}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-600">Scale: 1 m = 3 px</span>
      </div>

      <MarinaMap berths={berthsWithStatus} />

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
                const s = STYLES[b.category]
                return (
                  <tr key={b.code} className="hover:bg-[#1f2937]/50">
                    <td className="px-4 py-2 font-medium text-white">{b.code}</td>
                    <td className="px-4 py-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium border"
                        style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
                      >
                        {s.label.split(' — ')[1]}
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
