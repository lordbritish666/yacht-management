'use client'

import { useState, useEffect, ReactNode } from 'react'
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
  Menu,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types'

interface SidebarProps {
  role: UserRole
  fullName: string
  children: ReactNode
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

export function Sidebar({ role, fullName, children }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setOpen(!mobile)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const allowed = navItems.filter(item => item.roles.includes(role))

  const navContent = (
    <div style={{ width: isMobile ? 256 : 240 }} className="flex flex-col h-full">
      {/* Logo + close button */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <Ship size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Telaga Marina</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Operations</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allowed.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setOpen(false)}
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
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="flex flex-col bg-[#111827] border-r border-[#1f2937]"
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 200ms ease',
              }
            : {
                width: open ? 240 : 0,
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'width 200ms ease',
              }
        }
      >
        {navContent}
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto bg-[#0a0f1e]"
        style={{ paddingTop: isMobile ? 56 : 0 }}
      >
        {children}
      </main>

      {/* Mobile top bar */}
      {isMobile && (
        <header
          className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-[#1f2937] bg-[#111827] px-4"
          style={{ height: 56 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <Ship size={14} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-white">Telaga Marina</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>
      )}

      {/* Desktop: hamburger when sidebar is collapsed */}
      {!isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-30 rounded-lg border border-[#1f2937] bg-[#111827] p-2 text-slate-400 transition-colors hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu size={16} />
        </button>
      )}
    </div>
  )
}
