import { Check } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/landing/ScrollReveal'

type Tier = {
    name: string
    price: string
    period?: string
    description: string
    features: string[]
    cta: string
    ctaHref: string
    highlighted?: boolean
}

const tiers: Tier[] = [
    {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'For hobbyist hash makers',
        features: [
            '10 runs/month',
            '1 facility',
            'Basic analytics',
            'Community support',
        ],
        cta: 'Get Started',
        ctaHref: '/register',
    },
    {
        name: 'Pro',
        price: '$49',
        period: '/mo',
        description: 'For serious processors',
        features: [
            'Unlimited runs',
            '1 facility',
            'AI assistant',
            'COA storage',
            'Priority support',
        ],
        cta: 'Start Free Trial',
        ctaHref: '/register',
        highlighted: true,
    },
    {
        name: 'Commercial',
        price: '$149',
        period: '/mo',
        description: 'For multi-facility operations',
        features: [
            'Everything in Pro',
            'Multi-facility',
            'Team members',
            'Compliance reporting',
            'API access',
        ],
        cta: 'Start Free Trial',
        ctaHref: '/register',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large-scale operations',
        features: [
            'Everything in Commercial',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantee',
        ],
        cta: 'Contact Sales',
        ctaHref: '/contact',
    },
]

export function Pricing() {
    return (
        <section id="pricing" className="py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <ScrollReveal>
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-base text-[#9ca3af] mt-3">
                            Start free, upgrade when you&apos;re ready.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal staggerChildren>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative flex flex-col p-6 rounded-xl transition-all duration-300 ${
                                    tier.highlighted
                                        ? 'glow-border bg-white/[0.03]'
                                        : 'glass-card glass-card-hover'
                                }`}
                            >
                                {tier.highlighted && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full">
                                        Most Popular
                                    </span>
                                )}

                                <div className="mb-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                                        {tier.name}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">
                                            {tier.price}
                                        </span>
                                        {tier.period && (
                                            <span className="text-sm text-muted">{tier.period}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#9ca3af] mt-1.5">
                                        {tier.description}
                                    </p>
                                </div>

                                <ul className="space-y-2 mb-6 flex-1">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs text-[#9ca3af]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={tier.ctaHref}
                                    className={`block text-center text-sm font-medium py-2.5 rounded-lg transition-all duration-300 ${
                                        tier.highlighted
                                            ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]'
                                            : 'border border-white/[0.08] text-[#9ca3af] hover:text-white hover:border-white/[0.15]'
                                    }`}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
