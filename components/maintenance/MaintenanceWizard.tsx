'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import {
    Snowflake,
    Droplets,
    Wrench,
    Filter,
    ClipboardList,
    FileCheck,
    Loader2,
} from 'lucide-react'

import { WizardShell, type WizardStep } from '@/components/ui/WizardShell'

// ─── Step validation schemas ────────────────────────────────────────────────

const step1Schema = z.object({
    category: z.enum(['FREEZE_DRYER', 'WATER_FILTRATION', 'RO_SYSTEM', 'PRESS', 'WASH_TANK', 'GENERAL'], {
        required_error: 'Select a category',
    }),
    equipmentId: z.string().min(1, 'Select equipment'),
    equipmentType: z.string().min(1),
    equipmentName: z.string().min(1),
})

const step2Schema = z.object({
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    actionsTaken: z.string().optional(),
    partsReplaced: z.string().optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETE', 'OVERDUE']).default('COMPLETE'),
})

const step3Schema = z.object({
    performedBy: z.string().min(1, 'Performed by is required'),
    verifiedBy: z.string().optional(),
    nextDueDate: z.string().optional(),
    notes: z.string().optional(),
})

type Step1Input = z.infer<typeof step1Schema>
type Step2Input = z.infer<typeof step2Schema>
type Step3Input = z.infer<typeof step3Schema>

// ─── Category options ───────────────────────────────────────────────────────

