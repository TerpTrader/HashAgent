'use client'

import { UseFormReturn } from 'react-hook-form'
import type { InitialProcessingInput } from '@/lib/validations/batch'
import { gramsToLbs } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CameraCapture } from '@/components/ui/CameraCapture'
import { FREEZE_DRYER_PRESETS } from '@/types'

interface InitialProcessingStepProps {
    form: UseFormReturn<InitialProcessingInput>
}

export function InitialProcessingStep({ form }: InitialProcessingStepProps) {
    const { register, watch, setValue, formState: { errors } } = form

    const rawWeight = watch('rawMaterialWeightG')
    const lbsDisplay = rawWeight ? gramsToLbs(rawWeight).toFixed(2) : '0.00'

    function handleWeightCapture(_file: File) {
        // In production, this would send the image to an OCR service
        // and set the weight value. For now, it's a placeholder.
        console.log('Weight OCR capture - implement with AI vision API')
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Initial Processing</h2>
                <p className="mt-1 text-sm text-muted">
                    Record the wash details, weights, and equipment used.
                </p>
            </div>

            {/* Wash Date */}
            <div className="max-w-xs">
                <label htmlFor="washDate" className="mb-1.5 block text-sm text-muted">
                    Wash Date <span className="text-accent-error">*</span>
                </label>
                <input
                    id="washDate"
                    type="date"
                    {...register('washDate')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                />
                {errors.washDate && (
                    <p className="mt-1 text-xs text-accent-error">{errors.washDate.message}</p>
                )}
            </div>

            {/* Weights */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label htmlFor="rawMaterialWeightG" className="mb-1.5 block text-sm text-muted">
                        Raw Material Weight (g) <span className="text-accent-error">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="rawMaterialWeightG"
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            {...register('rawMaterialWeightG', { valueAsNumber: true })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <CameraCapture onCapture={handleWeightCapture} label="OCR" />
                    </div>
                    {/* Auto-calculated lbs */}
                    <p className="mt-1.5 text-xs text-muted font-mono">
                        = {lbsDisplay} lbs
                    </p>
                    {errors.rawMaterialWeightG && (
                        <p className="mt-1 text-xs text-accent-error">{errors.rawMaterialWeightG.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="wetWasteWeightG" className="mb-1.5 block text-sm text-muted">
                        Wet Waste Weight (g) <span className="text-muted/50 font-normal">(optional)</span>
                    </label>
                    <input
                        id="wetWasteWeightG"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        {...register('wetWasteWeightG', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>

                <div>
                    <label htmlFor="expectedYieldPct" className="mb-1.5 block text-sm text-muted">
                        Expected Yield (%) <span className="text-muted/50 font-normal">(optional)</span>
                    </label>
                    <input
                        id="expectedYieldPct"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="e.g. 4.5"
                        {...register('expectedYieldPct', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* Equipment Checklist */}
            <div className="border-t border-white/5 pt-5">
                <h3 className="mb-4 text-sm font-medium text-muted">Equipment Used</h3>

                <div className="space-y-4">
                    {/* Wash Equipment */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                            <input
                                type="checkbox"
                                checked={watch('equipmentUsed.tank') === '500 Gallon DCI Tank'}
                                onChange={(e) =>
                                    setValue(
                                        'equipmentUsed.tank',
                                        e.target.checked ? '500 Gallon DCI Tank' : undefined
                                    )
                                }
                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                            />
                            <div>
                                <p className="text-sm text-white">500 Gal DCI Tank</p>
                                <p className="text-xs text-muted">Stainless steel w/ impeller</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                            <input
                                type="checkbox"
                                checked={watch('equipmentUsed.catchment') === 'Bruteless 30/40 Gal'}
                                onChange={(e) =>
                                    setValue(
                                        'equipmentUsed.catchment',
                                        e.target.checked ? 'Bruteless 30/40 Gal' : undefined
                                    )
                                }
                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                            />
                            <div>
                                <p className="text-sm text-white">Bruteless 30/40 Gal</p>
                                <p className="text-xs text-muted">Catchment system</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                            <input
                                type="checkbox"
                                {...register('equipmentUsed.hoses')}
                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                            />
                            <div>
                                <p className="text-sm text-white">Food Safe Hoses</p>
                                <p className="text-xs text-muted">Water transfer lines</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                            <input
                                type="checkbox"
                                {...register('equipmentUsed.pumps')}
                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                            />
                            <div>
                                <p className="text-sm text-white">Transfer Pumps</p>
                                <p className="text-xs text-muted">Water circulation</p>
                            </div>
                        </label>
                    </div>

                    {/* Freeze Dryers */}
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted/60">
                            Freeze Dryers
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {FREEZE_DRYER_PRESETS.map((dryer) => {
                                const currentDryers = watch('equipmentUsed.freezeDryers') ?? []
                                const isChecked = currentDryers.includes(dryer.id)

                                return (
                                    <label
                                        key={dryer.id}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors',
                                            isChecked
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const updated = e.target.checked
                                                    ? [...currentDryers, dryer.id]
                                                    : currentDryers.filter((d) => d !== dryer.id)
                                                setValue('equipmentUsed.freezeDryers', updated)
                                            }}
                                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                                        />
                                        <div>
                                            <p className="text-sm font-mono text-white">{dryer.id}</p>
                                            <p className="text-[10px] text-muted">{dryer.callsign}</p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
