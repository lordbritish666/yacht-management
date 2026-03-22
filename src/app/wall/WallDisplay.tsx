'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BerthWithStatus, DashboardStats, MovementType } from '@/types'
import { BERTHS, BERTH_CATEGORY_LABELS } from '@/data/berths'
import { Ship, Anchor, Clock, CheckCircle, Navigation, Circle, LogIn, LogOut, RotateCcw, CheckCheck } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  vacant:   'bg-slate-800 border-slate-700 text-slate-400',
  reserved: 'bg-amber-950 border-amber-800 text-amber-300',
  occupied: 'bg-emerald-950 border-emerald-800 text-emerald-300',
  away:     'bg-violet-950 border-violet-800 text-violet-300',
}

const STATUS_DOT: Record<string, string> = {
  vacant:   'bg-slate-600',
  reserved: 'bg-amber-400',
  occupied: 'bg-emerald-400',
  away:     'bg-violet-400',
}

const MOVEMENT_CONFIG: Record<MovementType, { icon: React.ElementType; cls: string; label: string }> = {
  checkin:   { icon: LogIn,     cls: 'text-emerald-400', label: 'Check-In' },
  departure: { icon: LogOut,    cls: 'text-violet-400',  label: 'Departure' },
  return:    { icon: RotateCcw, cls: 'text-sky-400',     label: 'Return' },
  checkout:  { icon: CheckCheck,cls: 'text-slate-400',   label: 'Checkout' },
}

const REFRESH_INTERVAL = 45_000 // 45 seconds

