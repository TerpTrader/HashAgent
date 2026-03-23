'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Snowflake, Droplets, Loader2, Plus } from 'lucide-react'

// ─── Validation schemas ─────────────────────────────────────────────────────

const freezeDryerFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    callsign: z.string().optional(),
    model: z.string().optional(),
    serial: z.string().optional(),
    pumpModel: z.string().optional(),
    connectionType: z.enum(['MQTT_WIFI', 'RASPBERRY_PI_BRIDGE']).optional(),
})

const waterFiltrationFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    model: z.string().optional(),
    sedimentFilterDate: z.string().optional(),
    carbonFilterDate: z.string().optional(),
    preFilterDate: z.string().optional(),
})

type FreezeDryerFormInput = z.infer<typeof freezeDryerFormSchema>
type WaterFiltrationFormInput = z.infer<typeof waterFiltrationFormSchema>

export function RegisterEquipmentForm() {
    const router = useRouter()
    const [equipmentType, setEquipmentType] = useState<'freeze_dryer' | 'water_filtration'>('freeze_dryer')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const fdForm = useForm<FreezeDryerFormInput>({
        resolver: zodResolver(freezeDryerFormSchema),
        defaultValues: {
            name: '',
            callsign: '',
            model: '',
            serial: '',
            pumpModel: '',
            connectionType: undefined,
        },
    })

    const wfForm = useForm<WaterFiltrationFormInput>({
        resolver: zodResolver(waterFiltrationFormSchema),
        defaultValues: {
            name: '',
            model: '',
            sedimentFilterDate: '',
            carbonFilterDate: '',
            preFilterDate: '',
        },
    })

    async function handleSubmit() {
        setSubmitError(null)

        const activeForm = equipmentType === 'freeze_dryer' ? fdForm : wfForm
        const isValid = await activeForm.trigger()
        if (!isValid) return

        setIsSubmitting(true)

        try {
            const values = activeForm.getValues()
            const payload = { type: equipmentType, ...values }

            const res = await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error ?? 'Failed to register equipment')
            }

            router.push('/equipment')
            router.refresh()
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset forms when switching type
    function switchType(type: 'freeze_dryer' | 'water_filtration') {
        setEquipmentType(type)
        setSubmitError(null)
        fdForm.reset()
        wfForm.reset()
    }

    const inputClass =
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors'
    const labelClass = 'block text-xs font-medium text-muted mb-1.5'
    const errorClass = 'mt-1 text-xs text-accent-error'

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white">Register Equipment</h1>
                <p className="mt-1 text-sm text-muted">
                    Add a freeze dryer or water filtration system to your equipment registry.
                </p>
            </div>

            {/* Type Selector */}
            <div className="mb-6 flex gap-3">
                <button
                    type="button"
                    onClick={() => switchType('freeze_dryer')}
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                        equipmentType === 'freeze_dryer'
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                            : 'border-white/5 bg-surface-card text-muted hover:border-white/10 hover:text-white'
                    )}
                >
                    <Snowflake className="h-4 w-4" />
                    Freeze Dryer
                </button>
                <button
                    type="button"
                    onClick={() => switchType('water_filtration')}
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                        equipmentType === 'water_filtration'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                            : 'border-white/5 bg-surface-card text-muted hover:border-white/10 hover:text-white'
                    )}
                >
                    <Droplets className="h-4 w-4" />
                    Water Filtration
                </button>
            </div>

            {/* Form Card */}
            <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                {equipmentType === 'freeze_dryer' ? (
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input
                                {...fdForm.register('name')}
                                placeholder="e.g. HR-01"
                                className={inputClass}
                            />
                            {fdForm.formState.errors.name && (
                                <p className={errorClass}>{fdForm.formState.errors.name.message}</p>
                            )}
                        </div>

                        {/* Callsign + Model */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Callsign</label>
                                <input
                                    {...fdForm.register('callsign')}
                                    placeholder="e.g. ALPHA"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Model</label>
                                <input
                                    {...fdForm.register('model')}
                                    placeholder="e.g. Harvest Right Large"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Serial + Pump Model */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Serial Number</label>
                                <input
                                    {...fdForm.register('serial')}
                                    placeholder="e.g. Aug20 P-LFD 00771 PH"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Pump Model</label>
                                <input
                                    {...fdForm.register('pumpModel')}
                                    placeholder="e.g. JB Eliminator"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Connection Type */}
                        <div>
                            <label className={labelClass}>Connection Type</label>
                            <select
                                {...fdForm.register('connectionType')}
                                className={inputClass}
                            >
                                <option value="">Select connection type...</option>
                                <option value="MQTT_WIFI">MQTT / WiFi</option>
                                <option value="RASPBERRY_PI_BRIDGE">Raspberry Pi Bridge</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input
                                {...wfForm.register('name')}
                                placeholder="e.g. Main RO System"
                                className={inputClass}
                            />
                            {wfForm.formState.errors.name && (
                                <p className={errorClass}>{wfForm.formState.errors.name.message}</p>
                            )}
                        </div>

                        {/* Model */}
                        <div>
                            <label className={labelClass}>Model</label>
                            <input
                                {...wfForm.register('model')}
                                placeholder="e.g. APEC RO-90"
                                className={inputClass}
                            />
                        </div>

                        {/* Filter Dates */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Sediment Filter Date</label>
                                <input
                                    type="date"
                                    {...wfForm.register('sedimentFilterDate')}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Carbon Filter Date</label>
                                <input
                                    type="date"
                                    {...wfForm.register('carbonFilterDate')}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Pre-Filter Date</label>
                                <input
                                    type="date"
                                    {...wfForm.register('preFilterDate')}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {submitError && (
                <div className="mt-4 rounded-lg border border-accent-error/30 bg-accent-error/5 px-4 py-3">
                    <p className="text-sm text-accent-error">{submitError}</p>
                </div>
            )}

            {/* Submit */}
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
                        'bg-primary text-white hover:bg-primary-dark',
                        isSubmitting && 'cursor-wait opacity-70'
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Register Equipment
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
