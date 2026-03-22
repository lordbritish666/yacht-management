import { BerthWithStatus } from '@/types'
import { BERTH_CATEGORY_LABELS } from '@/data/berths'
import { Anchor } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  vacant:   'bg-slate-800 border-slate-700 text-slate-400',
  reserved: 'bg-amber-950/50 border-amber-800/50 text-amber-300',
  occupied: 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300',
  away:     'bg-violet-950/50 border-violet-800/50 text-violet-300',
}

const STATUS_DOT: Record<string, string> = {
  vacant:   'bg-slate-500',
  reserved: 'bg-amber-400',
  occupied: 'bg-emerald-400',
  away:     'bg-violet-400',
}

const STATUS_LABELS: Record<string, string> = {
  vacant:   'Vacant',
  reserved: 'Reserved',
  occupied: 'Occupied',
  away:     'Away',
}

interface BerthCardProps {
  berth: BerthWithStatus
  onClick?: () => void
  compact?: boolean
}

export function BerthCard({ berth, onClick, compact = false }: BerthCardProps) {
  const style = STATUS_STYLES[berth.status] ?? STATUS_STYLES.vacant

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left border rounded-xl p-3 transition-all ${style} ${
        onClick ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold tracking-wide">{berth.code}</span>
        <span className="flex items-center gap-1 text-[10px] font-medium shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[berth.status]}`} />
          {STATUS_LABELS[berth.status]}
        </span>
      </div>

      {!compact && (
        <>
          <p className="text-[11px] text-slate-500 mt-1">
            {BERTH_CATEGORY_LABELS[berth.category]} · {berth.length_m}m
          </p>
          {berth.current_booking && (
            <p className="text-[11px] mt-1.5 font-medium truncate text-current opacity-80">
              {berth.current_booking.vessel_name}
            </p>
          )}
        </>
      )}
    </button>
  )
}
