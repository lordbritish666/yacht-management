import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { MovementBadge } from '@/components/movements/MovementBadge'
import { MovementSubmitButton } from '@/components/movements/MovementFormButton'
import { MovementType, BookingStatus } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Ship, Anchor, User, Phone, Calendar, FileText } from 'lucide-react'

export const revalidate = 0

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, berth:berths(*)')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const { data: movements } = await supabase
    .from('vessel_movements')
    .select('*, recorded_by_profile:profiles(full_name, role)')
    .eq('booking_id', id)
    .order('timestamp', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  // Determine what actions are available
  const lastMovement = movements?.[0]
  const canCheckin = booking.status === 'upcoming' && lastMovement?.type !== 'checkin'
  const canLogDeparture = booking.status === 'active' && lastMovement?.type !== 'departure'
  const canLogReturn = booking.status === 'active' && lastMovement?.type === 'departure'
  const canCheckout = booking.status === 'active' && lastMovement?.type !== 'departure'
  const canCancel = ['upcoming', 'active'].includes(booking.status) &&
    ['superadmin', 'harbour_master'].includes(profile?.role ?? '')

  // Server actions
  async function recordMovement(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const type = formData.get('type') as MovementType
    const isCheckout = type === 'checkout'

    await supabase.from('vessel_movements').insert({
      booking_id: id,
      berth_id: booking.berth_id,
      type,
      reason: formData.get('reason') || null,
      notes: formData.get('notes') || null,
      recorded_by: user.id,
    })

    // Update booking status
    if (type === 'checkin') {
      await supabase.from('bookings').update({ status: 'active' }).eq('id', id)
    } else if (isCheckout) {
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)
    }

    redirect(`/bookings/${id}`)
  }

  async function cancelBooking() {
    'use server'
    const supabase = await createClient()
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    redirect(`/bookings/${id}`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/bookings" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white">{booking.vessel_name}</h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{booking.berth?.code} · {booking.vessel_type} · {booking.vessel_length_m}m</p>
          </div>
        </div>
        {canCancel && (
          <form action={cancelBooking}>
            <button
              type="submit"
              className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel Booking
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Detail icon={Ship} label="Vessel" value={`${booking.vessel_name} (${booking.vessel_type})`} />
              <Detail icon={Anchor} label="Berth" value={`${booking.berth?.code} — ${booking.berth?.length_m}m`} />
              <Detail icon={User} label="Owner" value={booking.owner_name} />
              <Detail icon={Phone} label="Contact" value={booking.owner_contact} />
              <Detail icon={Calendar} label="Arrival" value={formatDate(booking.arrival_date)} />
              <Detail icon={Calendar} label="Departure" value={formatDate(booking.departure_date)} />
            </div>
            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-[#1f2937]">
                <div className="flex items-start gap-2 text-slate-400">
                  <FileText size={13} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Movement Log */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Movement History</h2>
            {movements?.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No movements recorded yet</p>
            ) : (
              <div className="space-y-3">
                {movements?.map((m: any) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-[#1f2937] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <MovementBadge type={m.type as MovementType} />
                        <span className="text-xs text-slate-500">
                          {new Date(m.timestamp).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {m.reason && <p className="text-xs text-slate-400 mt-1">{m.reason}</p>}
                      {m.notes && <p className="text-xs text-slate-500 mt-0.5">{m.notes}</p>}
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0">
                      {m.recorded_by_profile?.full_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="space-y-4">
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Log Movement</h2>
              <div className="space-y-2">
                {canCheckin && (
                  <MovementForm
                    action={recordMovement}
                    type="checkin"
                    label="Check-In"
                    buttonClass="bg-emerald-600 hover:bg-emerald-500"
                    showReason={false}
                  />
                )}
                {canLogDeparture && (
                  <MovementForm
                    action={recordMovement}
                    type="departure"
                    label="Log Departure"
                    buttonClass="bg-violet-600 hover:bg-violet-500"
                    reasonLabel="Reason (e.g. sunset cruise)"
                    showReason
                  />
                )}
                {canLogReturn && (
                  <MovementForm
                    action={recordMovement}
                    type="return"
                    label="Log Return"
                    buttonClass="bg-sky-600 hover:bg-sky-500"
                    showReason={false}
                  />
                )}
                {canCheckout && (
                  <MovementForm
                    action={recordMovement}
                    type="checkout"
                    label="Final Checkout"
                    buttonClass="bg-slate-600 hover:bg-slate-500"
                    showReason={false}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={13} className="text-slate-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function MovementForm({
  action, type, label, buttonClass, showReason, reasonLabel,
}: {
  action: (formData: FormData) => Promise<void>
  type: MovementType
  label: string
  buttonClass: string
  showReason: boolean
  reasonLabel?: string
}) {
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="type" value={type} />
      {showReason && (
        <input
          name="reason"
          placeholder={reasonLabel ?? 'Reason…'}
          className="w-full bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
        />
      )}
      <MovementSubmitButton label={label} buttonClass={buttonClass} />
    </form>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
