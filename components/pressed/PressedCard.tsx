'use client'

import Link from 'next/link'
import { cn, formatWeight, formatPercent } from '@/lib/utils'
import { Calendar, ChevronRight } from 'lucide-react'
import type { PressedBatchStatus } from '@/types'

interface PressedCardProps {
    id: string
    strain: string | null
    batchNumber: string
    pressDate: string
    inputWeightG: number
    finalWeightG: number | null
    processingLossPct: number | null
    status: PressedBatchStatus
    sourceBatchNumber: string | null
}

const STATUS_STYLES: Record<PressedBatchStatus, { bg: string; text: string; label: string }> = {
    PRESSING: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pressing' },
    COMPLETE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Complete' },
    ARCHIVED: { bg: 'bg-white/5', text: 'text-muted', label: 'Archived' },
}

function getLossColor(pct: number | null): string {
    if (pct == null) return 'text-muted'
    if (pct <= 5) return 'text-emerald-400'
    if (pct <= 15) return 'text-amber-400'
    return 'text-red-400'
}

export function PressedCard({
    id,
    strain,
    batchNumber,
    pressDate,
    inputWeightG,
    finalWeightG,
    processingLossPct,
    status,
    sourceBatchNumber,
}: PressedCardProps) {
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.PRESSING

    const formattedDate = new Date(pressDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <Link
            href={`/pressed/${id}`}
            className="group block rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10 hover:bg-surface-elevated hover:shadow-glow-sm"
        >
            {/* Top row: strain + status */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                        {strain ?? 'Unknown Strain'}
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
                    <p className="text-xs text-muted">Input</p>
                    <p className="mt-0.5 text-sm font-mono font-medium text-white">
                        {formatWeight(inputWeightG)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted">Final</p>
                    <p className="mt-0.5 text-sm font-mono font-medium text-white">
                        {formatWeight(finalWeightG)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted">Loss %</p>
                    <p className={cn('mt-0.5 text-sm font-mono font-medium', getLossColor(processingLossPct))}>
                        {formatPercent(processingLossPct)}
                    </p>
                </div>
            </div>

            {/* Bottom: source batch + date + arrow */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                    {sourceBatchNumber && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {sourceBatchNumber}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
        </Link>
    )
}
