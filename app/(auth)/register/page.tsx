'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [orgName, setOrgName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, orgName }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? 'Registration failed')
                setLoading(false)
                return
            }

            // Redirect to login
            router.push('/login?registered=true')
        } catch {
            setError('Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="text-2xl font-semibold text-white">
                        Hash Agent
                    </Link>
                    <p className="text-sm text-muted mt-2">Create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-accent-error/10 border border-accent-error/20 rounded-lg px-4 py-3 text-sm text-accent-error">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-xs font-medium text-muted mb-1.5">
                            Your name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-3 py-2.5 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            placeholder="Leo"
                        />
                    </div>

                    <div>
                        <label htmlFor="orgName" className="block text-xs font-medium text-muted mb-1.5">
                            Lab / Company name
                        </label>
                        <input
                            id="orgName"
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            placeholder="Hash Heaven Co."
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-email" className="block text-xs font-medium text-muted mb-1.5">
                            Email
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            placeholder="leo@hashagent.io"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-password" className="block text-xs font-medium text-muted mb-1.5">
                            Password
                        </label>
                        <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-3 py-2.5 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            placeholder="Min 8 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white rounded-lg transition-colors"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-xs text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
