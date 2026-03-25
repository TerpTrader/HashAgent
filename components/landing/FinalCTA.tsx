import Link from 'next/link'
import { ScrollReveal } from '@/components/landing/ScrollReveal'

export function FinalCTA() {
    return (
        <section className="relative py-20 sm:py-28 overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(20,184,166,0.08) 0%, transparent 70%)',
                }}
            />

            <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <ScrollReveal>
                    <div className="text-center space-y-5">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                            Ready to dial in your lab?
                        </h2>
                        <p className="text-base sm:text-lg text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
                            Join 50+ hash labs already using Hash Agent to track,
                            analyze, and optimize.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all duration-300 hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                            >
                                Start Free
                                <span className="text-white/60">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
