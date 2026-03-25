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
                                Developed by Emerald Cup, Ego Clash, and Dabadoo winning Hash Maker: Cherryblossom Belle.
                            </p>

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
