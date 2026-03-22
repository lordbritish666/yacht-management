import { DashboardStats } from '@/types'
import { Anchor, CheckCircle, Clock, Navigation, Circle } from 'lucide-react'

interface StatsBarProps {
  stats: DashboardStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Total Berths', value: stats.total, icon: Anchor, color: 'text-slate-400' },
    { label: 'Occupied', value: stats.occupied, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Vacant', value: stats.vacant, icon: Circle, color: 'text-slate-400' },
    { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'text-amber-400' },
    { label: 'Away', value: stats.away, icon: Navigation, color: 'text-violet-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.label} className="bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3">
          <div className={`flex items-center gap-2 mb-1 ${item.color}`}>
            <item.icon size={14} />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
