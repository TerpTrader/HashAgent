'use client'

import { cn } from '@/lib/utils'
import { Beaker, TrendingUp, Award, Scale } from 'lucide-react'

type KpiData = {
    totalHashBatches: number
    totalRosinBatches: number
    avgHashYieldPct: number
    totalOutputG: number
    bestStrain: { strain: string; avgYieldPct: number } | null
}

export function KpiSummary({ data }: { data: KpiData }) {
    const cards = [
        {
            label: 'Total Batches',
            value: `${data.totalHashBatches + data.totalRosinBatches}`,
            sub: `${data.totalHashBatches} hash · ${data.totalRosinBatches} rosin`,
            icon: Beaker,
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            label: 'Avg Hash Yield',
            value: `${data.avgHashYieldPct.toFixed(2)}%`,
            sub: 'Across all strains',
            icon: TrendingUp,
            color: data.avgHashYieldPct >= 4 ? 'text-hash-complete' : 'text-accent-warning',
            bg: data.avgHashYieldPct >= 4 ? 'bg-hash-complete/10' : 'bg-accent-warning/10',
        },
        {
            label: 'Best Strain',
            value: data.bestStrain?.strain ?? '—',
            sub: data.bestStrain ? `${data.bestStrain.avgYieldPct.toFixed(2)}% avg yield` : 'No data yet',
            icon: Award,
            color: 'text-micron-73',
            bg: 'bg-micron-73/10',
        },
        {
            label: 'Total Output',
            value: data.totalOutputG >= 1000
                ? `${(data.totalOutputG / 1000).toFixed(1)}kg`
                : `${data.totalOutputG.toFixed(0)}g`,
            sub: 'Dried resin produced',
            icon: Scale,
            color: 'text-accent-purple',
            bg: 'bg-accent-purple/10',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl border border-white/5 bg-surface-card p-5 transition-colors hover:border-white/10"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', card.bg)}>
                            <card.icon className={cn('h-4 w-4', card.color)} />
                        </div>
                        <p className="text-xs text-muted">{card.label}</p>
                    </div>
                    <p className={cn('text-2xl font-bold font-mono', card.color)}>{card.value}</p>
                    <p className="mt-1 text-xs text-muted">{card.sub}</p>
                </div>
            ))}
        </div>
    )
}
