import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Hash, Scale, FileText, UserCheck, Pencil } from 'lucide-react'
import { ExportActions } from '@/components/shared/ExportActions'
import { formatWeight, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PressedBatchStatus } from '@/types'

export const metadata = {
    title: 'Pressed Hash Detail',
}

const STATUS_STYLES: Record<PressedBatchStatus, { bg: string; text: string; label: string }> = {
    PRESSING: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pressing' },
    COMPLETE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Complete' },
    ARCHIVED: { bg: 'bg-white/5', text: 'text-muted', label: 'Archived' },
}

export default async function PressedDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batch = await db.pressedBatch.findFirst({
        where: { id, orgId: session.orgId },
        include: { sourceHashBatch: { select: { id: true, strain: true, batchNumber: true } } },
    })

    if (!batch) notFound()

    const statusStyle = STATUS_STYLES[batch.status as PressedBatchStatus] ?? STATUS_STYLES.PRESSING
    const displayStrain = batch.strain ?? batch.sourceHashBatch.strain
    const processingLossG = batch.processingLossG
    const processingLossPct = batch.processingLossPct

    const formattedPressDate = new Date(batch.pressDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <div className="animate-fade-in mx-auto max-w-3xl">
            {/* Back link */}
            <Link
                href="/pressed"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Pressed Hash
            </Link>

            {/* Header */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-white">{displayStrain}</h1>
                        <span
                            className={cn(
                                'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
                                statusStyle.bg,
                                statusStyle.text
                            )}
                        >
                            {statusStyle.label}
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm font-mono text-muted">{batch.batchNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/pressed/${id}/edit`}
                        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </Link>
                    <ExportActions
                        pdfUrl={`/api/pressed/${id}/pdf`}
                        filename={`${batch.batchNumber}-${displayStrain.replace(/\s+/g, '_')}-pressed.pdf`}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-surface-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Scale className="h-3.5 w-3.5" />
                        Input Weight
                    </div>
                    <p className="mt-2 text-lg font-mono font-semibold text-white">
                        {formatWeight(batch.inputWeightG)}
                    </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Scale className="h-3.5 w-3.5" />
                        Final Weight
                    </div>
                    <p className="mt-2 text-lg font-mono font-semibold text-white">
                        {formatWeight(batch.finalWeightG)}
                    </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Scale className="h-3.5 w-3.5" />
                        Processing Loss
                    </div>
                    <p className="mt-2 text-lg font-mono font-semibold text-white">
                        {formatWeight(processingLossG)}
                    </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Scale className="h-3.5 w-3.5" />
                        Loss %
                    </div>
                    <p className={cn(
                        'mt-2 text-lg font-mono font-semibold',
                        processingLossPct == null
                            ? 'text-muted'
                            : processingLossPct <= 5
                                ? 'text-emerald-400'
                                : processingLossPct <= 15
                                    ? 'text-amber-400'
                                    : 'text-red-400'
                    )}>
                        {formatPercent(processingLossPct)}
                    </p>
                </div>
            </div>

            {/* Details Section */}
            <div className="mt-6 rounded-xl border border-white/5 bg-surface-card p-6">
                <h2 className="text-sm font-medium text-white">Details</h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="flex items-center gap-1.5 text-xs text-muted">
                            <Calendar className="h-3.5 w-3.5" />
                            Press Date
                        </dt>
                        <dd className="mt-1 text-sm text-white">{formattedPressDate}</dd>
                    </div>
                    <div>
                        <dt className="flex items-center gap-1.5 text-xs text-muted">
                            <Hash className="h-3.5 w-3.5" />
                            Microns Used
                        </dt>
                        <dd className="mt-1 text-sm text-white">{batch.micronsUsed || '---'}</dd>
                    </div>
                    <div>
                        <dt className="flex items-center gap-1.5 text-xs text-muted">
                            <FileText className="h-3.5 w-3.5" />
                            METRC UID
                        </dt>
                        <dd className="mt-1 text-sm font-mono text-white">{batch.metrcUid || '---'}</dd>
                    </div>
                    <div>
                        <dt className="flex items-center gap-1.5 text-xs text-muted">
                            <FileText className="h-3.5 w-3.5" />
                            Notes
                        </dt>
                        <dd className="mt-1 text-sm text-white">{batch.notes || '---'}</dd>
                    </div>
                </dl>
            </div>

            {/* Source Hash Batch */}
            <div className="mt-6 rounded-xl border border-white/5 bg-surface-card p-6">
                <h2 className="text-sm font-medium text-white">Source Hash Batch</h2>
                <div className="mt-3">
                    <Link
                        href={`/batches/${batch.sourceHashBatch.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                    >
                        <span className="font-medium">{batch.sourceHashBatch.strain}</span>
                        <span className="font-mono text-xs text-muted">{batch.sourceHashBatch.batchNumber}</span>
                    </Link>
                </div>
            </div>

            {/* Sign-off */}
            {(batch.processedBy || batch.verifiedBy) && (
                <div className="mt-6 rounded-xl border border-white/5 bg-surface-card p-6">
                    <h2 className="text-sm font-medium text-white">Sign-off</h2>
                    <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {batch.processedBy && (
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs text-muted">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Processed By
                                </dt>
                                <dd className="mt-1 text-sm text-white">{batch.processedBy}</dd>
                            </div>
                        )}
                        {batch.verifiedBy && (
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs text-muted">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Verified By
                                </dt>
                                <dd className="mt-1 text-sm text-white">{batch.verifiedBy}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}
        </div>
    )
}
