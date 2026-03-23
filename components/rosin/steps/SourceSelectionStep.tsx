'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { cn, formatWeight } from '@/lib/utils'
import type { SourceSelectionInput } from '@/lib/validations/rosin'
import { Loader2 } from 'lucide-react'

interface HashBatchOption {
    id: string
    strain: string
    batchNumber: string
    status: string
    totalYieldG: number | null
    yield120u: number | null
    yield90u: number | null
    yield73u: number | null
    yield45u: number | null
}

interface SourceSelectionStepProps {
    form: UseFormReturn<SourceSelectionInput>
}

export function SourceSelectionStep({ form }: SourceSelectionStepProps) {
    const [batches, setBatches] = useState<HashBatchOption[]>([])
    const [loading, setLoading] = useState(true)
    const { register, setValue, watch, formState: { errors } } = form

    const selectedBatchId = watch('sourceHashBatchId')
    const selectedBatch = batches.find(b => b.id === selectedBatchId)

    const micron120u = watch('micron120uWeightG') ?? 0
    const micron90u = watch('micron90uWeightG') ?? 0
    const micron73u = watch('micron73uWeightG') ?? 0
    const micron45u = watch('micron45uWeightG') ?? 0
    const totalHash = micron120u + micron90u + micron73u + micron45u

    // Update total hash weight whenever micron values change
    useEffect(() => {
        setValue('totalHashWeightG', totalHash)
    }, [totalHash, setValue])

    // Fetch completed hash batches
    useEffect(() => {
        async function fetchBatches() {
            try {
                const res = await fetch('/api/batches?status=COMPLETE&limit=100')
                const json = await res.json()
                setBatches(json.data ?? [])
            } catch {
                // silent fail
            } finally {
                setLoading(false)
            }
        }
        fetchBatches()
    }, [])

    // When batch is selected, set strain
    useEffect(() => {
        if (selectedBatch) {
            setValue('strain', selectedBatch.strain)
        }
    }, [selectedBatch, setValue])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
                <span className="ml-2 text-sm text-muted">Loading hash batches...</span>
            </div>
        )
    }

    if (batches.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-lg font-medium text-white">No completed hash batches</p>
                <p className="mt-1 text-sm text-muted">
                    Complete a bubble hash wash first, then come back to press rosin.
                </p>
                <a
                    href="/batches"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    Go to Bubble Hash
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Hash Batch Selection */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Source Hash Batch
                </label>
                <select
                    {...register('sourceHashBatchId')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">Select a hash batch...</option>
                    {batches.map(batch => (
                        <option key={batch.id} value={batch.id} className="bg-surface text-white">
                            {batch.batchNumber} &mdash; {batch.strain} ({formatWeight(batch.totalYieldG)})
                        </option>
                    ))}
                </select>
                {errors.sourceHashBatchId && (
                    <p className="mt-1 text-xs text-red-400">{errors.sourceHashBatchId.message}</p>
                )}
            </div>

            {/* Micron Weights */}
            {selectedBatch && (
                <div className="animate-fade-in space-y-4">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <p className="mb-3 text-sm font-medium text-white">
                            Available Micron Weights &mdash; {selectedBatch.strain}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <MicronInput
                                label="120 Micron"
                                available={selectedBatch.yield120u}
                                register={register('micron120uWeightG', { valueAsNumber: true })}
                                error={errors.micron120uWeightG?.message}
                            />
                            <MicronInput
                                label="90 Micron"
                                available={selectedBatch.yield90u}
                                register={register('micron90uWeightG', { valueAsNumber: true })}
                                error={errors.micron90uWeightG?.message}
                            />
                            <MicronInput
                                label="73 Micron"
                                available={selectedBatch.yield73u}
                                register={register('micron73uWeightG', { valueAsNumber: true })}
                                error={errors.micron73uWeightG?.message}
                            />
                            <MicronInput
                                label="45 Micron"
                                available={selectedBatch.yield45u}
                                register={register('micron45uWeightG', { valueAsNumber: true })}
                                error={errors.micron45uWeightG?.message}
                            />
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                        <span className="text-sm font-medium text-white">Total Hash Weight</span>
                        <span className={cn(
                            'text-lg font-semibold',
                            totalHash > 0 ? 'text-primary' : 'text-muted'
                        )}>
                            {formatWeight(totalHash)}
                        </span>
                    </div>
                    {errors.totalHashWeightG && (
                        <p className="text-xs text-red-400">{errors.totalHashWeightG.message}</p>
                    )}
                </div>
            )}

            <input type="hidden" {...register('strain')} />
            <input type="hidden" {...register('totalHashWeightG', { valueAsNumber: true })} />
        </div>
    )
}

// ─── Helper component ────────────────────────────────────────────────────

function MicronInput({
    label,
    available,
    register: reg,
    error,
}: {
    label: string
    available: number | null
    register: ReturnType<UseFormReturn['register']>
    error?: string
}) {
    const availableG = available ?? 0

    return (
        <div>
            <label className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-muted">{label}</span>
                <span className="text-muted/60">Avail: {formatWeight(availableG)}</span>
            </label>
            <input
                type="number"
                step="0.1"
                min="0"
                max={availableG}
                placeholder="0"
                {...reg}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {error && <p className="mt-0.5 text-xs text-red-400">{error}</p>}
        </div>
    )
}
