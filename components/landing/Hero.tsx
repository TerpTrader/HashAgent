import Link from 'next/link'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import { DashboardMockup } from '@/components/landing/DashboardMockup'

export function Hero() {
    return (
        <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.12) 0%, transparent 70%)',
                }}
            />

            <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left column: copy */}
                    <ScrollReveal>
                        <div className="space-y-6">
                            <p className="text-xs tracking-[0.2em] uppercase text-primary/70 font-medium">
                                AI-Powered Hash Lab Management
                            </p>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
                                Your hash lab,
                                <br />
                                <span className="gradient-text">dialed in.</span>
                            </h1>

                            <p className="text-lg text-[#9ca3af] max-w-lg leading-relaxed">
                                Track every wash, press, and cure. AI-powered yield analytics
                                and equipment monitoring for solventless concentrate manufacturers.
                            </p>

                            {/* Credibility badge — Cherryblossom Belle */}
                            <div className="max-w-lg">
                                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                                    {/* Trophy accent */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="text-lg">🏆</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-muted uppercase tracking-wider leading-none mb-1">
                                            Built by award-winning hash maker
                                        </p>
                                        <p className="text-sm font-semibold text-white leading-tight">
                                            Cherryblossom Belle
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                                            <span className="text-[10px] font-medium text-primary/80 px-1.5 py-0.5 rounded bg-primary/[0.08]">
                                                Emerald Cup
                                            </span>
                                            <span className="text-[10px] font-medium text-primary/80 px-1.5 py-0.5 rounded bg-primary/[0.08]">
                                                Ego Clash
                                            </span>
                                            <span className="text-[10px] font-medium text-primary/80 px-1.5 py-0.5 rounded bg-primary/[0.08]">
                                                Dabadoo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-300 hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                                >
                                    Start Free
                                    <span className="text-white/60">&rarr;</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-6 py-3.5 text-sm font-medium text-[#9ca3af] hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all duration-300"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Right column: mockup */}
                    <ScrollReveal delay={0.15}>
                        <div className="lg:pl-4">
                            <DashboardMockup />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
