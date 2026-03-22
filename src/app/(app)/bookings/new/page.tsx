import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BERTHS, BERTH_CATEGORY_LABELS } from '@/data/berths'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewBookingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function createBooking(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const arrival = formData.get('arrival_date') as string
    const departure = formData.get('departure_date') as string

    // Check double-booking
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('berth_id', formData.get('berth_id'))
      .not('status', 'in', '("cancelled","completed")')
      .or(`arrival_date.lte.${departure},departure_date.gte.${arrival}`)

    if (conflicts && conflicts.length > 0) {
      // In a real app you'd return an error — for now redirect with error param
      redirect('/bookings/new?error=double-booking')
    }

    const { data: booking } = await supabase.from('bookings').insert({
      berth_id: formData.get('berth_id'),
      vessel_name: formData.get('vessel_name'),
      vessel_type: formData.get('vessel_type'),
      vessel_length_m: parseFloat(formData.get('vessel_length_m') as string),
      owner_name: formData.get('owner_name'),
      owner_contact: formData.get('owner_contact'),
      arrival_date: arrival,
      departure_date: departure,
      notes: formData.get('notes'),
      status: 'upcoming',
      created_by: user.id,
    }).select().single()

    redirect(`/bookings/${booking?.id}`)
  }

  // Group berths by category for select
  const grouped = BERTHS.reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = []
    acc[b.category].push(b)
    return acc
  }, {} as Record<string, typeof BERTHS>)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/bookings" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">New Booking</h1>
      </div>

      <form action={createBooking} className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Vessel Name" name="vessel_name" required />
          <Field label="Vessel Type" name="vessel_type" placeholder="Sailing Yacht, Motor Yacht…" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Vessel Length (m)" name="vessel_length_m" type="number" step="0.1" min="1" required />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Berth Assignment <span className="text-red-400">*</span></label>
            <select
              name="berth_id"
              required
              className="w-full bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">Select a berth…</option>
              {Object.entries(grouped).map(([cat, berths]) => (
                <optgroup key={cat} label={BERTH_CATEGORY_LABELS[cat]}>
                  {berths.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.length_m}m × {b.width_m}m
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Owner / Skipper Name" name="owner_name" required />
          <Field label="Contact (phone or email)" name="owner_contact" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Arrival Date" name="arrival_date" type="date" required />
          <Field label="Departure Date" name="departure_date" type="date" required />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 resize-none"
            placeholder="Optional notes…"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Create Booking
          </button>
          <Link
            href="/bookings"
            className="bg-[#1f2937] hover:bg-[#374151] text-slate-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, name, type = 'text', placeholder, required, step, min,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  step?: string
  min?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="w-full bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
      />
    </div>
  )
}
