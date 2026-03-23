import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { Booking } from '@/types'

export const revalidate = 30

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select('*, berth:berths(code, name, category)')
    .order('arrival_date', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (q) {
    query = query.ilike('vessel_name', `%${q}%`)
  }

  const { data: bookings } = await query

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const currentTab = status ?? 'all'

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Bookings</h1>
        <Link
          href="/bookings/new"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#111827] border border-[#1f2937] rounded-lg p-1 flex-wrap">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={`/bookings?status=${tab.value}${q ? `&q=${q}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentTab === tab.value
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search vessel name…"
            className="w-full bg-[#111827] border border-[#1f2937] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
          <input type="hidden" name="status" value={currentTab} />
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937] text-left">
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Vessel</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Berth</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Owner</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Arrival</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Departure</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {bookings?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-sm">
                  No bookings found
                </td>
              </tr>
            )}
            {bookings?.map((b: any) => (
              <tr key={b.id} className="hover:bg-[#1f2937] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/bookings/${b.id}`} className="font-medium text-white hover:text-sky-400 transition-colors">
                    {b.vessel_name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{b.vessel_type} · {b.vessel_length_m}m</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{b.berth?.code ?? '—'}</td>
                <td className="px-4 py-3 text-slate-300">
                  <span>{b.owner_name}</span>
                  <p className="text-xs text-slate-500">{b.owner_contact}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{formatDate(b.arrival_date)}</td>
                <td className="px-4 py-3 text-slate-300">{formatDate(b.departure_date)}</td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
