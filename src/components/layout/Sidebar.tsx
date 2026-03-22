'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Anchor,
  Users,
  Monitor,
  LogOut,
  Ship,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types'

interface SidebarProps {
  role: UserRole
  fullName: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'harbour_master', 'staff'] },
  { href: '/bookings', label: 'Bookings', icon: BookOpen, roles: ['superadmin', 'harbour_master', 'staff'] },
  { href: '/berths', label: 'Berths', icon: Anchor, roles: ['superadmin'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['superadmin'] },
  { href: '/wall', label: 'Wall Display', icon: Monitor, roles: ['superadmin', 'harbour_master', 'staff'] },
]

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  harbour_master: 'Harbour Master',
  staff: 'Operations Staff',
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const allowed = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#111827] border-r border-[#1f2937] min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1f2937]">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
          <Ship size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">Telaga Marina</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Operations</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {allowed.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#1f2937]">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-white truncate">{fullName}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{roleLabels[role]}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
