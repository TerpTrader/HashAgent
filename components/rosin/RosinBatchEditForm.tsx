'use client'

import { useState, forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type RosinBatchEditFormProps = {
    batch: any
    onSave: () => void
}

export function RosinBatchEditForm({ batch, onSave }: RosinBatchEditFormProps) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { isDirty } } = useForm({
        defaultValues: {
            productType: batch.productType ?? 'FULL_PRESS',
            productName: batch.productName ?? '',
            processDate: batch.processDate ? new Date(batch.processDate).toISOString().split('T')[0] : '',
            consistency: batch.consistency ?? '',
            micron120uWeightG: batch.micron120uWeightG ?? '',
            micron90uWeightG: batch.micron90uWeightG ?? '',
            micron73uWeightG: batch.micron73uWeightG ?? '',
            micron45uWeightG: batch.micron45uWeightG ?? '',
            rosinYieldWeightG: batch.rosinYieldWeightG ?? '',
            decarb: batch.decarb ?? false,
            decarbWeightG: batch.decarbWeightG ?? '',
            rosinChipUid: batch.rosinChipUid ?? '',
            rosinChipEstimateG: batch.rosinChipEstimateG ?? '',
            bagWeightG: batch.bagWeightG ?? '',
            rosinProductUid: batch.rosinProductUid ?? '',
            metrcBatchNumber: batch.metrcBatchNumber ?? '',
            companyProcessedFor: batch.companyProcessedFor ?? '',
            rosinProcessedBy: batch.rosinProcessedBy ?? '',
            decarbProcessedBy: batch.decarbProcessedBy ?? '',
            qcVerifiedBy: batch.qcVerifiedBy ?? '',
            cleaningLogRef: batch.cleaningLogRef ?? '',
        },
    })

    async function onSubmit(data: any) {
        setSaving(true)
        setError(null)

        // Convert empty strings to null, numeric strings to numbers
        const numericFields = [
            'micron120uWeightG', 'micron90uWeightG', 'micron73uWeightG', 'micron45uWeightG',
            'rosinYieldWeightG', 'decarbWeightG', 'rosinChipEstimateG', 'bagWeightG',
        ]
        const cleaned: Record<string, any> = {}
        for (const [key, value] of Object.entries(data)) {
            if (value === '') {
                cleaned[key] = null
            } else if (numericFields.includes(key)) {
                cleaned[key] = value ? parseFloat(value as string) : null
            } else {
                cleaned[key] = value
            }
        }

        try {
            const res = await fetch(`/api/rosin/${batch.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleaned),
            })

            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error ?? 'Failed to save')
            }

            onSave()
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
            {error && (
                <div className="rounded-lg border border-accent-error/20 bg-accent-error/5 px-4 py-3 text-sm text-accent-error">
                    {error}
                </div>
            )}

            {/* Source — read only */}
            <Section title="Source Hash Batch">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="Source Batch" value={batch.sourceHashBatch?.batchNumber ?? '—'} />
                    <ReadOnlyField label="Strain" value={batch.strain} />
                </div>
            </Section>

            {/* Press Setup */}
            <Section title="Press Setup">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField label="Product Type" {...register('productType')}>
                        <option value="FULL_PRESS">Full Press</option>
                        <option value="BADDER">Badder</option>
                        <option value="VAPE">Vape</option>
                        <option value="LIVE_ROSIN">Live Rosin</option>
                        <option value="COLD_CURE">Cold Cure</option>
                    </SelectField>
                    <Field label="Product Name" {...register('productName')} />
                    <Field label="Process Date" type="date" {...register('processDate')} />
                    <Field label="Consistency" {...register('consistency')} />
                </div>
            </Section>

            {/* Micron Input */}
            <Section title="Micron Input Weights">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Field label="120μ (g)" type="number" step="0.01" {...register('micron120uWeightG')} />
                    <Field label="90μ (g)" type="number" step="0.01" {...register('micron90uWeightG')} />
                    <Field label="73μ (g)" type="number" step="0.01" {...register('micron73uWeightG')} />
                    <Field label="45μ (g)" type="number" step="0.01" {...register('micron45uWeightG')} />
                </div>
            </Section>

            {/* Yield & Post Processing */}
            <Section title="Yield & Post Processing">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Rosin Yield (g)" type="number" step="0.01" {...register('rosinYieldWeightG')} />
                    <Field label="Decarb Weight (g)" type="number" step="0.01" {...register('decarbWeightG')} />
                    <Field label="Chip UID" {...register('rosinChipUid')} />
                    <Field label="Chip Estimate (g)" type="number" step="0.01" {...register('rosinChipEstimateG')} />
                    <Field label="Bag Weight (g)" type="number" step="0.01" {...register('bagWeightG')} />
                </div>
            </Section>

            {/* Compliance */}
            <Section title="Output & Compliance">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Rosin Product UID" {...register('rosinProductUid')} />
                    <Field label="METRC Batch #" {...register('metrcBatchNumber')} />
                    <Field label="Company Processed For" {...register('companyProcessedFor')} />
                </div>
            </Section>

            {/* Signoff */}
            <Section title="Sign-Off">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Rosin Processed By" {...register('rosinProcessedBy')} />
                    <Field label="Decarb Processed By" {...register('decarbProcessedBy')} />
                    <Field label="QC Verified By" {...register('qcVerifiedBy')} />
                    <Field label="Cleaning Log Ref" {...register('cleaningLogRef')} />
                </div>
            </Section>

            {/* Sticky save bar */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-surface/95 backdrop-blur-md px-6 py-4 lg:pl-[calc(240px+1.5rem)]">
                    <div className="mx-auto max-w-4xl flex items-center justify-between">
                        <p className="text-sm text-muted">You have unsaved changes</p>
                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                'flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark',
                                saving && 'opacity-50 cursor-wait'
                            )}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </form>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
            <p className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-muted">{value}</p>
        </div>
    )
}

const Field = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
    ({ label, className, ...props }, ref) => (
        <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
            <input
                ref={ref}
                {...props}
                className={cn(
                    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                    className
                )}
            />
        </div>
    )
)
Field.displayName = 'Field'

const SelectField = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }>(
    ({ label, children, className, ...props }, ref) => (
        <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
            <select
                ref={ref}
                {...props}
                className={cn(
                    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-surface',
                    className
                )}
            >
                {children}
            </select>
        </div>
    )
)
SelectField.displayName = 'SelectField'
