'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type OrganizationTabProps = {
    orgName: string
    plan: string
    memberCount: number
    isOwner: boolean
}

const PLAN_STYLES: Record<string, string> = {
    HOME: 'bg-white/10 text-white/70',
    PRO: 'bg-primary/15 text-primary',
    COMMERCIAL: 'bg-amber-500/15 text-amber-400',
    ENTERPRISE: 'bg-purple-500/15 text-purple-400',
}

export function OrganizationTab({ orgName, plan, memberCount, isOwner }: OrganizationTabProps) {
    const [name, setName] = useState(orgName)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const hasChanges = name !== orgName

    async function handleSave() {
        if (!hasChanges || saving || !isOwner) return
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to update organization' })
            } else {
                setMessage({ type: 'success', text: 'Organization updated' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Organization</h3>
                <p className="text-sm text-muted mt-1">Manage your organization settings</p>
            </div>

            <div className="bg-surface-card border border-white/[0.06] rounded-xl p-6 space-y-5">
                {/* Org name */}
                <div className="space-y-2">
                    <label htmlFor="org-name" className="block text-sm font-medium text-white/70">
                        Organization Name
                    </label>
                    {isOwner ? (
                        <input
                            id="org-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    ) : (
                        <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-muted">
                            {orgName}
                        </div>
                    )}
                    {!isOwner && (
                        <p className="text-xs text-muted/60">Only the organization owner can change this</p>
                    )}
                </div>

                {/* Plan and member count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/70">Plan</label>
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'px-2.5 py-1 text-xs font-semibold rounded-md',
                                    PLAN_STYLES[plan] ?? PLAN_STYLES.HOME
                                )}
                            >
                                {plan}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/70">Members</label>
                        <p className="text-sm text-white">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </p>
                    </div>
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

                {/* Save (owner only) */}
                {isOwner && (
                    <div className="pt-2">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className={cn(
                                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                hasChanges
                                    ? 'bg-primary hover:bg-primary/90 text-white'
                                    : 'bg-white/[0.06] text-muted cursor-not-allowed'
                            )}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
