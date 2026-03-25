import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 max-w-6xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2">
                    <Logo size="sm" />
                    <span className="text-white font-semibold text-lg">Hash Agent</span>
                </Link>
                <Link
                    href="/"
                    className="text-sm text-muted hover:text-white transition-colors"
                >
                    &larr; Back to home
                </Link>
            </nav>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(20,184,166,0.08) 0%, transparent 70%)',
                        }}
                    />

                    <div className="relative space-y-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            Get in touch
                        </h1>

                        <p className="text-[#9ca3af] text-lg leading-relaxed">
                            Have questions about Hash Agent? Want to discuss enterprise
                            pricing, partnerships, or just say hello? We&apos;d love to
                            hear from you.
                        </p>

                        {/* Email card */}
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 space-y-4">
                            <p className="text-sm text-muted uppercase tracking-wider font-medium">
                                Email us at
                            </p>
                            <a
                                href="mailto:admin@terpagent.com"
                                className="inline-block text-2xl sm:text-3xl font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                admin@terpagent.com
                            </a>
                            <p className="text-sm text-[#9ca3af]">
                                We typically respond within 24 hours.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div className="flex items-center justify-center gap-6 pt-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-300 hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                            >
                                Start Free &rarr;
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm text-muted hover:text-white transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-xs text-muted">
                &copy; {new Date().getFullYear()} Hash Agent. All rights reserved.
            </footer>
        </div>
    )
}
