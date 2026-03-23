'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createPressedBatchSchema, type CreatePressedBatchInput } from '@/lib/validations/pressed'
import { generatePressedBatchNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface HashBatchOption {
    id: string
    strain: string
    batchNumber: string
    status: string
    totalYieldG: number | null
}

export default function NewPressedBatchPage() {
    const router = useRouter()
    const [hashBatches, setHashBatches] = useState<HashBatchOption[]>([])
    const [loadingBatches, setLoadingBatches] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreatePressedBatchInput>({
        resolver: zodResolver(createPressedBatchSchema),
        defaultValues: {
            sourceHashBatchId: '',
            strain: '',
            batchNumber: '',
            pressDate: new Date().toISOString().split('T')[0],
            micronsUsed: '',
            inputWeightG: undefined,
            finalWeightG: undefined,
            notes: '',
            metrcUid: '',
            processedBy: '',
            verifiedBy: '',
        },
    })

    const selectedSourceId = watch('sourceHashBatchId')

    // Fetch available hash batches for source selection
    useEffect(() => {
        async function fetchHashBatches() {
            try {
                const res = await fetch('/api/batches')
                const json = await res.json()
                setHashBatches(json.data ?? [])
            } catch {
                // silent
            } finally {
                setLoadingBatches(false)
            }
        }
        fetchHashBatches()
    }, [])

    // Auto-populate strain when source batch changes
    useEffect(() => {
        if (selectedSourceId) {
            const batch = hashBatches.find((b) => b.id === selectedSourceId)
            if (batch) {
                setValue('strain', batch.strain)
            }
        }
    }, [selectedSourceId, hashBatches, setValue])

    // Suggest batch number on mount
    useEffect(() => {
        // Generate a suggested batch number based on timestamp
        const seq = Math.floor(Date.now() / 1000) % 999
        setValue('batchNumber', generatePressedBatchNumber(seq))
    }, [setValue])

    async function onSubmit(data: CreatePressedBatchInput) {
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/pressed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.error ?? 'Failed to create pressed hash batch')
                return
            }

            router.push(`/pressed/${json.data.id}`)
        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="animate-fade-in mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/pressed"
                    className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Pressed Hash
                </Link>
                <h1 className="mt-3 text-2xl font-semibold text-white">Create Pressed Hash Batch</h1>
                <p className="mt-1 text-sm text-muted">
                    Log a new pressed hash batch from a source bubble hash batch.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Source Hash Batch */}
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <h2 className="text-sm font-medium text-white">Source Hash Batch</h2>
                    <p className="mt-1 text-xs text-muted">Select the bubble hash batch this press is sourced from.</p>

                    <div className="mt-4">
                        <label htmlFor="sourceHashBatchId" className="block text-xs font-medium text-muted">
                            Source Batch *
                        </label>
                        {loadingBatches ? (
                            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading batches...
                            </div>
                        ) : (
                            <select
                                id="sourceHashBatchId"
                                {...register('sourceHashBatchId')}
                                className={cn(
                                    'mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                                    errors.sourceHashBatchId && 'border-red-500/50'
                                )}
                            >
                                <option value="">Select a batch...</option>
                                {hashBatches.map((batch) => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.strain} — {batch.batchNumber} ({batch.status})
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.sourceHashBatchId && (
                            <p className="mt-1 text-xs text-red-400">{errors.sourceHashBatchId.message}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="strain" className="block text-xs font-medium text-muted">
                            Strain
                        </label>
                        <input
                            id="strain"
                            type="text"
                            {...register('strain')}
                            placeholder="Auto-populated from source"
                            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Batch Details */}
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <h2 className="text-sm font-medium text-white">Batch Details</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="batchNumber" className="block text-xs font-medium text-muted">
                                Batch Number *
                            </label>
                            <input
                                id="batchNumber"
                                type="text"
                                {...register('batchNumber')}
                                className={cn(
                                    'mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                                    errors.batchNumber && 'border-red-500/50'
                                )}
                            />
                            {errors.batchNumber && (
                                <p className="mt-1 text-xs text-red-400">{errors.batchNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="pressDate" className="block text-xs font-medium text-muted">
                                Press Date *
                            </label>
                            <input
                                id="pressDate"
                                type="date"
                                {...register('pressDate')}
                                className={cn(
                                    'mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                                    errors.pressDate && 'border-red-500/50'
                                )}
                            />
                            {errors.pressDate && (
                                <p className="mt-1 text-xs text-red-400">{errors.pressDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="micronsUsed" className="block text-xs font-medium text-muted">
                                Microns Used
                            </label>
                            <input
                                id="micronsUsed"
                                type="text"
                                {...register('micronsUsed')}
                                placeholder="e.g. 73u, 90u"
                                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="metrcUid" className="block text-xs font-medium text-muted">
                                METRC UID
                            </label>
                            <input
                                id="metrcUid"
                                type="text"
                                {...register('metrcUid')}
                                placeholder="Optional"
                                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Weights */}
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <h2 className="text-sm font-medium text-white">Weights</h2>
                    <p className="mt-1 text-xs text-muted">Record the input and final weight in grams.</p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="inputWeightG" className="block text-xs font-medium text-muted">
                                Input Weight (g) *
                            </label>
                            <input
                                id="inputWeightG"
                                type="number"
                                step="0.01"
                                {...register('inputWeightG', { valueAsNumber: true })}
                                placeholder="0.00"
                                className={cn(
                                    'mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                                    errors.inputWeightG && 'border-red-500/50'
                                )}
                            />
                            {errors.inputWeightG && (
                                <p className="mt-1 text-xs text-red-400">{errors.inputWeightG.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="finalWeightG" className="block text-xs font-medium text-muted">
                                Final Weight (g)
                            </label>
                            <input
                                id="finalWeightG"
                                type="number"
                                step="0.01"
                                {...register('finalWeightG', { valueAsNumber: true })}
                                placeholder="0.00"
                                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <p className="mt-1 text-xs text-muted">Leave blank if pressing is not complete.</p>
                        </div>
                    </div>
                </div>

                {/* Sign-off & Notes */}
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <h2 className="text-sm font-medium text-white">Sign-off & Notes</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="processedBy" className="block text-xs font-medium text-muted">
                                Processed By
                            </label>
                            <input
                                id="processedBy"
                                type="text"
                                {...register('processedBy')}
                                placeholder="Operator name"
                                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="verifiedBy" className="block text-xs font-medium text-muted">
                                Verified By
                            </label>
                            <input
                                id="verifiedBy"
                                type="text"
                                {...register('verifiedBy')}
                                placeholder="Verifier name"
                                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="notes" className="block text-xs font-medium text-muted">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            {...register('notes')}
                            rows={3}
                            placeholder="Any additional notes about this press..."
                            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/pressed"
                        className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-white"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            'flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark',
                            isSubmitting && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create Pressed Hash Batch'}
                    </button>
                </div>
            </form>
        </div>
    )
}
