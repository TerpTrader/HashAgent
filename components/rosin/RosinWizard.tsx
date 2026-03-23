'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { WizardShell, type WizardStep } from '@/components/ui/WizardShell'
import { SourceSelectionStep } from './steps/SourceSelectionStep'
import { PressSetupStep } from './steps/PressSetupStep'
import { ProcessingStep } from './steps/ProcessingStep'
import { PostProcessingStep } from './steps/PostProcessingStep'
import { OutputStep } from './steps/OutputStep'
import {
    sourceSelectionSchema,
    pressSetupSchema,
    rosinProcessingSchema,
    postProcessingSchema,
    rosinOutputSchema,
    type SourceSelectionInput,
    type PressSetupInput,
    type RosinProcessingInput,
    type PostProcessingInput,
    type RosinOutputInput,
} from '@/lib/validations/rosin'

const STEPS: WizardStep[] = [
    { label: 'Source', icon: <span className="material-symbols-outlined text-[16px]">inventory_2</span> },
    { label: 'Press Setup', icon: <span className="material-symbols-outlined text-[16px]">local_fire_department</span> },
    { label: 'Processing', icon: <span className="material-symbols-outlined text-[16px]">scale</span> },
    { label: 'Post Process', icon: <span className="material-symbols-outlined text-[16px]">thermostat</span> },
    { label: 'Output', icon: <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span> },
]

export function RosinWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Each step has its own form
    const sourceForm = useForm<SourceSelectionInput>({
        resolver: zodResolver(sourceSelectionSchema),
        defaultValues: {
            sourceHashBatchId: '',
            strain: '',
            micron120uWeightG: 0,
            micron90uWeightG: 0,
            micron73uWeightG: 0,
            micron45uWeightG: 0,
            totalHashWeightG: 0,
        },
    })

    const pressForm = useForm<PressSetupInput>({
        resolver: zodResolver(pressSetupSchema),
        defaultValues: {
            pressId: '',
            productType: 'FULL_PRESS',
            equipmentUsed: { press: '', postProcess: '' },
        },
    })

    const processingForm = useForm<RosinProcessingInput>({
        resolver: zodResolver(rosinProcessingSchema),
        defaultValues: {
            processDate: '',
            rosinYieldWeightG: undefined,
            consistency: '',
        },
    })

    const postProcessForm = useForm<PostProcessingInput>({
        resolver: zodResolver(postProcessingSchema),
        defaultValues: {
            decarb: false,
            decarbWeightG: undefined,
            decarbLossG: undefined,
            rosinChipUid: '',
            rosinChipEstimateG: undefined,
            bagWeightG: undefined,
        },
    })

    const outputForm = useForm<RosinOutputInput>({
        resolver: zodResolver(rosinOutputSchema),
        defaultValues: {
            productName: '',
            batchNumber: '',
            rosinProductUid: '',
            metrcBatchNumber: '',
            companyProcessedFor: '',
            rosinProcessedBy: '',
            decarbProcessedBy: '',
            qcVerifiedBy: '',
            cleaningLogRef: '',
        },
    })

    const forms = [sourceForm, pressForm, processingForm, postProcessForm, outputForm]

    async function handleNext() {
        const currentForm = forms[currentStep]
        const valid = await currentForm.trigger()
        if (valid) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
        }
    }

    function handleBack() {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    async function handleSubmit() {
        // Validate output form
        const valid = await outputForm.trigger()
        if (!valid) return

        setIsSubmitting(true)
        setError(null)

        try {
            const payload = {
                ...sourceForm.getValues(),
                ...pressForm.getValues(),
                ...processingForm.getValues(),
                ...postProcessForm.getValues(),
                ...outputForm.getValues(),
            }

            const res = await fetch('/api/rosin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.error ?? 'Failed to create rosin batch')
                setIsSubmitting(false)
                return
            }

            router.push(`/rosin/${json.data.id}`)
        } catch {
            setError('Network error. Please try again.')
            setIsSubmitting(false)
        }
    }

    // Shared data across steps
    const totalHashWeightG = sourceForm.watch('totalHashWeightG') ?? 0
    const rosinYieldWeightG = processingForm.watch('rosinYieldWeightG') ?? 0
    const strain = sourceForm.watch('strain') ?? ''

    return (
        <div>
            <WizardShell
                steps={STEPS}
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                title="New Rosin Press"
            >
                {currentStep === 0 && <SourceSelectionStep form={sourceForm} />}
                {currentStep === 1 && <PressSetupStep form={pressForm} />}
                {currentStep === 2 && (
                    <ProcessingStep
                        form={processingForm}
                        totalHashWeightG={totalHashWeightG}
                    />
                )}
                {currentStep === 3 && (
                    <PostProcessingStep
                        form={postProcessForm}
                        totalHashWeightG={totalHashWeightG}
                        rosinYieldWeightG={rosinYieldWeightG}
                    />
                )}
                {currentStep === 4 && <OutputStep form={outputForm} strain={strain} />}
            </WizardShell>

            {error && (
                <div className="mx-auto mt-4 max-w-3xl animate-fade-in rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}
        </div>
    )
}
