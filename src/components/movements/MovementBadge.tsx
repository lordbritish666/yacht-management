import { MovementType } from '@/types'
import { LogIn, LogOut, RotateCcw, CheckCheck } from 'lucide-react'

const CONFIG: Record<MovementType, { label: string; icon: React.ElementType; cls: string }> = {
  checkin:   { label: 'Check-In',  icon: LogIn,      cls: 'bg-emerald-900/60 text-emerald-300' },
  departure: { label: 'Departure', icon: LogOut,      cls: 'bg-violet-900/60 text-violet-300' },
  return:    { label: 'Return',    icon: RotateCcw,   cls: 'bg-sky-900/60 text-sky-300' },
  checkout:  { label: 'Checkout',  icon: CheckCheck,  cls: 'bg-slate-700 text-slate-300' },
}

export function MovementBadge({ type }: { type: MovementType }) {
  const { label, icon: Icon, cls } = CONFIG[type]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  )
}
