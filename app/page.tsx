import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 h-16 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-white">Hash Agent</span>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">BETA</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-muted hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                            Your hash lab,
                            <br />
                            <span className="text-primary">dialed in.</span>
                        </h1>
                        <p className="text-lg text-muted max-w-lg mx-auto leading-relaxed">
                            AI-powered batch tracking, yield analytics, and equipment monitoring
                            for solventless concentrate manufacturers.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                        >
                            Start Free
                            <span className="text-primary/60">&rarr;</span>
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-muted hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                        >
                            Log in
                        </Link>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12">
                        <FeatureCard
                            title="Batch Tracking"
                            description="Bubble hash, rosin, pressed hash — full traceability from input to output."
                        />
                        <FeatureCard
                            title="Yield Analytics"
                            description="Track yield by strain, micron grade, and operator. Know what works."
                        />
                        <FeatureCard
                            title="AI Assistant"
                            description="Log batches by voice, snap scale photos, get process recommendations."
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="flex items-center justify-center px-6 h-16 border-t border-white/5">
                <p className="text-xs text-muted">
                    Hash Agent &middot; A TerpAgent product
                </p>
            </footer>
        </div>
    )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-surface-card border border-white/5 rounded-xl p-5 text-left">
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-muted leading-relaxed">{description}</p>
        </div>
    )
}
