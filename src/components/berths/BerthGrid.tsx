import { BerthWithStatus } from '@/types'
import { BerthCard } from './BerthCard'

interface BerthGridProps {
  berths: BerthWithStatus[]
  onSelect?: (berth: BerthWithStatus) => void
}

const GROUPS = [
  { key: 'sailboat', label: 'A — Sailboats (8–12m)' },
  { key: 'motor',    label: 'B — Motor Yachts (12–20m)' },
  { key: 'large',    label: 'C — Large Yachts (20–35m)' },
  { key: 'mega',     label: 'D — Megayachts (35–55m)' },
]

export function BerthGrid({ berths, onSelect }: BerthGridProps) {
  return (
    <div className="space-y-6">
      {GROUPS.map(group => {
        const grouped = berths.filter(b => b.category === group.key)
        if (!grouped.length) return null
        return (
          <div key={group.key}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {group.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {grouped.map(berth => (
                <BerthCard
                  key={berth.id}
                  berth={berth}
                  onClick={onSelect ? () => onSelect(berth) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
