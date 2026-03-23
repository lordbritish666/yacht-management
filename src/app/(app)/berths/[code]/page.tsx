import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BookingStatusBadge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ArrowLeft, Anchor, Ruler, Waves, CalendarRange, Clock } from 'lucide-react'

export const revalidate = 0

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  sailboat: { label: 'Sailboat Berth',   color: 'text-sky-400' },
  motor:    { label: 'Motor Yacht Berth', color: 'text-violet-400' },
  large:    { label: 'Large Yacht Berth', color: 'text-amber-400' },
  mega:     { label: 'Megayacht Berth',  color: 'text-rose-400' },
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  vacant:   { label: 'Vacant',   cls: 'bg-slate-800 text-slate-300 border-slate-600' },
  reserved: { label: 'Reserved', cls: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
  occupied: { label: 'Occupied', cls: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' },
  away:     { label: 'Away',     cls: 'bg-violet-900/40 text-violet-300 border-violet-700/50' },
}

export default async function BerthDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Decode URL (A-01 comes through fine but just in case)
  const berthCode = decodeURIComponent(code)

  const { data: berth } = await supabase
    .from('berths')
    .select('*')
    .eq('code', berthCode)
    .single()

  if (!berth) notFound()

  const today = new Date().toISOString().split('T')[0]

  // Fire both queries in parallel
  const [{ data: bookings }, { data: activeBooking }] = await Promise.all([
    supabase.from('bookings').select('*')
      .eq('berth_id', berth.id)
      .order('arrival_date', { ascending: false }),
    supabase.from('bookings').select('*, vessel_movements(*)')
      .eq('berth_id', berth.id)
      .in('status', ['active', 'upcoming'])
      .lte('arrival_date', today)
      .gte('departure_date', today)
      .maybeSingle(),
  ])

  let liveStatus = 'vacant'
  if (activeBooking) {
    const movements: { type: string; timestamp: string }[] = activeBooking.vessel_movements ?? []
    const last = movements.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]
    liveStatus = activeBooking.status === 'upcoming'
      ? 'reserved'
      : last?.type === 'departure' ? 'away' : 'occupied'
  }

  const cat = CATEGORY_LABELS[berth.category] ?? { label: berth.category, color: 'text-slate-300' }
  const statusStyle = STATUS_STYLES[liveStatus]

  const totalBookings   = bookings?.length ?? 0
  const completedStays  = bookings?.filter(b => b.status === 'completed').length ?? 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/berths" className="text-slate-400 hover:text-white transition-colors mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Berth {berth.code}</h1>
            <span className={`text-sm font-medium ${cat.color}`}>{cat.label}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusStyle.cls}`}>
              {statusStyle.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {berth.length_m} m × {berth.width_m} m · {berth.depth_m} m depth
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="space-y-4">

          {/* Specs */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Specifications
            </h2>
            <Spec icon={Anchor}      label="Code"     value={berth.code} />
            <Spec icon={Ruler}       label="Length"   value={`${berth.length_m} m`} />
            <Spec icon={Ruler}       label="Width"    value={`${berth.width_m} m`} />
            <Spec icon={Waves}       label="Depth"    value={`${berth.depth_m} m`} />
            <Spec icon={CalendarRange} label="Total bookings" value={String(totalBookings)} />
            <Spec icon={Clock}       label="Completed stays"  value={String(completedStays)} />
          </div>

          {/* Notes */}
          {berth.notes && (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Notes</p>
              <p className="text-sm text-slate-300">{berth.notes}</p>
            </div>
          )}
        </div>

        {/* Right: current + history */}
        <div className="lg:col-span-2 space-y-4">

          {/* Current booking */}
          {activeBooking ? (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Current Booking</h2>
                <BookingStatusBadge status={activeBooking.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Vessel"   value={activeBooking.vessel_name} />
                <Info label="Type"     value={activeBooking.vessel_type} />
                <Info label="Length"   value={`${activeBooking.vessel_length_m} m`} />
                <Info label="Owner"    value={activeBooking.owner_name} />
                <Info label="Contact"  value={activeBooking.owner_contact} />
                <Info label="Arrival"  value={fmtDate(activeBooking.arrival_date)} />
                <Info label="Departure" value={fmtDate(activeBooking.departure_date)} />
                {activeBooking.notes && (
                  <div className="col-span-2">
                    <Info label="Notes" value={activeBooking.notes} />
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#1f2937]">
                <Link
                  href={`/bookings/${activeBooking.id}`}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  View full booking & movement log →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex items-center justify-center h-28">
              <p className="text-sm text-slate-600">No active booking — berth is vacant</p>
            </div>
          )}

          {/* Booking history */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1f2937]">
              <h2 className="text-sm font-semibold text-white">Booking History</h2>
            </div>
            {!bookings?.length ? (
              <p className="text-sm text-slate-600 text-center py-8">No bookings yet</p>
            ) : (
              <div className="divide-y divide-[#1f2937]">
                {bookings.map((b: any) => (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-[#1f2937]/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{b.vessel_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.owner_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">
                        {fmtDate(b.arrival_date)} – {fmtDate(b.departure_date)}
                      </p>
                      <BookingStatusBadge status={b.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={13} className="text-slate-600 shrink-0" />
      <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm text-slate-200 mt-0.5">{value}</p>
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
