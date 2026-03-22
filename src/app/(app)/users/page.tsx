import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types'
import { UserPlus } from 'lucide-react'

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  harbour_master: 'Harbour Master',
  staff: 'Operations Staff',
}

const ROLE_STYLES: Record<UserRole, string> = {
  superadmin: 'bg-rose-900/60 text-rose-300',
  harbour_master: 'bg-sky-900/60 text-sky-300',
  staff: 'bg-slate-700 text-slate-300',
}

export const revalidate = 0

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')

  async function inviteUser(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const email = formData.get('email') as string
    const role = formData.get('role') as UserRole
    const full_name = formData.get('full_name') as string

    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role }
    })

    redirect('/users')
  }

  async function updateRole(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const userId = formData.get('user_id') as string
    const role = formData.get('role') as UserRole

    await supabase.from('profiles').update({ role }).eq('id', userId)
    redirect('/users')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage staff access and roles.</p>
      </div>

      {/* Invite */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={14} className="text-sky-400" />
          <h2 className="text-sm font-semibold text-white">Invite New User</h2>
        </div>
        <form action={inviteUser} className="flex flex-col sm:flex-row gap-3">
          <input
            name="full_name"
            required
            placeholder="Full name"
            className="flex-1 bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="flex-1 bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
          <select
            name="role"
            className="bg-[#1f2937] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
          >
            <option value="staff">Operations Staff</option>
            <option value="harbour_master">Harbour Master</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937]">
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Name</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Email</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Role</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Joined</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {profiles?.map((p: any) => (
              <tr key={p.id} className="hover:bg-[#1f2937]/50">
                <td className="px-5 py-3 font-medium text-white">{p.full_name}</td>
                <td className="px-5 py-3 text-slate-400">{p.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLES[p.role as UserRole]}`}>
                    {ROLE_LABELS[p.role as UserRole]}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs">
                  {new Date(p.created_at).toLocaleDateString('en-GB')}
                </td>
                <td className="px-5 py-3">
                  <form action={updateRole} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={p.id} />
                    <select
                      name="role"
                      defaultValue={p.role}
                      className="bg-[#1f2937] border border-[#374151] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="staff">Staff</option>
                      <option value="harbour_master">Harbour Master</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
