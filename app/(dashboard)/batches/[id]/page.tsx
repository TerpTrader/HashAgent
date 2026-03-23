import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatWeight, formatPercent, formatTemp } from '@/lib/utils'
import { MicronYieldTable } from '@/components/batches/MicronYieldTable'
import { cn } from '@/lib/utils'
import { ChevronLeft, Pencil, FileDown, Archive } from 'lucide-react'

export const metadata = {
    title: 'Batch Detail',
}

// ─── Status + Tier badge helpers ─────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    WASHING: { bg: 'bg-hash-washing/10', text: 'text-hash-washing', label: 'Washing' },
    DRYING: { bg: 'bg-hash-drying/10', text: 'text-hash-drying', label: 'Drying' },
    COMPLETE: { bg: 'bg-hash-complete/10', text: 'text-hash-complete', label: 'Complete' },
    ALLOCATED: { bg: 'bg-hash-allocated/10', text: 'text-hash-allocated', label: 'Allocated' },
    ARCHIVED: { bg: 'bg-white/5', text: 'text-muted', label: 'Archived' },
}

const TIER_LABELS: Record<string, string> = {
    TIER_1: 'Tier 1 — Full Melt',
    TIER_2: 'Tier 2 — Half Melt',
    TIER_3: 'Tier 3 — Press Grade',
}

