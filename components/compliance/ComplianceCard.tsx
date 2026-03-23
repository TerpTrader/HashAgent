'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, FileWarning, UserX, TestTube } from 'lucide-react'
import type { ComplianceIssue } from '@/lib/metrc-utils'

const ISSUE_CONFIG: Record<string, { icon: typeof AlertTriangle; label: string; color: string; bg: string }> = {
    missing_source_uid: {
        icon: FileWarning,
        label: 'Missing Source UID',
        color: 'text-accent-error',
        bg: 'bg-accent-error/10',
    },
    missing_product_uid: {
        icon: FileWarning,
        label: 'Missing Product UID',
        color: 'text-accent-error',
        bg: 'bg-accent-error/10',
    },
    unsigned_batch: {
        icon: UserX,
        label: 'Unsigned Batch',
        color: 'text-accent-warning',
        bg: 'bg-accent-warning/10',
    },
    missing_qa_allocation: {
        icon: TestTube,
        label: 'No QA Sample',
        color: 'text-accent-warning',
        bg: 'bg-accent-warning/10',
    },
    incomplete_signoff: {
        icon: UserX,
        label: 'Incomplete Sign-off',
        color: 'text-accent-warning',
        bg: 'bg-accent-warning/10',
    },
}

const BATCH_TYPE_PATHS: Record<string, string> = {
    hash: '/batches',
    rosin: '/rosin',
    pressed: '/pressed',
}

export function ComplianceCard({ issue }: { issue: ComplianceIssue }) {
    const config = ISSUE_CONFIG[issue.type] ?? ISSUE_CONFIG.incomplete_signoff
    const Icon = config.icon
    const detailPath = `${BATCH_TYPE_PATHS[issue.batchType] ?? '/batches'}/${issue.batchId}`

    return (
        <a
            href={detailPath}
            className="group flex items-start gap-4 rounded-xl border border-white/5 bg-surface-card p-4 transition-all hover:border-white/10 hover:bg-white/[0.03]"
        >
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider', config.color)}>
                        {config.label}
                    </span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-muted">
                        {issue.batchType}
                    </span>
                    {issue.severity === 'high' && (
                        <span className="rounded bg-accent-error/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-error">
                            High
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm font-medium text-white group-hover:text-primary transition-colors">
                    {issue.strain} — {issue.batchNumber}
                </p>
                <p className="mt-0.5 text-xs text-muted">{issue.description}</p>
            </div>
        </a>
    )
}
