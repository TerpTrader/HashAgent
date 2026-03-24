'use client'

import { UseFormReturn } from 'react-hook-form'
import type { OutputInput } from '@/lib/validations/batch'
import { cn, generateHashBatchNumber, suggestQualityTier } from '@/lib/utils'
import type { QualityTier } from '@/types'
import { Beaker } from 'lucide-react'

interface OutputStepProps {
    form: UseFormReturn<OutputInput>
    micronYields: {
        yield160u?: number | null
        yield120u?: number | null
        yield90u?: number | null
        yield73u?: number | null
        yield45u?: number | null
    }
    processedBy: string
    verifiedBy: string
    onProcessedByChange: (value: string) => void
    onVerifiedByChange: (value: string) => void
}

const QUALITY_TIERS = [
    { value: 'TIER_1', label: 'Tier 1', desc: 'Full melt — premium grade', color: 'text-micron-73' },
    { value: 'TIER_2', label: 'Tier 2', desc: 'Half melt — standard grade', color: 'text-micron-90' },
    { value: 'TIER_3', label: 'Tier 3', desc: 'Cooking / press grade', color: 'text-micron-120' },
] as const

export function OutputStep({
    form,
    micronYields,
    processedBy,
    verifiedBy,
    onProcessedByChange,
    onVerifiedByChange,
}: OutputStepProps) {
    const { register, watch, setValue, formState: { errors } } = form

    const suggestedTier = suggestQualityTier(micronYields)
    const currentTier = watch('qualityTier')

    function handleAutoGenerate() {
        // Generate batch number using a sequence based on current timestamp
        const seq = Math.floor(Date.now() / 1000) % 1000
        const batchNum = generateHashBatchNumber(seq)
        setValue('batchNumber', batchNum, { shouldValidate: true })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Output &amp; Classification</h2>
                <p className="mt-1 text-sm text-muted">
                    Assign the batch number, quality tier, and product details.
                </p>
            </div>

            {/* Product Name + Batch Number */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="productName" className="mb-1.5 block text-sm text-muted">
                        Product Name <span className="text-muted/50 font-normal">(optional)</span>
                    </label>
                    <input
                        id="productName"
                        type="text"
                        placeholder="e.g. GMO Bubble Hash"
                        {...register('productName')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>

                <div>
                    <label htmlFor="batchNumber" className="mb-1.5 block text-sm text-muted">
                        Batch Number <span className="text-accent-error">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="batchNumber"
                            type="text"
                            placeholder="BMR-001-BH"
                            {...register('batchNumber')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <button
                            type="button"
                            onClick={handleAutoGenerate}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-muted hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Beaker className="h-3.5 w-3.5" />
                            Auto
                        </button>
                    </div>
                    {errors.batchNumber && (
                        <p className="mt-1 text-xs text-accent-error">{errors.batchNumber.message}</p>
                    )}
                </div>
            </div>

            {/* METRC Product UID */}
            <div className="max-w-sm">
                <label htmlFor="metrcProductUid" className="mb-1.5 block text-sm text-muted">
                    METRC Product UID <span className="text-muted/50 font-normal">(optional)</span>
                </label>
                <input
                    id="metrcProductUid"
                    type="text"
                    placeholder="1A40000..."
                    {...register('metrcProductUid')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
            </div>

            {/* Quality Tier */}
            <div className="border-t border-white/5 pt-5">
                <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-medium text-muted">Quality Tier</h3>
                    {suggestedTier && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            AI suggests: {suggestedTier.replace('_', ' ')}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {QUALITY_TIERS.map((tier) => {
                        const isSelected = currentTier === tier.value
                        const isSuggested = suggestedTier === tier.value

                        return (
                            <label
                                key={tier.value}
                                className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all',
                                    isSelected
                                        ? 'border-primary/40 bg-primary/5 shadow-glow-sm'
                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]',
                                    isSuggested && !isSelected && 'border-primary/20'
                                )}
                            >
                                <input
                                    type="radio"
                                    value={tier.value}
                                    checked={isSelected}
                                    onChange={() => setValue('qualityTier', tier.value as QualityTier, { shouldValidate: true })}
                                    className="h-4 w-4 border-white/20 bg-white/5 text-primary focus:ring-primary/30"
                                />
                                <div>
                                    <p className={cn('text-sm font-medium', tier.color)}>
                                        {tier.label}
                                        {isSuggested && (
                                            <span className="ml-1.5 text-[10px] text-primary">SUGGESTED</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted">{tier.desc}</p>
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Manufacturing Date */}
            <div className="max-w-xs">
                <label htmlFor="manufacturingDate" className="mb-1.5 block text-sm text-muted">
                    Manufacturing Date <span className="text-muted/50 font-normal">(optional)</span>
                </label>
                <input
                    id="manufacturingDate"
                    type="date"
                    {...register('manufacturingDate')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                />
            </div>

            {/* Signoff Initials */}
            <div className="border-t border-white/5 pt-5">
                <h3 className="mb-3 text-sm font-medium text-muted">Signoff</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="processedBy" className="mb-1.5 block text-sm text-muted">
                            Processed By (initials)
                        </label>
                        <input
                            id="processedBy"
                            type="text"
                            maxLength={5}
                            placeholder="e.g. JD"
                            value={processedBy}
                            onChange={(e) => onProcessedByChange(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono uppercase text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label htmlFor="verifiedBy" className="mb-1.5 block text-sm text-muted">
                            Verified By (initials)
                        </label>
                        <input
                            id="verifiedBy"
                            type="text"
                            maxLength={5}
                            placeholder="e.g. SM"
                            value={verifiedBy}
                            onChange={(e) => onVerifiedByChange(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono uppercase text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
