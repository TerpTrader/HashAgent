'use client'

import { useState, forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PressedBatchEditFormProps = {
    batch: any
    onSave: () => void
}

export function PressedBatchEditForm({ batch, onSave }: PressedBatchEditFormProps) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { isDirty } } = useForm({
        defaultValues: {
            pressDate: batch.pressDate ? new Date(batch.pressDate).toISOString().split('T')[0] : '',
            micronsUsed: batch.micronsUsed ?? '',
            inputWeightG: batch.inputWeightG ?? '',
            finalWeightG: batch.finalWeightG ?? '',
            notes: batch.notes ?? '',
            metrcUid: batch.metrcUid ?? '',
            processedBy: batch.processedBy ?? '',
            verifiedBy: batch.verifiedBy ?? '',
        },
    })

    async function onSubmit(data: any) {
        setSaving(true)
        setError(null)

        // Convert empty strings to null, numeric strings to numbers
        const numericFields = ['inputWeightG', 'finalWeightG']
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
            const res = await fetch(`/api/pressed/${batch.id}`, {
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
                    <ReadOnlyField label="Strain" value={batch.strain ?? batch.sourceHashBatch?.strain ?? '—'} />
                </div>
            </Section>

            {/* Processing */}
            <Section title="Processing">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Press Date" type="date" {...register('pressDate')} />
                    <Field label="Microns Used" {...register('micronsUsed')} />
                    <Field label="Input Weight (g)" type="number" step="0.01" {...register('inputWeightG')} />
                    <Field label="Final Weight (g)" type="number" step="0.01" {...register('finalWeightG')} />
                </div>
            </Section>

            {/* Compliance & Notes */}
            <Section title="Compliance & Notes">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="METRC UID" {...register('metrcUid')} />
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1.5">Notes</label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </Section>

            {/* Signoff */}
            <Section title="Sign-Off">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Processed By" {...register('processedBy')} />
                    <Field label="Verified By" {...register('verifiedBy')} />
                </div>
            </Section>

            {/* Sticky save bar */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-surface/95 backdrop-blur-md px-6 py-4 lg:pl-[calc(240px+1.5rem)]">
                    <div className="mx-auto max-w-3xl flex items-center justify-between">
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
