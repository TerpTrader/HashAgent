'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { cn, formatWeight, calculateRosinChipEstimate, calculateRosinChipWasteG } from '@/lib/utils'
import type { PostProcessingInput } from '@/lib/validations/rosin'

interface PostProcessingStepProps {
    form: UseFormReturn<PostProcessingInput>
    totalHashWeightG: number
    rosinYieldWeightG: number
}

export function PostProcessingStep({ form, totalHashWeightG, rosinYieldWeightG }: PostProcessingStepProps) {
    const { register, watch, setValue, formState: { errors } } = form

    const decarb = watch('decarb')
    const decarbWeightG = watch('decarbWeightG') ?? 0

    // Auto-calculate chip estimate and bag weight
    const chipCount = calculateRosinChipEstimate(totalHashWeightG)
    const chipWasteG = calculateRosinChipWasteG(chipCount)
    const bagWeightG = chipWasteG

    useEffect(() => {
        setValue('rosinChipEstimateG', Math.round(chipCount))
        setValue('bagWeightG', Math.round(bagWeightG * 100) / 100)
    }, [chipCount, bagWeightG, setValue])

    // Auto-calculate decarb loss
    useEffect(() => {
        if (decarb && decarbWeightG > 0 && rosinYieldWeightG > 0) {
            setValue('decarbLossG', Math.round((rosinYieldWeightG - decarbWeightG) * 100) / 100)
        }
    }, [decarb, decarbWeightG, rosinYieldWeightG, setValue])

    return (
        <div className="space-y-6">
            {/* Decarb Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-white">Decarboxylation</p>
                    <p className="text-xs text-muted">Did this batch go through decarb?</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        {...register('decarb')}
                        className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white/40 after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                </label>
            </div>

            {/* Decarb Fields */}
            {decarb && (
                <div className="animate-fade-in space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-white">
                            Decarb Weight
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                {...register('decarbWeightG', { valueAsNumber: true })}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-8 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">g</span>
                        </div>
                        {errors.decarbWeightG && (
                            <p className="mt-1 text-xs text-red-400">{errors.decarbWeightG.message}</p>
                        )}
                    </div>

                    {decarbWeightG > 0 && rosinYieldWeightG > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted">Decarb Loss</span>
                            <span className="font-medium text-amber-400">
                                {formatWeight(rosinYieldWeightG - decarbWeightG)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Rosin Chip UID */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Rosin Chip UID
                </label>
                <input
                    type="text"
                    placeholder="Enter chip UID..."
                    {...register('rosinChipUid')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Auto-Calculated Values */}
            <div className="space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/60">
                    Calculated Values
                </p>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Est. Chip Count</span>
                    <span className="font-medium text-white">
                        {Math.round(chipCount)} chips
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Chip Waste Weight</span>
                    <span className="font-medium text-white">{formatWeight(chipWasteG)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Bag Weight</span>
                    <span className="font-medium text-white">{formatWeight(bagWeightG)}</span>
                </div>
            </div>

            <input type="hidden" {...register('rosinChipEstimateG', { valueAsNumber: true })} />
            <input type="hidden" {...register('bagWeightG', { valueAsNumber: true })} />
            <input type="hidden" {...register('decarbLossG', { valueAsNumber: true })} />
        </div>
    )
}
