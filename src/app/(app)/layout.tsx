import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { UserRole } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile is missing, auto-create it rather than causing a redirect loop
  let resolvedProfile = profile
  if (!resolvedProfile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email!, full_name: user.email!, role: 'staff' })
      .select()
      .single()
    resolvedProfile = newProfile
  }

  if (!resolvedProfile) redirect('/login')

  return (
    <Sidebar role={resolvedProfile.role as UserRole} fullName={resolvedProfile.full_name}>
      {children}
    </Sidebar>
  )
}
