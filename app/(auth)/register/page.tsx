'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'

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

            // Handle non-JSON responses (e.g. 500 HTML error pages)
            const contentType = res.headers.get('content-type') ?? ''
            if (!contentType.includes('application/json')) {
                const text = await res.text()
                console.error('Non-JSON response:', res.status, text.slice(0, 200))
                setError(`Server error (${res.status}). Please try again.`)
                setLoading(false)
                return
            }

            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? 'Registration failed')
                setLoading(false)
                return
            }

            router.push('/login?registered=true')
        } catch (err) {
            console.error('Registration error:', err)
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 70%)',
                }}
            />

            <div className="w-full max-w-sm space-y-8 relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4">
                    <Logo size="lg" href="/" />
                    <p className="text-sm text-[#9ca3af]">Create your account</p>
                </div>

                {/* Glass card form */}
                <div className="glass-card p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Your name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="orgName" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Lab / Company name
                            </label>
                            <input
                                id="orgName"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="Hash Heaven Co."
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Email
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="you@yourlab.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Password
                            </label>
                            <input
                                id="reg-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="Min 8 characters"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white rounded-lg transition-all hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-white/30 leading-relaxed">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-primary/60 hover:text-primary/80">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-primary/60 hover:text-primary/80">Privacy Policy</Link>.
                    </p>
                </div>

                <p className="text-center text-xs text-[#9ca3af]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
