import React, { useState, useEffect } from 'react'

type Role = 'owner' | 'admin' | 'member' | 'billing' | 'viewer'

interface Member {
  user_id: string
  email: string
  role: Role
  joined_at: string
  status: string
}

interface Org {
  id: string
  name: string
  owner_domain: string
  seats: { total: number; used: number; available: number }
  members: Member[]
  sub_accounts: any[]
  plan: string
}

const roleLabels: Record<Role, string> = {
  owner: '👑 Owner',
  admin: '🛡️ Admin',
  billing: '💰 Billing',
  member: '👤 Member',
  viewer: '👁️ Viewer',
}

const roleColors: Record<Role, string> = {
  owner: 'bg-yellow-100 text-yellow-700',
  admin: 'bg-blue-100 text-blue-700',
  billing: 'bg-green-100 text-green-700',
  member: 'bg-gray-100 text-gray-700',
  viewer: 'bg-slate-100 text-slate-600',
}

export const TeamWorkspace = () => {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [activeOrg, setActiveOrg] = useState<Org | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('member')
  const [newSubName, setNewSubName] = useState('')
  const [newSubDomain, setNewSubDomain] = useState('')

  useEffect(() => {
    fetch('/api/v1/team/my-orgs')
      .then(r => r.json())
      .then(d => {
        setOrgs(d.orgs || [])
        if (d.orgs?.length) setActiveOrg(d.orgs[0])
      })
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrg) return
    await fetch('/api/v1/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: activeOrg.id,
        invitee_email: inviteEmail,
        role: inviteRole,
      }),
    })
    setInviteEmail('')
    // Refresh
    fetch(`/api/v1/team/${activeOrg.id}`).then(r => r.json()).then(setActiveOrg)
  }

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from team?`)) return
    await fetch(`/api/v1/team/remove-member?org_id=${activeOrg!.id}&target_email=${email}`, { method: 'POST' })
    setActiveOrg(prev => prev ? {
      ...prev,
      members: prev.members.filter(m => m.email !== email),
      seats: { ...prev.seats, used: prev.seats.used - 1, available: prev.seats.available + 1 },
    } : null)
  }

  if (!activeOrg) return <div className="p-12 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🔐 Team & Sub-Accounts</h1>

      {/* Org Switcher */}
      {orgs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => setActiveOrg(org)}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeOrg.id === org.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {/* Seats Overview */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">{activeOrg.name}</h2>
          <span className="text-sm text-gray-500">Plan: {activeOrg.plan}</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Seats</span>
              <span className={activeOrg.seats.available === 0 ? 'text-red-600 font-bold' : ''}>
                {activeOrg.seats.used} / {activeOrg.seats.total} used
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  activeOrg.seats.available === 0 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(activeOrg.seats.used / activeOrg.seats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{activeOrg.seats.available}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
        </div>
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-3">✉️ Invite Team Member</h3>
        <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 min-w-[200px] p-2 border rounded-lg"
            required
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as Role)}
            className="p-2 border rounded-lg"
          >
            <option value="member">👤 Member</option>
            <option value="admin">🛡️ Admin</option>
            <option value="billing">💰 Billing</option>
            <option value="viewer">👁️ Viewer</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <h3 className="font-semibold p-4 border-b">👥 Members ({activeOrg.members.length})</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeOrg.members.map(m => (
              <tr key={m.user_id} className="border-t">
                <td className="p-3 font-mono">{m.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[m.role]}`}>
                    {roleLabels[m.role]}
                  </span>
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {new Date(m.joined_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(m.email)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sub-Accounts */}
      {activeOrg.sub_accounts.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-3">🏗️ Sub-Accounts (Billed by Parent)</h3>
          <div className="space-y-3">
            {activeOrg.sub_accounts.map(sub => (
              <div key={sub.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-xs text-gray-500">{sub.domain} · {sub.seats_allocated} seats</p>
                </div>
                <button className="text-sm text-blue-600 hover:underline">Open →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Sub-Account */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-3">➕ Create Sub-Account</h3>
        <p className="text-xs text-gray-500 mb-3">Billing is shared — parent pays all sub-account usage</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Sub-account name"
            value={newSubName}
            onChange={e => setNewSubName(e.target.value)}
            className="p-2 border rounded-lg"
          />
          <input
            placeholder="sub.company.com"
            value={newSubDomain}
            onChange={e => setNewSubDomain(e.target.value)}
            className="p-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => alert('Sub-account creation — ready!')}
          className="mt-3 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Create & Link to Parent Billing
        </button>
      </div>
    </div>
  )
}
