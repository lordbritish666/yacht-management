import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BERTHS, BERTH_CATEGORY_LABELS } from '@/data/berths'
import { Anchor } from 'lucide-react'

export default async function BerthsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const groups = [
    { key: 'sailboat', label: 'A — Sailboats (8–12m)', color: 'text-sky-400' },
    { key: 'motor',    label: 'B — Motor Yachts (12–20m)', color: 'text-violet-400' },
    { key: 'large',    label: 'C — Large Yachts (20–35m)', color: 'text-amber-400' },
    { key: 'mega',     label: 'D — Megayachts (35–55m)', color: 'text-rose-400' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Berth Configuration</h1>
        <p className="text-sm text-slate-500 mt-0.5">30 berths across 4 categories. Contact your admin to modify berth specs.</p>
      </div>

      {groups.map(group => {
        const berths = BERTHS.filter(b => b.category === group.key)
        return (
          <div key={group.key} className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1f2937]">
              <Anchor size={14} className={group.color} />
              <h2 className={`text-sm font-semibold ${group.color}`}>{group.label}</h2>
              <span className="ml-auto text-xs text-slate-500">{berths.length} berths</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2937] text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Code</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Category</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Length (m)</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Width (m)</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Depth (m)</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {berths.map(b => (
                  <tr key={b.id} className="hover:bg-[#1f2937]/50">
                    <td className="px-5 py-2.5 font-medium text-white">{b.code}</td>
                    <td className="px-5 py-2.5 text-slate-400">{BERTH_CATEGORY_LABELS[b.category]}</td>
                    <td className="px-5 py-2.5 text-slate-300">{b.length_m}</td>
                    <td className="px-5 py-2.5 text-slate-300">{b.width_m}</td>
                    <td className="px-5 py-2.5 text-slate-300">{b.depth_m}</td>
                    <td className="px-5 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.is_active
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
