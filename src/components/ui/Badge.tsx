import { BookingStatus } from '@/types'

const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  upcoming:  'bg-amber-900/60 text-amber-300',
  active:    'bg-emerald-900/60 text-emerald-300',
  completed: 'bg-slate-700 text-slate-300',
  cancelled: 'bg-red-900/60 text-red-300',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${BOOKING_STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}
