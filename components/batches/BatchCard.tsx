'use client'

import Link from 'next/link'
import { cn, formatWeight, formatPercent } from '@/lib/utils'
import { Beaker, Calendar, ChevronRight } from 'lucide-react'
import type { HashBatchStatus, QualityTier } from '@/types'

// ─── Status badge styling ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    WASHING: { bg: 'bg-hash-washing/10', text: 'text-hash-washing', label: 'Washing' },
    DRYING: { bg: 'bg-hash-drying/10', text: 'text-hash-drying', label: 'Drying' },
    COMPLETE: { bg: 'bg-hash-complete/10', text: 'text-hash-complete', label: 'Complete' },
    ALLOCATED: { bg: 'bg-hash-allocated/10', text: 'text-hash-allocated', label: 'Allocated' },
    ARCHIVED: { bg: 'bg-white/5', text: 'text-muted', label: 'Archived' },
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    TIER_1: { bg: 'bg-micron-73/10', text: 'text-micron-73', label: 'Tier 1' },
    TIER_2: { bg: 'bg-micron-90/10', text: 'text-micron-90', label: 'Tier 2' },
    TIER_3: { bg: 'bg-micron-120/10', text: 'text-micron-120', label: 'Tier 3' },
}

interface BatchCardProps {
    id: string
    strain: string
    batchNumber: string
    washDate: string
    status: HashBatchStatus
    totalYieldG: number | null
    yieldPct: number | null
    qualityTier: QualityTier | null
}

export function BatchCard({
    id,
    strain,
    batchNumber,
    washDate,
    status,
    totalYieldG,
    yieldPct,
    qualityTier,
}: BatchCardProps) {
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.WASHING
    const tierStyle = qualityTier ? TIER_STYLES[qualityTier] : null

    const formattedDate = new Date(washDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <Link
            href={`/batches/${id}`}
            className="group block rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10 hover:bg-surface-elevated hover:shadow-glow-sm"
        >
            {/* Top row: strain + status */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                        {strain}
                    </h3>
                    <p className="mt-0.5 text-xs font-mono text-muted">{batchNumber}</p>
                </div>
                <span
                    className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        statusStyle.bg,
                        statusStyle.text
                    )}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Middle: metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                    <p className="text-xs text-muted">Yield</p>
                    <p className="mt-0.5 text-sm font-mono font-medium text-white">
                        {formatWeight(totalYieldG)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted">Yield %</p>
                    <p className="mt-0.5 text-sm font-mono font-medium text-white">
                        {formatPercent(yieldPct)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted">Quality</p>
                    {tierStyle ? (
                        <span
                            className={cn(
                                'mt-0.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
                                tierStyle.bg,
                                tierStyle.text
                            )}
                        >
                            {tierStyle.label}
                        </span>
                    ) : (
                        <p className="mt-0.5 text-sm text-muted">&mdash;</p>
                    )}
                </div>
            </div>

            {/* Bottom: date + arrow */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                </div>
                <ChevronRight className="h-4 w-4 text-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
        </Link>
    )
}
