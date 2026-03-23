import { createClient } from '@/lib/supabase/server'
import { MarinaMap } from '@/components/berths/MarinaMap'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { BerthWithStatus, DashboardStats, Booking } from '@/types'
import Link from 'next/link'
import { Plus, CalendarClock, CalendarCheck } from 'lucide-react'

export const revalidate = 30

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // Fire all independent queries in parallel
  const [
    { data: dbBerths },
    { data: activeBookings },
    { data: todayArrivals },
    { data: todayDepartures },
  ] = await Promise.all([
    supabase.from('berths').select('*').eq('is_active', true).order('code'),
    supabase.from('bookings').select('*, berth:berths(*), vessel_movements(*)')
      .in('status', ['active', 'upcoming'])
      .lte('arrival_date', today)
      .gte('departure_date', today),
    supabase.from('bookings').select('*, berth:berths(*)')
      .eq('arrival_date', today)
      .neq('status', 'cancelled')
      .order('arrival_date'),
    supabase.from('bookings').select('*, berth:berths(*)')
      .eq('departure_date', today)
      .neq('status', 'cancelled')
      .order('departure_date'),
  ])

  // Build berth status map
  const berthStatusMap = new Map<string, { status: string; booking?: Booking }>()
  for (const booking of (activeBookings ?? [])) {
    const movements: { type: string }[] = booking.vessel_movements ?? []
    const lastMovement = movements.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]

    let status = booking.status === 'upcoming' ? 'reserved' : 'occupied'
    if (booking.status === 'active' && lastMovement?.type === 'departure') {
      status = 'away'
    }
    berthStatusMap.set(booking.berth_id, { status, booking })
  }

  const berthsWithStatus: BerthWithStatus[] = (dbBerths ?? []).map(b => {
    const info = berthStatusMap.get(b.id)
    return {
      ...b,
      status: (info?.status ?? 'vacant') as any,
      current_booking: info?.booking,
    }
  })

  const stats: DashboardStats = {
    total: berthsWithStatus.length,
    occupied: berthsWithStatus.filter(b => b.status === 'occupied').length,
    vacant: berthsWithStatus.filter(b => b.status === 'vacant').length,
    reserved: berthsWithStatus.filter(b => b.status === 'reserved').length,
    away: berthsWithStatus.filter(b => b.status === 'away').length,
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Booking
        </Link>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Today panels + Berth map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Arrivals */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={15} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Today's Arrivals</h2>
            <span className="ml-auto text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">
              {todayArrivals?.length ?? 0}
            </span>
          </div>
          {todayArrivals?.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">No arrivals today</p>
          )}
          <div className="space-y-2">
            {todayArrivals?.map((b: any) => (
              <Link key={b.id} href={`/bookings/${b.id}`}
                className="block p-3 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors"
              >
                <p className="text-sm font-medium text-white">{b.vessel_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{b.berth?.code} · {b.owner_name}</p>
                <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded-full font-medium ${
                  b.status === 'active'
                    ? 'bg-emerald-900/60 text-emerald-300'
                    : 'bg-amber-900/60 text-amber-300'
                }`}>
                  {b.status === 'active' ? 'Checked In' : 'Pending'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Departures */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={15} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Today's Departures</h2>
            <span className="ml-auto text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full">
              {todayDepartures?.length ?? 0}
            </span>
          </div>
          {todayDepartures?.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">No departures today</p>
          )}
          <div className="space-y-2">
            {todayDepartures?.map((b: any) => (
              <Link key={b.id} href={`/bookings/${b.id}`}
                className="block p-3 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors"
              >
                <p className="text-sm font-medium text-white">{b.vessel_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{b.berth?.code} · {b.owner_name}</p>
                <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded-full font-medium ${
                  b.status === 'completed'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-emerald-900/60 text-emerald-300'
                }`}>
                  {b.status === 'completed' ? 'Departed' : 'Still In'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Status Legend</h2>
          <div className="space-y-2.5">
            {[
              { status: 'vacant', label: 'Vacant', dot: 'bg-slate-500' },
              { status: 'reserved', label: 'Reserved', dot: 'bg-amber-400' },
              { status: 'occupied', label: 'Occupied', dot: 'bg-emerald-400' },
              { status: 'away', label: 'Away (temp. departure)', dot: 'bg-violet-400' },
            ].map(s => (
              <div key={s.status} className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                <span className="text-sm text-slate-300">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-[#1f2937]">
            <p className="text-xs text-slate-500">
              Berth map is based on bookings in the database. Click any card for details.
            </p>
          </div>
        </div>
      </div>

      {/* Live Marina Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Live Berth Map</h2>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="text-white/40 font-black text-[10px]">✕</span> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 font-black text-[10px]">◆</span> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-violet-400 font-black text-[10px]">⇡</span> Away
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-slate-600 inline-block" /> Vacant
            </span>
          </div>
        </div>
        <MarinaMap berths={berthsWithStatus} />
      </div>

      {/* Berth status table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Berth Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Berth</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Vessel</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Owner</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Departure</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {berthsWithStatus.map(b => (
                <tr key={b.id} className="hover:bg-[#1f2937]/50">
                  <td className="px-4 py-2.5 font-medium text-white">{b.code}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {b.current_booking ? (
                      <a href={`/bookings/${b.current_booking.id}`} className="hover:text-white transition-colors">
                        {b.current_booking.vessel_name}
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">
                    {b.current_booking?.owner_name ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">
                    {b.current_booking
                      ? new Date(b.current_booking.departure_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {b.length_m}m × {b.width_m}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    vacant:   { label: 'Vacant',   cls: 'bg-slate-800 text-slate-400 border-slate-700' },
    reserved: { label: 'Reserved', cls: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
    occupied: { label: 'Occupied', cls: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' },
    away:     { label: 'Away',     cls: 'bg-violet-900/40 text-violet-300 border-violet-700/50' },
  }
  const s = map[status] ?? map.vacant
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${s.cls}`}>
      {s.label}
    </span>
  )
}
