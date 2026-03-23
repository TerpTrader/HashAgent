'use client'

import { UseFormReturn } from 'react-hook-form'
import type { StartingMaterialInput } from '@/lib/validations/batch'

interface StartingMaterialStepProps {
    form: UseFormReturn<StartingMaterialInput>
}

const MATERIAL_STATES = [
    { value: 'DRIED', label: 'Dried' },
    { value: 'FRESH_FROZEN', label: 'Fresh Frozen' },
] as const

const MATERIAL_GRADES = [
    { value: 'SMALLS', label: 'Smalls' },
    { value: 'BUDS', label: 'Buds' },
    { value: 'TRIM', label: 'Trim' },
    { value: 'WHOLE_PLANT', label: 'Whole Plant' },
    { value: 'LARF', label: 'Larf' },
] as const

export function StartingMaterialStep({ form }: StartingMaterialStepProps) {
    const { register, formState: { errors } } = form

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Starting Material</h2>
                <p className="mt-1 text-sm text-muted">
                    Identify the source material for this bubble hash wash.
                </p>
            </div>

            {/* Strain + Farm Source */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="strain" className="mb-1.5 block text-sm text-muted">
                        Strain <span className="text-accent-error">*</span>
                    </label>
                    <input
                        id="strain"
                        type="text"
                        placeholder="e.g. GMO, Watermelon Zkittlez"
                        {...register('strain')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    {errors.strain && (
                        <p className="mt-1 text-xs text-accent-error">{errors.strain.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="farmSource" className="mb-1.5 block text-sm text-muted">
                        Farm Source
                    </label>
                    <input
                        id="farmSource"
                        type="text"
                        placeholder="e.g. Happy Trees Farm"
                        {...register('farmSource')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* Material State + Grade */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="materialState" className="mb-1.5 block text-sm text-muted">
                        Material State <span className="text-accent-error">*</span>
                    </label>
                    <select
                        id="materialState"
                        {...register('materialState')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                        <option value="" className="bg-surface-card text-muted">
                            Select state...
                        </option>
                        {MATERIAL_STATES.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-surface-card">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {errors.materialState && (
                        <p className="mt-1 text-xs text-accent-error">{errors.materialState.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="materialGrade" className="mb-1.5 block text-sm text-muted">
                        Material Grade <span className="text-accent-error">*</span>
                    </label>
                    <select
                        id="materialGrade"
                        {...register('materialGrade')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                        <option value="" className="bg-surface-card text-muted">
                            Select grade...
                        </option>
                        {MATERIAL_GRADES.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-surface-card">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {errors.materialGrade && (
                        <p className="mt-1 text-xs text-accent-error">{errors.materialGrade.message}</p>
                    )}
                </div>
            </div>

            {/* METRC / Compliance fields */}
            <div className="border-t border-white/5 pt-5">
                <h3 className="mb-3 text-sm font-medium text-muted">Compliance &amp; Tracking</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label htmlFor="metrcSourceUid" className="mb-1.5 block text-sm text-muted">
                            METRC Source UID
                        </label>
                        <input
                            id="metrcSourceUid"
                            type="text"
                            placeholder="1A40000..."
                            {...register('metrcSourceUid')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label htmlFor="licenseKey" className="mb-1.5 block text-sm text-muted">
                            License Key
                        </label>
                        <input
                            id="licenseKey"
                            type="text"
                            placeholder="C11-000..."
                            {...register('licenseKey')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label htmlFor="cleaningLogRef" className="mb-1.5 block text-sm text-muted">
                            Cleaning Log Ref
                        </label>
                        <input
                            id="cleaningLogRef"
                            type="text"
                            placeholder="CL-42"
                            {...register('cleaningLogRef')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