const CATEGORIES = [
    { value: 'FREEZE_DRYER', label: 'Freeze Dryer', icon: Snowflake, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    { value: 'WATER_FILTRATION', label: 'Water Filtration', icon: Droplets, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    { value: 'RO_SYSTEM', label: 'RO System', icon: Filter, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
    { value: 'PRESS', label: 'Press', icon: Wrench, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
    { value: 'WASH_TANK', label: 'Wash Tank', icon: Droplets, color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
    { value: 'GENERAL', label: 'General', icon: Wrench, color: 'text-gray-400', bgColor: 'bg-white/5', borderColor: 'border-white/10' },
] as const

// ─── Equipment type ─────────────────────────────────────────────────────────

type EquipmentItem = {
    id: string
    name: string
    type: string
}

// ─── Wizard step definitions ────────────────────────────────────────────────

const WIZARD_STEPS: WizardStep[] = [
    { label: 'Equipment', icon: <Wrench className="h-4 w-4" /> },
    { label: 'Details', icon: <ClipboardList className="h-4 w-4" /> },
    { label: 'Sign Off', icon: <FileCheck className="h-4 w-4" /> },
]

export function MaintenanceWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [equipment, setEquipment] = useState<EquipmentItem[]>([])
    const [loadingEquipment, setLoadingEquipment] = useState(false)

    // ─── Form instances per step ───────────────────────────────────────────

    const step1Form = useForm<Step1Input>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            category: undefined,
            equipmentId: '',
            equipmentType: '',
            equipmentName: '',
        },
    })

    const step2Form = useForm<Step2Input>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            description: '',
            actionsTaken: '',
            partsReplaced: '',
            status: 'COMPLETE',
        },
    })

    const step3Form = useForm<Step3Input>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            performedBy: '',
            verifiedBy: '',
            nextDueDate: '',
            notes: '',
        },
    })

    const selectedCategory = step1Form.watch('category')

    // ─── Fetch equipment when category changes ─────────────────────────────

    useEffect(() => {
        async function fetchEquipment() {
            setLoadingEquipment(true)
            try {
                const res = await fetch('/api/equipment')
                if (res.ok) {
                    const json = await res.json()
                    setEquipment(json.data ?? [])
                }
            } catch {
                // Silently fail — user will see empty dropdown
            } finally {
                setLoadingEquipment(false)
            }
        }

        fetchEquipment()
    }, [])

    // Filter equipment based on category -> type mapping
    const filteredEquipment = equipment.filter((eq) => {
        if (!selectedCategory) return true
        if (selectedCategory === 'FREEZE_DRYER') return eq.type === 'freeze_dryer'
        if (selectedCategory === 'WATER_FILTRATION' || selectedCategory === 'RO_SYSTEM') return eq.type === 'water_filtration'
        // For PRESS, WASH_TANK, GENERAL — show all equipment
        return true
    })

    // ─── Navigation ────────────────────────────────────────────────────────

    const forms = [step1Form, step2Form, step3Form]

    const handleNext = useCallback(async () => {
        const currentForm = forms[currentStep]
        const isValid = await currentForm.trigger()
        if (isValid && currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep((s) => s + 1)
        }
    }, [currentStep, forms])

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1)
        }
    }, [currentStep])

    // ─── Submit ────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(async () => {
        const isValid = await step3Form.trigger()
        if (!isValid) return

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const payload = {
                ...step1Form.getValues(),
                ...step2Form.getValues(),
                ...step3Form.getValues(),
            }

            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error ?? 'Failed to create maintenance log')
            }

            router.push('/maintenance')
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }, [step1Form, step2Form, step3Form, router])

    // ─── Styles ────────────────────────────────────────────────────────────

    const inputClass =
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors'
    const labelClass = 'block text-xs font-medium text-muted mb-1.5'
    const errorClass = 'mt-1 text-xs text-accent-error'

    // ─── Step renderers ────────────────────────────────────────────────────

    function renderStep1() {
        return (
            <div className="space-y-6">
                {/* Category Picker */}
                <div>
                    <label className={labelClass}>Category *</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {CATEGORIES.map((cat) => {
                            const CatIcon = cat.icon
                            const isSelected = selectedCategory === cat.value
                            return (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => {
                                        step1Form.setValue('category', cat.value as Step1Input['category'], { shouldValidate: true })
                                        // Reset equipment selection when category changes
                                        step1Form.setValue('equipmentId', '')
                                        step1Form.setValue('equipmentType', '')
                                        step1Form.setValue('equipmentName', '')
                                    }}
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-xs font-medium transition-all',
                                        isSelected
                                            ? cn(cat.borderColor, cat.bgColor, cat.color)
                                            : 'border-white/5 bg-surface-card text-muted hover:border-white/10 hover:text-white'
                                    )}
                                >
                                    <CatIcon className="h-5 w-5" />
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                    {step1Form.formState.errors.category && (
                        <p className={errorClass}>{step1Form.formState.errors.category.message}</p>
                    )}
                </div>

                {/* Equipment Dropdown */}
                <div>
                    <label className={labelClass}>Equipment *</label>
                    {loadingEquipment ? (
                        <div className="flex items-center gap-2 text-sm text-muted py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading equipment...
                        </div>
                    ) : (
                        <select
                            className={inputClass}
                            value={step1Form.watch('equipmentId')}
                            onChange={(e) => {
                                const selected = equipment.find((eq) => eq.id === e.target.value)
                                if (selected) {
                                    step1Form.setValue('equipmentId', selected.id, { shouldValidate: true })
                                    step1Form.setValue('equipmentType', selected.type, { shouldValidate: true })
                                    step1Form.setValue('equipmentName', selected.name, { shouldValidate: true })
                                } else {
                                    step1Form.setValue('equipmentId', '', { shouldValidate: true })
                                    step1Form.setValue('equipmentType', '', { shouldValidate: true })
                                    step1Form.setValue('equipmentName', '', { shouldValidate: true })
                                }
                            }}
                        >
                            <option value="">Select equipment...</option>
                            {filteredEquipment.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name} ({eq.type === 'freeze_dryer' ? 'Freeze Dryer' : 'Water Filtration'})
                                </option>
                            ))}
                        </select>
                    )}
                    {step1Form.formState.errors.equipmentId && (
                        <p className={errorClass}>{step1Form.formState.errors.equipmentId.message}</p>
                    )}
                </div>
            </div>
        )
    }

    function renderStep2() {
        return (
            <div className="space-y-4">
                {/* Date */}
                <div>
                    <label className={labelClass}>Date *</label>
                    <input
                        type="date"
                        {...step2Form.register('date')}
                        className={inputClass}
                    />
                    {step2Form.formState.errors.date && (
                        <p className={errorClass}>{step2Form.formState.errors.date.message}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description *</label>
                    <textarea
                        {...step2Form.register('description')}
                        rows={3}
                        placeholder="Describe what maintenance was performed..."
                        className={inputClass}
                    />
                    {step2Form.formState.errors.description && (
                        <p className={errorClass}>{step2Form.formState.errors.description.message}</p>
                    )}
                </div>

                {/* Actions Taken */}
                <div>
                    <label className={labelClass}>Actions Taken</label>
                    <textarea
                        {...step2Form.register('actionsTaken')}
                        rows={2}
                        placeholder="Specific actions performed..."
                        className={inputClass}
                    />
                </div>

                {/* Parts Replaced */}
                <div>
                    <label className={labelClass}>Parts Replaced</label>
                    <input
                        {...step2Form.register('partsReplaced')}
                        placeholder="e.g. Vacuum pump oil, O-rings"
                        className={inputClass}
                    />
                </div>

                {/* Status */}
                <div>
                    <label className={labelClass}>Status</label>
                    <select
                        {...step2Form.register('status')}
                        className={inputClass}
                    >
                        <option value="COMPLETE">Complete</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                </div>
            </div>
        )
    }

    function renderStep3() {
        return (
            <div className="space-y-4">
                {/* Performed By */}
                <div>
                    <label className={labelClass}>Performed By *</label>
                    <input
                        {...step3Form.register('performedBy')}
                        placeholder="Name of person who performed the maintenance"
                        className={inputClass}
                    />
                    {step3Form.formState.errors.performedBy && (
                        <p className={errorClass}>{step3Form.formState.errors.performedBy.message}</p>
                    )}
                </div>

                {/* Verified By */}
                <div>
                    <label className={labelClass}>Verified By</label>
                    <input
                        {...step3Form.register('verifiedBy')}
                        placeholder="Name of person who verified the work"
                        className={inputClass}
                    />
                </div>

                {/* Next Due Date */}
                <div>
                    <label className={labelClass}>Next Maintenance Due Date</label>
                    <input
                        type="date"
                        {...step3Form.register('nextDueDate')}
                        className={inputClass}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea
                        {...step3Form.register('notes')}
                        rows={3}
                        placeholder="Additional notes or observations..."
                        className={inputClass}
                    />
                </div>
            </div>
        )
    }

    function renderStep() {
        switch (currentStep) {
            case 0:
                return renderStep1()
            case 1:
                return renderStep2()
            case 2:
                return renderStep3()
            default:
                return null
        }
    }

    return (
        <>
            <WizardShell
                steps={WIZARD_STEPS}
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                title="Log Maintenance"
            >
                {renderStep()}
            </WizardShell>

            {/* Error banner */}
            {submitError && (
                <div className="mx-auto mt-4 max-w-3xl rounded-lg border border-accent-error/30 bg-accent-error/5 px-4 py-3">
                    <p className="text-sm text-accent-error">{submitError}</p>
                </div>
            )}
        </>
    )
}
