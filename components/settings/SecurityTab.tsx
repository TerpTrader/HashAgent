'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type SecurityTabProps = {
    lastLoginAt: string | null
}

export function SecurityTab({ lastLoginAt }: SecurityTabProps) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const passwordsMatch = newPassword === confirmPassword
    const isValid = currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch

    async function handleChangePassword() {
        if (!isValid || saving) return
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/settings/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const json = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: json.error ?? 'Failed to change password' })
            } else {
                setMessage({ type: 'success', text: 'Password changed successfully' })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
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
                <h3 className="text-lg font-medium text-white">Security</h3>
                <p className="text-sm text-muted mt-1">Manage your password and security settings</p>
            </div>

            {/* Last login */}
            {lastLoginAt && (
                <div className="bg-surface-card border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                    <span
                        className="material-symbols-outlined text-primary text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}
                    >
                        schedule
                    </span>
                    <div>
                        <p className="text-sm text-white/70">Last login</p>
                        <p className="text-sm text-white">
                            {new Date(lastLoginAt).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                </div>
            )}

            {/* Change password */}
            <div className="bg-surface-card border border-white/[0.06] rounded-xl p-6 space-y-5">
                <h4 className="text-sm font-medium text-white">Change Password</h4>

                {/* Current password */}
                <div className="space-y-2">
                    <label htmlFor="current-password" className="block text-sm font-medium text-white/70">
                        Current Password
                    </label>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        placeholder="Enter current password"
                    />
                </div>

                {/* New password */}
                <div className="space-y-2">
                    <label htmlFor="new-password" className="block text-sm font-medium text-white/70">
                        New Password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        placeholder="Minimum 8 characters"
                    />
                    {newPassword.length > 0 && newPassword.length < 8 && (
                        <p className="text-xs text-amber-400">Password must be at least 8 characters</p>
                    )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-white/70">
                        Confirm New Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-surface-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        placeholder="Re-enter new password"
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
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

                {/* Submit */}
                <div className="pt-2">
                    <button
                        onClick={handleChangePassword}
                        disabled={!isValid || saving}
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                            isValid
                                ? 'bg-primary hover:bg-primary/90 text-white'
                                : 'bg-white/[0.06] text-muted cursor-not-allowed'
                        )}
                    >
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}
