'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import type { RosinOutputInput } from '@/lib/validations/rosin'

interface OutputStepProps {
    form: UseFormReturn<RosinOutputInput>
    strain: string
}

export function OutputStep({ form, strain }: OutputStepProps) {
    const { register, setValue, formState: { errors } } = form

    // Auto-generate batch number on mount
    useEffect(() => {
        const current = form.getValues('batchNumber')
        if (!current) {
            const seq = Math.floor(Math.random() * 900) + 100
            setValue('batchNumber', `BMR-${seq}-R`)
        }
    }, [form, setValue])

    // Auto-fill product name from strain
    useEffect(() => {
        const current = form.getValues('productName')
        if (!current && strain) {
            setValue('productName', `${strain} Rosin`)
        }
    }, [form, setValue, strain])

    return (
        <div className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">
                        Product Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. GMO Rosin"
                        {...register('productName')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">
                        Batch Number <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="BMR-001-R"
                        {...register('batchNumber')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {errors.batchNumber && (
                        <p className="mt-1 text-xs text-red-400">{errors.batchNumber.message}</p>
                    )}
                </div>
            </div>

            {/* METRC / Compliance */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">
                        Rosin Product UID
                    </label>
                    <input
                        type="text"
                        placeholder="METRC UID"
                        {...register('rosinProductUid')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-white">
                        METRC Batch Number
                    </label>
                    <input
                        type="text"
                        placeholder="METRC batch #"
                        {...register('metrcBatchNumber')}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* White Label */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                    Company Processed For
                </label>
                <input
                    type="text"
                    placeholder="Leave blank if in-house"
                    {...register('companyProcessedFor')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted">For white-label batches processed on behalf of another company.</p>
            </div>

            {/* Signoff */}
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/60">
                    Signoff
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                            Rosin Processed By
                        </label>
                        <input
                            type="text"
                            placeholder="Name"
                            {...register('rosinProcessedBy')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                            Decarb Processed By
                        </label>
                        <input
                            type="text"
                            placeholder="Name"
                            {...register('decarbProcessedBy')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                            QC Verified By
                        </label>
                        <input
                            type="text"
                            placeholder="Name"
                            {...register('qcVerifiedBy')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted">
                            Cleaning Log Ref
                        </label>
                        <input
                            type="text"
                            placeholder="CL-###"
                            {...register('cleaningLogRef')}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
