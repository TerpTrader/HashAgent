'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
    const registered = searchParams.get('registered')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
            callbackUrl,
        })

        if (result?.error) {
            setError('Invalid email or password')
            setLoading(false)
        } else if (result?.url) {
            window.location.href = result.url
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
                    <p className="text-sm text-[#9ca3af]">Sign in to your lab</p>
                </div>

                {/* Success message after registration */}
                {registered && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary text-center">
                        Account created! Sign in to get started.
                    </div>
                )}

                {/* Glass card form */}
                <div className="glass-card p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="you@yourlab.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                                placeholder="Enter password"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
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
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[#9ca3af]">
                    No account?{' '}
                    <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
