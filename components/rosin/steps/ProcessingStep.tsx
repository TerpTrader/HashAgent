'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { cn, formatWeight, formatPercent } from '@/lib/utils'
import type { RosinProcessingInput } from '@/lib/validations/rosin'
import { CameraCapture } from '@/components/ui/CameraCapture'

interface ProcessingStepProps {
    form: UseFormReturn<RosinProcessingInput>
    totalHashWeightG: number
}

export function ProcessingStep({ form, totalHashWeightG }: ProcessingStepProps) {
    const { register, watch, setValue, formState: { errors } } = form
    const [ocrLoading, setOcrLoading] = useState(false)

    const rosinYieldWeightG = watch('rosinYieldWeightG') ?? 0
    const yieldPct = totalHashWeightG > 0 ? (rosinYieldWeightG / totalHashWeightG) * 100 : 0
    const diffG = totalHashWeightG - rosinYieldWeightG

    // Set today's date as default
    useEffect(() => {
        const current = form.getValues('processDate')
        if (!current) {
            setValue('processDate', new Date().toISOString().split('T')[0])
        }
    }, [form, setValue])

    async function handleScalePhoto(file: File) {
        setOcrLoading(true)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1]
                const res = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Read the weight from this scale photo. Return only the number in grams.',
                        imageBase64: base64,
                    }),
                })
                const json = await res.json()
                const weight = parseFloat(json.message?.replace(/[^0-9.]/g, '') ?? '0')
                if (weight > 0) {
                    setValue('rosinYieldWeightG', weight)
                }
                setOcrLoading(false)
            }
            reader.readAsDataURL(file)
        } catch {
            setOcrLoading(false)
        }
    }

    function getYieldColor(pct: number): string {
        if (pct >= 70) return 'text-emerald-400'
        if (pct >= 50) return 'text-amber-400'
        return 'text-red-400'
    }

    function getYieldBg(pct: number): string {
        if (pct >= 70) return 'border-emerald-500/20 bg-emerald-500/5'
        if (pct >= 50) return 'border-amber-500/20 bg-amber-500/5'
        return 'border-red-500/20 bg-red-500/5'
    }

    return (
        <div className="space-y-6">
            {/* Process Date */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Process Date
                </label>
                <input
                    type="date"
                    {...register('processDate')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.processDate && (
                    <p className="mt-1 text-xs text-red-400">{errors.processDate.message}</p>
                )}
            </div>

            {/* Rosin Yield Weight */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Rosin Yield Weight
                </label>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            {...register('rosinYieldWeightG', { valueAsNumber: true })}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-8 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">g</span>
                    </div>
                    <CameraCapture
                        onCapture={handleScalePhoto}
                        label={ocrLoading ? 'Reading...' : 'Scale Photo'}
                        disabled={ocrLoading}
                    />
                </div>
                {errors.rosinYieldWeightG && (
                    <p className="mt-1 text-xs text-red-400">{errors.rosinYieldWeightG.message}</p>
                )}
            </div>

            {/* Yield Display */}
            {rosinYieldWeightG > 0 && (
                <div className={cn(
                    'animate-fade-in rounded-xl border p-5',
                    getYieldBg(yieldPct)
                )}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted">Rosin Yield</p>
                            <p className={cn('mt-1 text-3xl font-bold', getYieldColor(yieldPct))}>
                                {formatPercent(yieldPct)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted">
                                <span className="text-white">{formatWeight(rosinYieldWeightG)}</span> from {formatWeight(totalHashWeightG)}
                            </div>
                            <div className="mt-1 text-xs text-muted">
                                Diff: {formatWeight(diffG)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Consistency */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Consistency
                </label>
                <input
                    type="text"
                    placeholder="e.g. Greasy, Dry sift, Wet badder..."
                    {...register('consistency')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
        </div>
    )
}
