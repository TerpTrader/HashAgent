'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { cn, formatWeight, formatPercent } from '@/lib/utils'
import { Loader2, ArrowLeft, Pencil } from 'lucide-react'
import { ExportActions } from '@/components/shared/ExportActions'

interface RosinBatchDetail {
    id: string
    batchNumber: string
    strain: string
    processDate: string
    status: string
    productType: string
    productName: string | null

    // Source
    sourceHashBatchId: string
    sourceHashBatch: {
        id: string
        strain: string
        batchNumber: string
        totalYieldG: number | null
    }

    // Microns
    micron120uWeightG: number | null
    micron90uWeightG: number | null
    micron73uWeightG: number | null
    micron45uWeightG: number | null
    totalHashWeightG: number

    // Press
    pressId: string | null
    equipmentUsed: { press?: string; postProcess?: string } | null

    // Yield
    rosinYieldWeightG: number | null
    rosinYieldPct: number | null
    hashToRosinDiffG: number | null
    consistency: string | null

    // Decarb
    decarb: boolean
    decarbWeightG: number | null
    decarbLossG: number | null

    // Chip
    rosinChipUid: string | null
    rosinChipEstimateG: number | null
    bagWeightG: number | null

    // METRC
    rosinProductUid: string | null
    metrcBatchNumber: string | null
    companyProcessedFor: string | null

