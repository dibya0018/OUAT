import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchTeam, patchTeamMember } from '../services/adminService'

export default function AdminTeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchTeam()
      setMembers(res.members ?? [])
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = async (userId, body) => {
    try {
      await patchTeamMember(userId, body)
    } catch (err) {
      window.alert(err.message || 'Could not update this member')
    }
    load()
  }

  return (
    <>
      <AdminPageHeader title="Team" onRefresh={load} refreshing={loading} />
      <p className="mb-4 max-w-2xl text-sm text-admin-muted">
        Assign each member one access level. <strong className="text-admin-gold">Full Admin</strong> can use this
        panel and manage roles.
      </p>
      <div className="admin-panel overflow-x-auto">
        <table className="admin-table admin-table--stack admin-table--team w-full md:min-w-[640px]">
          <thead>
            <tr>
              <th>Email</th>
              <th>Access</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId}>
                <td>{m.email}</td>
                <td>
                  <select
                    value={m.role}
                    onChange={(e) => update(m.userId, { role: e.target.value })}
                    className="rounded-full border border-admin-border bg-admin-panel-2 px-2 py-1 text-xs"
                  >
                    <option value="customer">Customer — Storefront only</option>
                    <option value="admin">Full Admin</option>
                  </select>
                </td>
                <td>
                  <span className={m.active ? 'text-green-400' : 'text-red-400'}>
                    {m.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-xs text-admin-muted">
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleString('en-IN') : '—'}
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs"
                    onClick={() => update(m.userId, { active: !m.active })}
                  >
                    {m.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
