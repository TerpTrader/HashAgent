'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ProfileTabProps = {
    initialName: string
    email: string
    joinedAt: string
}

export function ProfileTab({ initialName, email, joinedAt }: ProfileTabProps) {
    const [name, setName] = useState(initialName)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const hasChanges = name !== initialName

    async function handleSave() {
        if (!hasChanges || saving) return
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to update profile' })
            } else {
                setMessage({ type: 'success', text: 'Profile updated' })
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
                <h3 className="text-lg font-medium text-white">Profile</h3>
                <p className="text-sm text-muted mt-1">Manage your personal information</p>
            </div>

            <div className="bg-surface-card border border-white/[0.06] rounded-xl p-6 space-y-5">
                {/* Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-white/70">
                        Display Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        placeholder="Your name"
                    />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">
                        Email
                    </label>
                    <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-muted">
                        {email}
                    </div>
                    <p className="text-xs text-muted/60">Email cannot be changed</p>
                </div>

                {/* Joined date (read-only) */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">
                        Member Since
                    </label>
                    <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-muted">
                        {new Date(joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
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

                {/* Save button */}
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
            </div>
        </div>
    )
}
