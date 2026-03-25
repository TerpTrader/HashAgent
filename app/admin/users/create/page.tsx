'use client'

import { useState } from 'react'
import { UserPlus, RefreshCw, Copy, Check, AlertCircle } from 'lucide-react'

type CreatedAccount = {
    user: { id: string; name: string; email: string }
    org: { id: string; name: string; plan: string }
    tempPassword: string
}

const PLANS = ['HOME', 'PRO', 'COMMERCIAL', 'ENTERPRISE'] as const

function generatePassword(length = 12): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length]
    }
    return password
}

export default function CreateVipPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [orgName, setOrgName] = useState('')
    const [plan, setPlan] = useState<(typeof PLANS)[number]>('PRO')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [created, setCreated] = useState<CreatedAccount | null>(null)
    const [copied, setCopied] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, orgName, plan }),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.error ?? 'Something went wrong')
                return
            }

            setCreated(json.data)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleGeneratePassword() {
        setPassword(generatePassword())
    }

    async function handleCopyCredentials() {
        if (!created) return
        const text = `Email: ${created.user.email}\nPassword: ${created.tempPassword}`
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleReset() {
        setName('')
        setEmail('')
        setPassword('')
        setOrgName('')
        setPlan('PRO')
        setCreated(null)
        setError(null)
    }

    // Success state
    if (created) {
        return (
            <div className="space-y-6 max-w-lg">
                <div>
                    <h1 className="text-2xl font-bold text-white">VIP Account Created</h1>
                    <p className="text-sm text-muted mt-1">
                        The account is ready. Share the credentials below.
                    </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Account created successfully
                    </div>

                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-muted">Name</p>
                            <p className="text-sm text-white">{created.user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Email</p>
                            <p className="text-sm text-white font-mono">{created.user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Password</p>
                            <p className="text-sm text-white font-mono">{created.tempPassword}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Organization</p>
                            <p className="text-sm text-white">
                                {created.org.name}{' '}
                                <span className="text-xs text-muted">({created.org.plan})</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopyCredentials}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy Credentials
                            </>
                        )}
                    </button>

                    <p className="text-xs text-muted">
                        The user will be prompted to change their password on first login.
                    </p>
                </div>

                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-white border border-white/10 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Create Another
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold text-white">Create VIP Account</h1>
                <p className="text-sm text-muted mt-1">
                    Create a pre-verified account with an organization and OWNER role.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Smith"
                        className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john@company.com"
                        className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Min 8 characters"
                            className="flex-1 px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white font-mono placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                        />
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-white border border-white/10 rounded-lg hover:bg-white/[0.03] transition-colors whitespace-nowrap"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Generate
                        </button>
                    </div>
                </div>

                {/* Org Name */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                        Lab / Company Name
                    </label>
                    <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        placeholder="Acme Extracts"
                        className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    />
                </div>

                {/* Plan */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Plan</label>
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value as (typeof PLANS)[number])}
                        className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    >
                        {PLANS.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <UserPlus className="w-4 h-4" />
                    )}
                    {loading ? 'Creating...' : 'Create VIP Account'}
                </button>
            </form>
        </div>
    )
}
