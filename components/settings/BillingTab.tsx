'use client'

import { cn } from '@/lib/utils'

type BillingTabProps = {
    currentPlan: string
}

type PlanTier = {
    name: string
    key: string
    price: string
    description: string
    features: string[]
    highlight?: boolean
}

const PLANS: PlanTier[] = [
    {
        name: 'Home',
        key: 'HOME',
        price: 'Free',
        description: 'For hobbyist hash makers and small-batch operators',
        features: [
            '10 batches per month',
            '1 facility',
            'Basic yield tracking',
            'Community support',
        ],
    },
    {
        name: 'Pro',
        key: 'PRO',
        price: '$29/mo',
        description: 'For dedicated processors with a single facility',
        features: [
            'Unlimited batches',
            '1 facility',
            'COA document storage',
            'AI assistant',
            'Equipment tracking',
            'Email support',
        ],
        highlight: true,
    },
    {
        name: 'Commercial',
        key: 'COMMERCIAL',
        price: '$99/mo',
        description: 'For multi-facility extraction operations',
        features: [
            'Everything in Pro',
            'Multi-facility support',
            'Team members & roles',
            'Compliance reporting',
            'Priority AI',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        key: 'ENTERPRISE',
        price: 'Custom',
        description: 'For large-scale and multi-state operations',
        features: [
            'Everything in Commercial',
            'API access',
            'METRC / BioTrackTHC integration',
            'Dedicated account manager',
            'Custom onboarding',
            'SLA guarantee',
        ],
    },
]

const PLAN_BADGE_STYLES: Record<string, string> = {
    HOME: 'bg-white/10 text-white/70',
    PRO: 'bg-primary/15 text-primary',
    COMMERCIAL: 'bg-amber-500/15 text-amber-400',
    ENTERPRISE: 'bg-purple-500/15 text-purple-400',
}

export function BillingTab({ currentPlan }: BillingTabProps) {
    const activePlan = PLANS.find((p) => p.key === currentPlan) ?? PLANS[0]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Billing</h3>
                <p className="text-sm text-muted mt-1">Manage your subscription and billing</p>
            </div>

            {/* Current plan card */}
            <div className="bg-surface-card border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-medium text-white">{activePlan.name} Plan</h4>
                            <span
                                className={cn(
                                    'px-2.5 py-0.5 text-xs font-semibold rounded-md',
                                    PLAN_BADGE_STYLES[currentPlan] ?? PLAN_BADGE_STYLES.HOME
                                )}
                            >
                                Active
                            </span>
                        </div>
                        <p className="text-sm text-muted">{activePlan.description}</p>
                    </div>
                    <p className="text-xl font-semibold text-white">{activePlan.price}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activePlan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                                <span
                                    className="material-symbols-outlined text-primary text-[16px]"
                                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'opsz' 16" }}
                                >
                                    check_circle
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Plan comparison */}
            <div>
                <h4 className="text-sm font-medium text-white mb-4">All Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.key === currentPlan
                        const isUpgrade =
                            PLANS.findIndex((p) => p.key === plan.key) >
                            PLANS.findIndex((p) => p.key === currentPlan)

                        return (
                            <div
                                key={plan.key}
                                className={cn(
                                    'bg-surface-card border rounded-xl p-5 flex flex-col',
                                    plan.highlight && !isCurrent
                                        ? 'border-primary/30'
                                        : isCurrent
                                            ? 'border-primary/50 ring-1 ring-primary/20'
                                            : 'border-white/[0.06]'
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-semibold text-white">{plan.name}</h5>
                                    {isCurrent ? (
                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            Current
                                        </span>
                                    ) : plan.key !== 'HOME' ? (
                                        <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                            Coming Soon
                                        </span>
                                    ) : null}
                                </div>
                                <p className="text-xl font-bold text-white mb-1">{plan.price}</p>
                                <p className="text-xs text-muted mb-4">{plan.description}</p>

                                <ul className="space-y-2 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs text-muted">
                                            <span
                                                className="material-symbols-outlined text-primary/60 text-[14px] mt-0.5 shrink-0"
                                                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'opsz' 14" }}
                                            >
                                                check
                                            </span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                    {isCurrent ? (
                                        <button
                                            disabled
                                            className="w-full rounded-lg px-4 py-2 text-sm font-medium bg-white/[0.06] text-muted cursor-not-allowed"
                                        >
                                            Current Plan
                                        </button>
                                    ) : plan.key !== 'HOME' ? (
                                        <button
                                            disabled
                                            className="w-full rounded-lg px-4 py-2 text-sm font-medium border border-amber-400/20 text-amber-400/60 cursor-not-allowed"
                                        >
                                            Coming Soon
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full rounded-lg px-4 py-2 text-sm font-medium border border-white/10 text-muted cursor-not-allowed"
                                        >
                                            Downgrade
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <p className="text-xs text-muted/50 mt-3 text-center">
                    Stripe integration coming soon. Contact support for plan changes.
                </p>
            </div>
        </div>
    )
}