export function WallDisplay() {
  const [berths, setBerths] = useState<BerthWithStatus[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [arrivals, setArrivals] = useState<any[]>([])
  const [departures, setDepartures] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 30, occupied: 0, vacant: 30, reserved: 0, away: 0 })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]

    const [{ data: activeBookings }, { data: recentMovements }, { data: arrivalData }, { data: departureData }] =
      await Promise.all([
        supabase
          .from('bookings')
          .select('*, vessel_movements(*)')
          .in('status', ['active', 'upcoming'])
          .lte('arrival_date', today)
          .gte('departure_date', today),
        supabase
          .from('vessel_movements')
          .select('*, booking:bookings(vessel_name, berth:berths(code))')
          .order('timestamp', { ascending: false })
          .limit(20),
        supabase
          .from('bookings')
          .select('*, berth:berths(code)')
          .eq('arrival_date', today)
          .neq('status', 'cancelled')
          .order('created_at'),
        supabase
          .from('bookings')
          .select('*, berth:berths(code)')
          .eq('departure_date', today)
          .neq('status', 'cancelled')
          .order('created_at'),
      ])

    // Build berth status
    const statusMap = new Map<string, { status: string; booking?: any }>()
    for (const booking of (activeBookings ?? [])) {
      const mlist: any[] = booking.vessel_movements ?? []
      const last = mlist.sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]
      let status = booking.status === 'upcoming' ? 'reserved' : 'occupied'
      if (booking.status === 'active' && last?.type === 'departure') status = 'away'
      statusMap.set(booking.berth_id, { status, booking })
    }

    const berthsWithStatus: BerthWithStatus[] = BERTHS.map(b => ({
      ...b,
      status: (statusMap.get(b.id)?.status ?? 'vacant') as any,
      current_booking: statusMap.get(b.id)?.booking,
    }))

    setBerths(berthsWithStatus)
    setMovements(recentMovements ?? [])
    setArrivals(arrivalData ?? [])
    setDepartures(departureData ?? [])
    setStats({
      total: berthsWithStatus.length,
      occupied: berthsWithStatus.filter(b => b.status === 'occupied').length,
      vacant: berthsWithStatus.filter(b => b.status === 'vacant').length,
      reserved: berthsWithStatus.filter(b => b.status === 'reserved').length,
      away: berthsWithStatus.filter(b => b.status === 'away').length,
    })
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  const groups = [
    { key: 'sailboat', label: 'A — Sailboats' },
    { key: 'motor',    label: 'B — Motor Yachts' },
    { key: 'large',    label: 'C — Large Yachts' },
    { key: 'mega',     label: 'D — Megayachts' },
  ]

  return (
    <div className="min-h-screen bg-[#060d1a] text-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
            <Ship size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Telaga Marina</h1>
            <p className="text-xs text-slate-500 mt-0.5">Operations Room — Live View</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last updated</p>
          <p className="text-sm font-mono text-slate-300">
            {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Anchor, color: 'text-slate-400' },
          { label: 'Occupied', value: stats.occupied, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Vacant', value: stats.vacant, icon: Circle, color: 'text-slate-400' },
          { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'text-amber-400' },
          { label: 'Away', value: stats.away, icon: Navigation, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1929] border border-[#1a2a40] rounded-xl px-4 py-3">
            <div className={`flex items-center gap-1.5 mb-1 ${s.color}`}>
              <s.icon size={12} />
              <span className="text-[11px] font-medium">{s.label}</span>
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Berth map */}
        <div className="col-span-2 bg-[#0f1929] border border-[#1a2a40] rounded-xl p-4 space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Berth Map</h2>
          {groups.map(group => {
            const grouped = berths.filter(b => b.category === group.key)
            return (
              <div key={group.key}>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">{group.label}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {grouped.map(b => (
                    <div
                      key={b.id}
                      className={`border rounded-lg p-2 ${STATUS_COLORS[b.status]}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold">{b.code}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status]}`} />
                      </div>
                      {b.current_booking && (
                        <p className="text-[9px] truncate opacity-70">{b.current_booking.vessel_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Today's Arrivals */}
          <div className="bg-[#0f1929] border border-[#1a2a40] rounded-xl p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-amber-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Today's Arrivals</h2>
              <span className="ml-auto text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">{arrivals.length}</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-36">
              {arrivals.length === 0 && <p className="text-xs text-slate-600 text-center py-2">None today</p>}
              {arrivals.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-[#1a2a40] rounded-lg">
                  <div>
                    <p className="text-xs font-medium">{a.vessel_name}</p>
                    <p className="text-[10px] text-slate-500">{a.berth?.code}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    a.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                  }`}>
                    {a.status === 'active' ? 'In' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Departures */}
          <div className="bg-[#0f1929] border border-[#1a2a40] rounded-xl p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Navigation size={12} className="text-violet-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Today's Departures</h2>
              <span className="ml-auto text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full">{departures.length}</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-36">
              {departures.length === 0 && <p className="text-xs text-slate-600 text-center py-2">None today</p>}
              {departures.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 bg-[#1a2a40] rounded-lg">
                  <div>
                    <p className="text-xs font-medium">{d.vessel_name}</p>
                    <p className="text-[10px] text-slate-500">{d.berth?.code}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    d.status === 'completed' ? 'bg-slate-700 text-slate-300' : 'bg-sky-900/60 text-sky-300'
                  }`}>
                    {d.status === 'completed' ? 'Gone' : 'Due'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-[#0f1929] border border-[#1a2a40] rounded-xl p-4 flex-1">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Live Movement Feed</h2>
            <div className="space-y-1.5 overflow-y-auto max-h-48">
              {movements.length === 0 && <p className="text-xs text-slate-600 text-center py-2">No movements yet</p>}
              {movements.map((m: any) => {
                const cfg = MOVEMENT_CONFIG[m.type as MovementType]
                return (
                  <div key={m.id} className="flex items-start gap-2 p-2 bg-[#1a2a40] rounded-lg">
                    <cfg.icon size={11} className={`${cfg.cls} mt-0.5 shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate">
                        {m.booking?.vessel_name ?? '—'}
                        <span className="text-slate-500 font-normal"> · {m.booking?.berth?.code}</span>
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {cfg.label} · {new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-700">
        <span>Auto-refreshes every 45 seconds</span>
        <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
