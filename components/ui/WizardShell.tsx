'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

export interface WizardStep {
    label: string
    icon: React.ReactNode
}

interface WizardShellProps {
    steps: WizardStep[]
    currentStep: number
    onNext: () => void
    onBack: () => void
    onSubmit: () => void
    isSubmitting: boolean
    title: string
    children: React.ReactNode
}

export function WizardShell({
    steps,
    currentStep,
    onNext,
    onBack,
    onSubmit,
    isSubmitting,
    title,
    children,
}: WizardShellProps) {
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1

    return (
        <div className="mx-auto max-w-3xl animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white">{title}</h1>
                <p className="mt-1 text-sm text-muted">
                    Step {currentStep + 1} of {steps.length} &mdash; {steps[currentStep].label}
                </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep
                        const isCurrent = idx === currentStep
                        const isFuture = idx > currentStep

                        return (
                            <div key={idx} className="flex flex-1 items-center">
                                {/* Step dot */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300',
                                            isCompleted && 'border-primary bg-primary text-white',
                                            isCurrent && 'border-primary bg-primary/10 text-primary shadow-glow',
                                            isFuture && 'border-white/10 bg-white/5 text-muted'
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                {step.icon}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'mt-2 text-xs font-medium whitespace-nowrap',
                                            isCompleted && 'text-primary',
                                            isCurrent && 'text-white',
                                            isFuture && 'text-muted/60'
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {idx < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'mx-2 mt-[-20px] h-0.5 flex-1 rounded transition-colors duration-300',
                                            idx < currentStep ? 'bg-primary' : 'bg-white/10'
                                        )}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="rounded-xl border border-white/5 bg-surface-card p-6 animate-fade-in" key={currentStep}>
                {children}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isFirstStep}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                        isFirstStep
                            ? 'cursor-not-allowed text-muted/40'
                            : 'bg-white/5 text-white hover:bg-white/10'
                    )}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </button>

                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onSubmit}
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
                                Creating Batch...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Create Batch
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
