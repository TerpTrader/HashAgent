'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

type Member = {
    id: string
    role: 'OWNER' | 'ADMIN' | 'GROWER' | 'VIEWER'
    user: {
        id: string
        name: string | null
        email: string
        createdAt: string
    }
}

type TeamTabProps = {
    currentUserId: string
    currentRole: string
}

const ROLE_STYLES: Record<string, string> = {
    OWNER: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    ADMIN: 'bg-primary/15 text-primary border-primary/20',
    GROWER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    VIEWER: 'bg-white/10 text-white/60 border-white/10',
}

const ROLE_OPTIONS = ['OWNER', 'ADMIN', 'GROWER', 'VIEWER'] as const
const INVITE_ROLE_OPTIONS = ['ADMIN', 'GROWER', 'VIEWER'] as const

export function TeamTab({ currentUserId, currentRole }: TeamTabProps) {
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Invite form
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'GROWER' | 'VIEWER'>('GROWER')
    const [inviting, setInviting] = useState(false)

    const canManage = currentRole === 'OWNER' || currentRole === 'ADMIN'

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch('/api/settings/team')
            const json = await res.json()
            if (res.ok && json.data) {
                setMembers(json.data)
            }
        } catch {
            // Silently fail — the user sees the loading state resolve with no data
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMembers()
    }, [fetchMembers])

    async function handleInvite() {
        if (!inviteEmail || inviting) return
        setInviting(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to add member' })
            } else {
                setMessage({ type: 'success', text: `${inviteEmail} added to team` })
                setInviteEmail('')
                fetchMembers()
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setInviting(false)
        }
    }

    async function handleRemove(memberId: string, memberName: string) {
        if (!confirm(`Remove ${memberName} from the organization?`)) return
        setMessage(null)

        try {
            const res = await fetch('/api/settings/team', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to remove member' })
            } else {
                setMessage({ type: 'success', text: `${memberName} removed` })
                fetchMembers()
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        }
    }

    async function handleRoleChange(memberId: string, newRole: string) {
        setMessage(null)

        try {
            const res = await fetch(`/api/settings/team/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to update role' })
            } else {
                fetchMembers()
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Team</h3>
                <p className="text-sm text-muted mt-1">Manage who has access to your organization</p>
            </div>

            {/* Message */}
            {message && (
                <p
                    className={cn(
                        'text-sm',
                        message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    )}
                >
                    {message.text}
                </p>
            )}

            {/* Invite form (OWNER/ADMIN only) */}
            {canManage && (
                <div className="bg-surface-card border border-white/[0.06] rounded-xl p-5">
                    <h4 className="text-sm font-medium text-white mb-4">Add Team Member</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Email address"
                            className="flex-1 bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInvite()
                            }}
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'GROWER' | 'VIEWER')}
                            className="bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        >
                            {INVITE_ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r === 'GROWER' ? 'Processor' : r.charAt(0) + r.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleInvite}
                            disabled={!inviteEmail || inviting}
                            className={cn(
                                'rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                                inviteEmail
                                    ? 'bg-primary hover:bg-primary/90 text-white'
                                    : 'bg-white/[0.06] text-muted cursor-not-allowed'
                            )}
                        >
                            {inviting ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                    <p className="text-xs text-muted/60 mt-2">
                        The user must have an account before they can be added.
                    </p>
                </div>
            )}

            {/* Members table */}
            <div className="bg-surface-card border border-white/[0.06] rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                        <p className="text-sm text-muted mt-2">Loading team...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted">No team members found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left font-medium text-muted/70 px-4 py-3">Name</th>
                                    <th className="text-left font-medium text-muted/70 px-4 py-3 hidden sm:table-cell">Email</th>
                                    <th className="text-left font-medium text-muted/70 px-4 py-3">Role</th>
                                    <th className="text-left font-medium text-muted/70 px-4 py-3 hidden md:table-cell">Joined</th>
                                    {canManage && (
                                        <th className="text-right font-medium text-muted/70 px-4 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => {
                                    const isCurrentUser = member.user.id === currentUserId
                                    const displayName = member.user.name ?? member.user.email

                                    return (
                                        <tr
                                            key={member.id}
                                            className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium truncate max-w-[140px]">
                                                        {displayName}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="text-[10px] font-medium text-muted/50 bg-white/[0.06] px-1.5 py-0.5 rounded">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Show email below name on mobile */}
                                                <p className="text-xs text-muted/60 sm:hidden mt-0.5 truncate">
                                                    {member.user.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-muted hidden sm:table-cell truncate max-w-[200px]">
                                                {member.user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {canManage && !isCurrentUser ? (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                        className={cn(
                                                            'px-2 py-0.5 text-xs font-medium rounded border appearance-none cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-primary/50',
                                                            ROLE_STYLES[member.role] ?? ROLE_STYLES.VIEWER
                                                        )}
                                                    >
                                                        {ROLE_OPTIONS.map((r) => (
                                                            <option key={r} value={r} className="bg-[#151515] text-white">
                                                                {r === 'GROWER' ? 'Processor' : r.charAt(0) + r.slice(1).toLowerCase()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            'px-2 py-0.5 text-xs font-medium rounded border',
                                                            ROLE_STYLES[member.role] ?? ROLE_STYLES.VIEWER
                                                        )}
                                                    >
                                                        {member.role === 'GROWER' ? 'Processor' : member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted hidden md:table-cell">
                                                {new Date(member.user.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            {canManage && (
                                                <td className="px-4 py-3 text-right">
                                                    {!isCurrentUser && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemove(member.id, displayName)
                                                            }
                                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
