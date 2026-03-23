'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Calendar, ChevronRight, ClipboardCheck } from 'lucide-react'

interface CleaningLogCardProps {
    id: string
    logNumber: string
    weekOf: string
    entryCount: number
    completedCount: number
}

export function CleaningLogCard({
    id,
    logNumber,
    weekOf,
    entryCount,
    completedCount,
}: CleaningLogCardProps) {
    const formattedWeekOf = new Date(weekOf).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    const progressPct = entryCount > 0 ? (completedCount / entryCount) * 100 : 0
    const isComplete = entryCount > 0 && completedCount === entryCount
    const isEmpty = entryCount === 0

    return (
        <Link
            href={`/cleaning/${id}`}
            className="group block rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10 hover:bg-surface-elevated hover:shadow-glow-sm"
        >
            {/* Top row: log number + status */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                        {logNumber}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">Week of {formattedWeekOf}</p>
                </div>
                <span
                    className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        isComplete
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isEmpty
                              ? 'bg-white/5 text-muted'
                              : 'bg-amber-500/10 text-amber-400'
                    )}
                >
                    {isComplete ? 'Complete' : isEmpty ? 'Empty' : 'In Progress'}
                </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>{completedCount}/{entryCount} days complete</span>
                    <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isComplete
                                ? 'bg-emerald-500'
                                : progressPct > 0
                                  ? 'bg-amber-500'
                                  : 'bg-white/10'
                        )}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Bottom: icon + arrow */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <ClipboardCheck className="h-3 w-3" />
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </div>
                <ChevronRight className="h-4 w-4 text-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
        </Link>
    )
}
