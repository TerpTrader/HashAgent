'use client'

import { cn, formatWeight, formatPercent } from '@/lib/utils'
import type { RosinBatchStatus, RosinProductType } from '@/types'

interface RosinCardProps {
    id: string
    strain: string
    batchNumber: string
    processDate: string
    productType: RosinProductType
    rosinYieldWeightG: number | null
    rosinYieldPct: number | null
    status: RosinBatchStatus
    companyProcessedFor: string | null
}

const STATUS_STYLES: Record<RosinBatchStatus, { label: string; className: string }> = {
    PRESSING: { label: 'Pressing', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    POST_PROCESSING: { label: 'Post Processing', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    DECARB: { label: 'Decarb', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    COMPLETE: { label: 'Complete', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ARCHIVED: { label: 'Archived', className: 'bg-white/5 text-muted border-white/10' },
}

const PRODUCT_TYPE_LABELS: Record<RosinProductType, string> = {
    FULL_PRESS: 'Full Press',
    BADDER: 'Badder',
    VAPE: 'Vape',
    LIVE_ROSIN: 'Live Rosin',
    COLD_CURE: 'Cold Cure',
}

function getYieldColor(pct: number | null): string {
    if (pct == null) return 'text-muted'
    if (pct >= 70) return 'text-emerald-400'
    if (pct >= 50) return 'text-amber-400'
    return 'text-red-400'
}

export function RosinCard({
    id,
    strain,
    batchNumber,
    processDate,
    productType,
    rosinYieldWeightG,
    rosinYieldPct,
    status,
    companyProcessedFor,
}: RosinCardProps) {
    const statusStyle = STATUS_STYLES[status]
    const formattedDate = new Date(processDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <a
            href={`/rosin/${id}`}
            className="group block rounded-xl border border-white/5 bg-surface-card p-5 transition-all hover:border-white/10 hover:bg-white/[0.03]"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {strain}
                    </h3>
                    <p className="mt-0.5 text-xs font-mono text-muted">{batchNumber}</p>
                </div>
                <span className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    statusStyle.className
                )}>
                    {statusStyle.label}
                </span>
            </div>

            {/* Yield */}
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-xs text-muted">Yield</p>
                    <p className={cn('text-xl font-bold', getYieldColor(rosinYieldPct))}>
                        {rosinYieldPct != null ? formatPercent(rosinYieldPct) : '--'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-white">
                        {rosinYieldWeightG != null ? formatWeight(rosinYieldWeightG) : '--'}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    {PRODUCT_TYPE_LABELS[productType]}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted">
                    {companyProcessedFor && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {companyProcessedFor}
                        </span>
                    )}
                    <span>{formattedDate}</span>
                </div>
            </div>
        </a>
    )
}
