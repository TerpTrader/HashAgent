'use client'

import { useState, forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type HashBatchEditFormProps = {
    batch: any
    onSave: () => void
}

export function HashBatchEditForm({ batch, onSave }: HashBatchEditFormProps) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { isDirty } } = useForm({
        defaultValues: {
            strain: batch.strain ?? '',
            farmSource: batch.farmSource ?? '',
            materialState: batch.materialState ?? 'FRESH_FROZEN',
            materialGrade: batch.materialGrade ?? '',
            metrcSourceUid: batch.metrcSourceUid ?? '',
            metrcProductUid: batch.metrcProductUid ?? '',
            licenseKey: batch.licenseKey ?? '',
            cleaningLogRef: batch.cleaningLogRef ?? '',
            rawMaterialWeightG: batch.rawMaterialWeightG ?? '',
            wetWasteWeightG: batch.wetWasteWeightG ?? '',
            expectedYieldPct: batch.expectedYieldPct ?? '',
            washDate: batch.washDate ? new Date(batch.washDate).toISOString().split('T')[0] : '',
            dryingDate: batch.dryingDate ? new Date(batch.dryingDate).toISOString().split('T')[0] : '',
            shelfLimitF: batch.shelfLimitF ?? '',
            freezeTimeHrs: batch.freezeTimeHrs ?? '',
            dryingTimeHrs: batch.dryingTimeHrs ?? '',
            yield160u: batch.yield160u ?? '',
            yield120u: batch.yield120u ?? '',
            yield90u: batch.yield90u ?? '',
            yield73u: batch.yield73u ?? '',
            yield45u: batch.yield45u ?? '',
            yield25u: batch.yield25u ?? '',
            allocQa: batch.allocQa ?? '',
            allocPackaged: batch.allocPackaged ?? '',
            allocPressed: batch.allocPressed ?? '',
            allocPreRoll: batch.allocPreRoll ?? '',
            allocWhiteLabel: batch.allocWhiteLabel ?? '',
            allocRosin: batch.allocRosin ?? '',
            allocLossG: batch.allocLossG ?? '',
            allocationNotes: batch.allocationNotes ?? '',
            processedBy: batch.processedBy ?? '',
            verifiedBy: batch.verifiedBy ?? '',
            manufacturingDate: batch.manufacturingDate ? new Date(batch.manufacturingDate).toISOString().split('T')[0] : '',
        },
    })

    async function onSubmit(data: any) {
        setSaving(true)
        setError(null)

        // Convert empty strings to null, numeric strings to numbers
        const cleaned: Record<string, any> = {}
        for (const [key, value] of Object.entries(data)) {
            if (value === '') {
                cleaned[key] = null
            } else if (['rawMaterialWeightG', 'wetWasteWeightG', 'expectedYieldPct', 'shelfLimitF', 'freezeTimeHrs', 'dryingTimeHrs', 'yield160u', 'yield120u', 'yield90u', 'yield73u', 'yield45u', 'yield25u', 'allocQa', 'allocPackaged', 'allocPressed', 'allocPreRoll', 'allocWhiteLabel', 'allocRosin', 'allocLossG'].includes(key)) {
                cleaned[key] = value ? parseFloat(value as string) : null
            } else {
                cleaned[key] = value
            }
        }

        try {
            const res = await fetch(`/api/batches/${batch.id}`, {
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

            {/* Starting Material */}
            <Section title="Starting Material">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Strain" {...register('strain')} />
                    <Field label="Farm Source" {...register('farmSource')} />
                    <SelectField label="Material State" {...register('materialState')}>
                        <option value="FRESH_FROZEN">Fresh Frozen</option>
                        <option value="DRIED">Dried</option>
                    </SelectField>
                    <SelectField label="Material Grade" {...register('materialGrade')}>
                        <option value="">—</option>
                        <option value="BUDS">Buds</option>
                        <option value="SMALLS">Smalls</option>
                        <option value="TRIM">Trim</option>
                        <option value="WHOLE_PLANT">Whole Plant</option>
                        <option value="LARF">Larf</option>
                    </SelectField>
                    <Field label="METRC Source UID" {...register('metrcSourceUid')} />
                    <Field label="License Key" {...register('licenseKey')} />
                    <Field label="Cleaning Log Ref" {...register('cleaningLogRef')} />
                </div>
            </Section>

            {/* Processing */}
            <Section title="Processing">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Wash Date" type="date" {...register('washDate')} />
                    <Field label="Raw Material (g)" type="number" step="0.01" {...register('rawMaterialWeightG')} />
                    <Field label="Wet Waste (g)" type="number" step="0.01" {...register('wetWasteWeightG')} />
                    <Field label="Expected Yield %" type="number" step="0.01" {...register('expectedYieldPct')} />
                </div>
            </Section>

            {/* Drying */}
            <Section title="Drying">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Drying Date" type="date" {...register('dryingDate')} />
                    <Field label="Shelf Limit (°F)" type="number" step="1" {...register('shelfLimitF')} />
                    <Field label="Freeze Time (hrs)" type="number" step="0.5" {...register('freezeTimeHrs')} />
                    <Field label="Drying Time (hrs)" type="number" step="0.5" {...register('dryingTimeHrs')} />
                </div>
            </Section>

            {/* Micron Yields */}
            <Section title="Micron Yields">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="160μ (g)" type="number" step="0.01" {...register('yield160u')} />
                    <Field label="120μ (g)" type="number" step="0.01" {...register('yield120u')} />
                    <Field label="90μ (g)" type="number" step="0.01" {...register('yield90u')} />
                    <Field label="73μ (g)" type="number" step="0.01" {...register('yield73u')} />
                    <Field label="45μ (g)" type="number" step="0.01" {...register('yield45u')} />
                    <Field label="25μ (g)" type="number" step="0.01" {...register('yield25u')} />
                </div>
            </Section>

            {/* Allocation */}
            <Section title="Allocation">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Field label="QA (g)" type="number" step="0.01" {...register('allocQa')} />
                    <Field label="Packaged (g)" type="number" step="0.01" {...register('allocPackaged')} />
                    <Field label="Pressed (g)" type="number" step="0.01" {...register('allocPressed')} />
                    <Field label="Pre-Roll (g)" type="number" step="0.01" {...register('allocPreRoll')} />
                    <Field label="White Label (g)" type="number" step="0.01" {...register('allocWhiteLabel')} />
                    <Field label="Rosin (g)" type="number" step="0.01" {...register('allocRosin')} />
                    <Field label="Loss (g)" type="number" step="0.01" {...register('allocLossG')} />
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-muted mb-1.5">Allocation Notes</label>
                    <textarea
                        {...register('allocationNotes')}
                        rows={2}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </Section>

            {/* Signoff */}
            <Section title="Sign-Off">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Processed By" {...register('processedBy')} />
                    <Field label="Verified By" {...register('verifiedBy')} />
                    <Field label="METRC Product UID" {...register('metrcProductUid')} />
                    <Field label="Manufacturing Date" type="date" {...register('manufacturingDate')} />
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
