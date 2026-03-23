'use client'

import { UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'
import type { PressSetupInput } from '@/lib/validations/rosin'
import { PRESS_EQUIPMENT, POST_PROCESS_EQUIPMENT } from '@/types'

interface PressSetupStepProps {
    form: UseFormReturn<PressSetupInput>
}

const PRODUCT_TYPES = [
    { value: 'FULL_PRESS', label: 'Full Press', description: 'Standard rosin press' },
    { value: 'BADDER', label: 'Badder', description: 'Whipped butter consistency' },
    { value: 'VAPE', label: 'Vape', description: 'For vape cartridges' },
    { value: 'LIVE_ROSIN', label: 'Live Rosin', description: 'From fresh frozen material' },
    { value: 'COLD_CURE', label: 'Cold Cure', description: 'Low-temp post-process cure' },
] as const

export function PressSetupStep({ form }: PressSetupStepProps) {
    const { register, watch, setValue, formState: { errors } } = form
    const selectedPress = watch('equipmentUsed.press')
    const selectedPostProcess = watch('equipmentUsed.postProcess')

    return (
        <div className="space-y-6">
            {/* Press Selection */}
            <div>
                <label className="mb-3 block text-sm font-medium text-white">
                    Press
                </label>
                <div className="flex gap-3">
                    {PRESS_EQUIPMENT.map(press => (
                        <button
                            key={press}
                            type="button"
                            onClick={() => {
                                setValue('pressId', press)
                                setValue('equipmentUsed.press', press)
                            }}
                            className={cn(
                                'flex-1 rounded-lg border px-4 py-3 text-center text-sm font-medium transition-all',
                                selectedPress === press
                                    ? 'border-primary bg-primary/10 text-primary shadow-glow'
                                    : 'border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white'
                            )}
                        >
                            {press}
                        </button>
                    ))}
                </div>
                {errors.pressId && (
                    <p className="mt-1 text-xs text-red-400">{errors.pressId.message}</p>
                )}
            </div>

            {/* Product Type */}
            <div>
                <label className="mb-3 block text-sm font-medium text-white">
                    Product Type
                </label>
                <select
                    {...register('productType')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    {PRODUCT_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-surface text-white">
                            {type.label} — {type.description}
                        </option>
                    ))}
                </select>
                {errors.productType && (
                    <p className="mt-1 text-xs text-red-400">{errors.productType.message}</p>
                )}
            </div>

            {/* Post-Processing Equipment */}
            <div>
                <label className="mb-3 block text-sm font-medium text-white">
                    Post-Processing Equipment
                </label>
                <div className="flex gap-3">
                    {POST_PROCESS_EQUIPMENT.map(equip => (
                        <button
                            key={equip}
                            type="button"
                            onClick={() => setValue('equipmentUsed.postProcess', equip)}
                            className={cn(
                                'flex-1 rounded-lg border px-4 py-3 text-center text-sm font-medium transition-all',
                                selectedPostProcess === equip
                                    ? 'border-primary bg-primary/10 text-primary shadow-glow'
                                    : 'border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-white'
                            )}
                        >
                            {equip}
                        </button>
                    ))}
                </div>
            </div>

            <input type="hidden" {...register('pressId')} />
        </div>
    )
}
