'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Droplets, Beaker, Snowflake, Tag, PieChart } from 'lucide-react'

import { WizardShell, type WizardStep } from '@/components/ui/WizardShell'
import { StartingMaterialStep } from '@/components/batches/steps/StartingMaterialStep'
import { InitialProcessingStep } from '@/components/batches/steps/InitialProcessingStep'
import { DryingStep } from '@/components/batches/steps/DryingStep'
import { OutputStep } from '@/components/batches/steps/OutputStep'
import { AllocationStep } from '@/components/batches/steps/AllocationStep'

import {
    startingMaterialSchema,
    initialProcessingSchema,
    dryingSchema,
    outputSchema,
    allocationSchema,
    type StartingMaterialInput,
    type InitialProcessingInput,
    type DryingInput,
    type OutputInput,
    type AllocationInput,
} from '@/lib/validations/batch'

import { calculateTotalMicronYield } from '@/lib/utils'
import { toast } from '@/lib/hooks/useToast'

// ─── Step definitions ────────────────────────────────────────────────────────

const WIZARD_STEPS: WizardStep[] = [
    { label: 'Starting Material', icon: <Droplets className="h-4 w-4" /> },
    { label: 'Processing', icon: <Beaker className="h-4 w-4" /> },
    { label: 'Drying', icon: <Snowflake className="h-4 w-4" /> },
    { label: 'Output', icon: <Tag className="h-4 w-4" /> },
    { label: 'Allocation', icon: <PieChart className="h-4 w-4" /> },
]

export function BubbleHashWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Extra fields not in step forms
    const [processedBy, setProcessedBy] = useState('')
    const [verifiedBy, setVerifiedBy] = useState('')

    // ─── Form instances per step ─────────────────────────────────────────────

    const step0Form = useForm<StartingMaterialInput>({
        resolver: zodResolver(startingMaterialSchema),
        defaultValues: {
            strain: '',
            farmSource: '',
            materialState: undefined,
            materialGrade: undefined,
            metrcSourceUid: '',
            licenseKey: '',
            cleaningLogRef: '',
        },
    })

    const step1Form = useForm<InitialProcessingInput>({
        resolver: zodResolver(initialProcessingSchema),
        defaultValues: {
            washDate: '',
            rawMaterialWeightG: undefined as unknown as number,
            wetWasteWeightG: undefined as unknown as number,
            expectedYieldPct: undefined as unknown as number,
            equipmentUsed: {
                tank: undefined,
                catchment: undefined,
                hoses: false,
                pumps: false,
                freezeDryers: [],
            },
        },
    })

    const step2Form = useForm<DryingInput>({
        resolver: zodResolver(dryingSchema),
        defaultValues: {
            freezeDryerId: '',
            dryingDate: '',
            shelfLimitF: undefined as unknown as number,
            freezeTimeHrs: undefined as unknown as number,
            dryingTimeHrs: undefined as unknown as number,
            yield160u: 0,
            yield120u: 0,
            yield90u: 0,
            yield73u: 0,
            yield45u: 0,
            yield25u: 0,
        },
    })

    const step3Form = useForm<OutputInput>({
        resolver: zodResolver(outputSchema),
        defaultValues: {
            productName: '',
            batchNumber: '',
            metrcProductUid: '',
            qualityTier: undefined,
            manufacturingDate: '',
        },
    })

    const step4Form = useForm<AllocationInput>({
        resolver: zodResolver(allocationSchema),
        defaultValues: {
            allocQa: 0,
            allocPackaged: 0,
            allocPressed: 0,
            allocPreRoll: 0,
            allocWhiteLabel: 0,
            allocRosin: 0,
            allocLossG: 0,
            allocationNotes: '',
        },
    })

    // ─── Step validation + navigation ────────────────────────────────────────

    const forms = [step0Form, step1Form, step2Form, step3Form, step4Form]

    const isDirty = step0Form.formState.isDirty || step1Form.formState.isDirty ||
        step2Form.formState.isDirty || step3Form.formState.isDirty || step4Form.formState.isDirty

    useEffect(() => {
        if (!isDirty) return
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault()
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

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

    // ─── Submit all data ─────────────────────────────────────────────────────

    const handleSubmit = useCallback(async () => {
        // Validate the final step
        const isValid = await step4Form.trigger()
        if (!isValid) return

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Merge all step data
            const payload = {
                ...step0Form.getValues(),
                ...step1Form.getValues(),
                ...step2Form.getValues(),
                ...step3Form.getValues(),
                ...step4Form.getValues(),
                processedBy,
                verifiedBy,
            }

            const res = await fetch('/api/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error ?? 'Failed to create batch')
            }

            const { data } = await res.json()
            toast({
                title: 'Batch created',
                description: `${step0Form.getValues().strain} batch logged successfully.`,
                variant: 'success',
            })
            router.push(`/batches/${data.id}`)
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }, [step0Form, step1Form, step2Form, step3Form, step4Form, processedBy, verifiedBy, router])

    // ─── Cross-step derived values ───────────────────────────────────────────

    const rawMaterialWeightG = step1Form.watch('rawMaterialWeightG') || 0
    const micronYields = {
        yield160u: step2Form.watch('yield160u') ?? 0,
        yield120u: step2Form.watch('yield120u') ?? 0,
        yield90u: step2Form.watch('yield90u') ?? 0,
        yield73u: step2Form.watch('yield73u') ?? 0,
        yield45u: step2Form.watch('yield45u') ?? 0,
        yield25u: step2Form.watch('yield25u') ?? 0,
    }
    const totalYieldG = calculateTotalMicronYield(micronYields)

    // ─── Render current step ─────────────────────────────────────────────────

    function renderStep() {
        switch (currentStep) {
            case 0:
                return <StartingMaterialStep form={step0Form} />
            case 1:
                return <InitialProcessingStep form={step1Form} />
            case 2:
                return <DryingStep form={step2Form} rawMaterialWeightG={rawMaterialWeightG} />
            case 3:
                return (
                    <OutputStep
                        form={step3Form}
                        micronYields={micronYields}
                        processedBy={processedBy}
                        verifiedBy={verifiedBy}
                        onProcessedByChange={setProcessedBy}
                        onVerifiedByChange={setVerifiedBy}
                    />
                )
            case 4:
                return <AllocationStep form={step4Form} totalYieldG={totalYieldG} />
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
                title="New Bubble Hash Batch"
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
