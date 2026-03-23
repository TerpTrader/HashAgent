'use client'

import { UseFormReturn } from 'react-hook-form'
import type { DryingInput } from '@/lib/validations/batch'
import { FREEZE_DRYER_PRESETS } from '@/types'
import { MicronYieldTable } from '@/components/batches/MicronYieldTable'

interface DryingStepProps {
    form: UseFormReturn<DryingInput>
    rawMaterialWeightG: number
}

export function DryingStep({ form, rawMaterialWeightG }: DryingStepProps) {
    const { register, watch, setValue, formState: { errors } } = form

    const micronValues = {
        yield160u: watch('yield160u') ?? 0,
        yield120u: watch('yield120u') ?? 0,
        yield90u: watch('yield90u') ?? 0,
        yield73u: watch('yield73u') ?? 0,
        yield45u: watch('yield45u') ?? 0,
        yield25u: watch('yield25u') ?? 0,
    }

    function handleMicronChange(field: string, value: number) {
        setValue(field as keyof DryingInput, value, { shouldValidate: true })
    }

    function handleMicronCapture(grade: string, file: File) {
        // OCR integration placeholder
        console.log(`OCR capture for ${grade} micron grade`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Drying &amp; Yields</h2>
                <p className="mt-1 text-sm text-muted">
                    Record freeze dryer settings and weigh each micron grade.
                </p>
            </div>

            {/* Freeze Dryer Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="freezeDryerId" className="mb-1.5 block text-sm text-muted">
                        Freeze Dryer
                    </label>
                    <select
                        id="freezeDryerId"
                        {...register('freezeDryerId')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                        <option value="" className="bg-surface-card text-muted">
                            Select freeze dryer...
                        </option>
                        {FREEZE_DRYER_PRESETS.map((dryer) => (
                            <option key={dryer.id} value={dryer.id} className="bg-surface-card">
                                {dryer.id} ({dryer.callsign})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="dryingDate" className="mb-1.5 block text-sm text-muted">
                        Drying Date
                    </label>
                    <input
                        id="dryingDate"
                        type="date"
                        {...register('dryingDate')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Dryer Parameters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label htmlFor="shelfLimitF" className="mb-1.5 block text-sm text-muted">
                        Shelf Limit (&deg;F)
                    </label>
                    <input
                        id="shelfLimitF"
                        type="number"
                        step="1"
                        placeholder="e.g. 75"
                        {...register('shelfLimitF', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>

                <div>
                    <label htmlFor="freezeTimeHrs" className="mb-1.5 block text-sm text-muted">
                        Freeze Time (hrs)
                    </label>
                    <input
                        id="freezeTimeHrs"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 12"
                        {...register('freezeTimeHrs', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>

                <div>
                    <label htmlFor="dryingTimeHrs" className="mb-1.5 block text-sm text-muted">
                        Drying Time (hrs)
                    </label>
                    <input
                        id="dryingTimeHrs"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 24"
                        {...register('dryingTimeHrs', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* Micron Yield Table */}
            <div className="border-t border-white/5 pt-5">
                <h3 className="mb-4 text-sm font-medium text-muted">Micron Grade Yields</h3>
                <MicronYieldTable
                    values={micronValues}
                    rawMaterialWeightG={rawMaterialWeightG}
                    onChange={handleMicronChange}
                    onCameraCapture={handleMicronCapture}
                />
            </div>
        </div>
    )
}