export default async function BatchDetailPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batch = await db.hashBatch.findFirst({
        where: { id: params.id, orgId: session.orgId },
        include: {
            freezeDryer: { select: { name: true, callsign: true } },
        },
    })

    if (!batch) notFound()

    const statusStyle = STATUS_STYLES[batch.status] ?? STATUS_STYLES.WASHING
    const tierLabel = batch.qualityTier ? TIER_LABELS[batch.qualityTier] : null

    const micronValues = {
        yield160u: batch.yield160u ?? 0,
        yield120u: batch.yield120u ?? 0,
        yield90u: batch.yield90u ?? 0,
        yield73u: batch.yield73u ?? 0,
        yield45u: batch.yield45u ?? 0,
        yield25u: batch.yield25u ?? 0,
    }

    return (
        <div className="mx-auto max-w-4xl animate-fade-in">
            {/* Back link */}
            <Link
                href="/batches"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                All Batches
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-white">{batch.strain}</h1>
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
                    <p className="mt-1 text-sm font-mono text-muted">{batch.batchNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/batches/${batch.id}/edit`}
                        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Export PDF
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg bg-accent-error/10 px-3 py-2 text-sm font-medium text-accent-error hover:bg-accent-error/20 transition-colors"
                    >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                    </button>
                </div>
            </div>

            {/* Sections */}
            <div className="mt-8 space-y-6">
                {/* Starting Material */}
                <Section title="Starting Material">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                        <Field label="Strain" value={batch.strain} />
                        <Field label="Farm Source" value={batch.farmSource} />
                        <Field
                            label="Material State"
                            value={batch.materialState === 'FRESH_FROZEN' ? 'Fresh Frozen' : 'Dried'}
                        />
                        <Field
                            label="Material Grade"
                            value={batch.materialGrade?.replace('_', ' ')}
                        />
                        <Field label="METRC Source UID" value={batch.metrcSourceUid} mono />
                        <Field label="License Key" value={batch.licenseKey} mono />
                        <Field label="Cleaning Log Ref" value={batch.cleaningLogRef} mono />
                    </div>
                </Section>

                {/* Processing */}
                <Section title="Processing">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                        <Field
                            label="Wash Date"
                            value={batch.washDate?.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        />
                        <Field
                            label="Raw Material"
                            value={formatWeight(batch.rawMaterialWeightG)}
                            mono
                        />
                        <Field
                            label="Raw Material (lbs)"
                            value={batch.rawMaterialWeightLb ? `${batch.rawMaterialWeightLb.toFixed(2)} lbs` : null}
                            mono
                        />
                        <Field
                            label="Wet Waste"
                            value={formatWeight(batch.wetWasteWeightG)}
                            mono
                        />
                        <Field
                            label="Expected Yield"
                            value={formatPercent(batch.expectedYieldPct)}
                            mono
                        />
                    </div>

                    {batch.equipmentUsed && (
                        <div className="mt-4 border-t border-white/[0.03] pt-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted/60">
                                Equipment Used
                            </p>
                            <p className="text-sm text-muted">
                                {typeof batch.equipmentUsed === 'object'
                                    ? JSON.stringify(batch.equipmentUsed)
                                    : String(batch.equipmentUsed)}
                            </p>
                        </div>
                    )}
                </Section>

                {/* Drying & Yields */}
                <Section title="Drying & Yields">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                        <Field
                            label="Freeze Dryer"
                            value={
                                batch.freezeDryer
                                    ? `${batch.freezeDryer.name} (${batch.freezeDryer.callsign})`
                                    : batch.freezeDryerId
                            }
                        />
                        <Field
                            label="Drying Date"
                            value={batch.dryingDate?.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        />
                        <Field label="Shelf Limit" value={formatTemp(batch.shelfLimitF)} mono />
                        <Field
                            label="Freeze Time"
                            value={batch.freezeTimeHrs ? `${batch.freezeTimeHrs}hrs` : null}
                            mono
                        />
                        <Field
                            label="Drying Time"
                            value={batch.dryingTimeHrs ? `${batch.dryingTimeHrs}hrs` : null}
                            mono
                        />
                        <Field label="Total Yield" value={formatWeight(batch.totalYieldG)} mono />
                        <Field label="Yield %" value={formatPercent(batch.yieldPct)} mono />
                        <Field label="Quality Tier" value={tierLabel} />
                    </div>

                    <div className="mt-5">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted/60">
                            Micron Breakdown
                        </p>
                        <MicronYieldTable
                            values={micronValues}
                            rawMaterialWeightG={batch.rawMaterialWeightG ?? 0}
                            readOnly
                        />
                    </div>
                </Section>

                {/* Allocations */}
                <Section title="Allocations">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                        <AllocField label="QA Sample" value={batch.allocQa} />
                        <AllocField label="Packaged Bubble Hash" value={batch.allocPackaged} />
                        <AllocField label="Pressed Bubble Hash" value={batch.allocPressed} />
                        <AllocField label="Bulk Pre-Roll Hash" value={batch.allocPreRoll} />
                        <AllocField label="Bulk White Label" value={batch.allocWhiteLabel} />
                        <AllocField label="Rosin" value={batch.allocRosin} />
                        <AllocField label="Loss" value={batch.allocLossG} />
                    </div>

                    {batch.allocationNotes && (
                        <div className="mt-4 border-t border-white/[0.03] pt-4">
                            <p className="text-xs text-muted mb-1">Notes</p>
                            <p className="text-sm text-white">{batch.allocationNotes}</p>
                        </div>
                    )}
                </Section>

                {/* Signoff */}
                <Section title="Signoff">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                        <Field label="Processed By" value={batch.processedBy} mono />
                        <Field label="Verified By" value={batch.verifiedBy} mono />
                        <Field label="METRC Product UID" value={batch.metrcProductUid} mono />
                        <Field
                            label="Manufacturing Date"
                            value={batch.manufacturingDate?.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        />
                    </div>
                </Section>
            </div>
        </div>
    )
}

// ─── Helper components ───────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
            <h2 className="mb-4 text-base font-semibold text-white">{title}</h2>
            {children}
        </div>
    )
}

function Field({
    label,
    value,
    mono = false,
}: {
    label: string
    value: string | number | null | undefined
    mono?: boolean
}) {
    return (
        <div>
            <p className="text-sm text-muted">{label}</p>
            <p className={cn('mt-0.5 text-sm text-white', mono && 'font-mono')}>
                {value ?? '\u2014'}
            </p>
        </div>
    )
}

function AllocField({ label, value }: { label: string; value: number | null | undefined }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.03] px-3 py-2">
            <span className="text-sm text-muted">{label}</span>
            <span className="text-sm font-mono text-white">{formatWeight(value)}</span>
        </div>
    )
}