    // Personnel
    rosinProcessedBy: string | null
    decarbProcessedBy: string | null
    qcVerifiedBy: string | null
    cleaningLogRef: string | null
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    PRESSING: { label: 'Pressing', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    POST_PROCESSING: { label: 'Post Processing', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    DECARB: { label: 'Decarb', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    COMPLETE: { label: 'Complete', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ARCHIVED: { label: 'Archived', className: 'bg-white/5 text-muted border-white/10' },
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
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

function getYieldBg(pct: number | null): string {
    if (pct == null) return 'border-white/5 bg-white/[0.02]'
    if (pct >= 70) return 'border-emerald-500/20 bg-emerald-500/5'
    if (pct >= 50) return 'border-amber-500/20 bg-amber-500/5'
    return 'border-red-500/20 bg-red-500/5'
}

export default function RosinDetailPage() {
    const params = useParams()
    const [batch, setBatch] = useState<RosinBatchDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBatch() {
            try {
                const res = await fetch(`/api/rosin/${params.id}`)
                const json = await res.json()
                setBatch(json.data)
            } catch {
                // silent
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchBatch()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
                <span className="ml-2 text-sm text-muted">Loading batch...</span>
            </div>
        )
    }

    if (!batch) {
        return (
            <div className="py-24 text-center">
                <p className="text-lg font-medium text-white">Batch not found</p>
                <a href="/rosin" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to Rosin Batches
                </a>
            </div>
        )
    }

    const statusStyle = STATUS_STYLES[batch.status] ?? STATUS_STYLES.PRESSING
    const formattedDate = new Date(batch.processDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <div className="mx-auto max-w-4xl animate-fade-in">
            {/* Back link */}
            <a href="/rosin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Rosin Batches
            </a>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-white">
                            {batch.productName ?? batch.strain}
                        </h1>
                        <span className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium',
                            statusStyle.className
                        )}>
                            {statusStyle.label}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                        {batch.batchNumber} &middot; {formattedDate}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={`/rosin/${batch.id}/edit`}
                        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </a>
                    <ExportActions
                        pdfUrl={`/api/rosin/${batch.id}/pdf`}
                        filename={`${batch.batchNumber}-${batch.strain.replace(/\s+/g, '_')}-rosin.pdf`}
                    />
                </div>
            </div>

            {/* Yield Hero */}
            <div className={cn('mt-6 rounded-xl border p-6', getYieldBg(batch.rosinYieldPct))}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Rosin Yield</p>
                        <p className={cn('mt-1 text-4xl font-bold', getYieldColor(batch.rosinYieldPct))}>
                            {batch.rosinYieldPct != null ? formatPercent(batch.rosinYieldPct) : '--'}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-sm text-muted">
                            Output: <span className="font-medium text-white">{formatWeight(batch.rosinYieldWeightG)}</span>
                        </p>
                        <p className="text-sm text-muted">
                            Input: <span className="font-medium text-white">{formatWeight(batch.totalHashWeightG)}</span>
                        </p>
                        <p className="text-sm text-muted">
                            Diff: <span className="font-medium text-white">{formatWeight(batch.hashToRosinDiffG)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid sections */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Source Material */}
                <Section title="Source Material">
                    <Row label="Source Batch">
                        <a href={`/batches/${batch.sourceHashBatch.id}`} className="text-primary hover:underline">
                            {batch.sourceHashBatch.batchNumber}
                        </a>
                    </Row>
                    <Row label="Strain">{batch.strain}</Row>
                    <Row label="120 Micron">{formatWeight(batch.micron120uWeightG)}</Row>
                    <Row label="90 Micron">{formatWeight(batch.micron90uWeightG)}</Row>
                    <Row label="73 Micron">{formatWeight(batch.micron73uWeightG)}</Row>
                    <Row label="45 Micron">{formatWeight(batch.micron45uWeightG)}</Row>
                    <Row label="Total Hash">{formatWeight(batch.totalHashWeightG)}</Row>
                </Section>

                {/* Press Setup */}
                <Section title="Press Setup">
                    <Row label="Press">{batch.pressId ?? '--'}</Row>
                    <Row label="Product Type">{PRODUCT_TYPE_LABELS[batch.productType] ?? batch.productType}</Row>
                    <Row label="Post-Process Equip.">{batch.equipmentUsed?.postProcess ?? '--'}</Row>
                    {batch.consistency && <Row label="Consistency">{batch.consistency}</Row>}
                </Section>

                {/* Post Processing */}
                <Section title="Post Processing">
                    <Row label="Decarb">{batch.decarb ? 'Yes' : 'No'}</Row>
                    {batch.decarb && (
                        <>
                            <Row label="Decarb Weight">{formatWeight(batch.decarbWeightG)}</Row>
                            <Row label="Decarb Loss">{formatWeight(batch.decarbLossG)}</Row>
                        </>
                    )}
                    <Row label="Chip UID">{batch.rosinChipUid ?? '--'}</Row>
                    <Row label="Est. Chip Count">{batch.rosinChipEstimateG != null ? `${Math.round(batch.rosinChipEstimateG)} chips` : '--'}</Row>
                    <Row label="Bag Weight">{formatWeight(batch.bagWeightG)}</Row>
                </Section>

                {/* Output / METRC */}
                <Section title="Output & Compliance">
                    <Row label="Product Name">{batch.productName ?? '--'}</Row>
                    <Row label="Rosin UID">{batch.rosinProductUid ?? '--'}</Row>
                    <Row label="METRC Batch">{batch.metrcBatchNumber ?? '--'}</Row>
                    {batch.companyProcessedFor && (
                        <Row label="Processed For">{batch.companyProcessedFor}</Row>
                    )}
                </Section>

                {/* Signoff */}
                <Section title="Signoff">
                    <Row label="Rosin Processed By">{batch.rosinProcessedBy ?? '--'}</Row>
                    <Row label="Decarb Processed By">{batch.decarbProcessedBy ?? '--'}</Row>
                    <Row label="QC Verified By">{batch.qcVerifiedBy ?? '--'}</Row>
                    <Row label="Cleaning Log">{batch.cleaningLogRef ?? '--'}</Row>
                </Section>
            </div>
        </div>
    )
}

// ─── Helper components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/60">
                {title}
            </h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{label}</span>
            <span className="font-medium text-white">{children}</span>
        </div>
    )
}
