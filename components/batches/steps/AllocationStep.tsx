'use client'

import { UseFormReturn } from 'react-hook-form'
import type { AllocationInput } from '@/lib/validations/batch'
import { cn, formatWeight } from '@/lib/utils'

interface AllocationStepProps {
    form: UseFormReturn<AllocationInput>
    totalYieldG: number
}

const ALLOCATION_FIELDS = [
    { field: 'allocQa' as const, label: 'QA Sample', desc: 'Quality assurance testing' },
    { field: 'allocPackaged' as const, label: 'Packaged Bubble Hash', desc: 'Retail packaging' },
    { field: 'allocPressed' as const, label: 'Pressed Bubble Hash', desc: 'Temple ball / pressed' },
    { field: 'allocPreRoll' as const, label: 'Bulk Pre-Roll Hash', desc: 'Pre-roll infusion stock' },
    { field: 'allocWhiteLabel' as const, label: 'Bulk White Label', desc: 'White label wholesale' },
    { field: 'allocRosin' as const, label: 'Rosin', desc: 'Allocated for rosin pressing' },
    { field: 'allocLossG' as const, label: 'Loss', desc: 'Process loss, waste, spillage' },
] as const

export function AllocationStep({ form, totalYieldG }: AllocationStepProps) {
    const { register, watch, formState: { errors } } = form

    // Calculate remaining
    const allocValues = ALLOCATION_FIELDS.map(({ field }) => watch(field) ?? 0)
    const totalAllocated = allocValues.reduce((sum, v) => sum + v, 0)
    const remaining = totalYieldG - totalAllocated
    const isOverAllocated = remaining < 0
    const isFullyAllocated = Math.abs(remaining) < 0.01

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Allocation</h2>
                <p className="mt-1 text-sm text-muted">
                    Distribute the total yield across product categories.
                </p>
            </div>

            {/* Total Available */}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="text-sm text-muted">Total Available</span>
                <span className="text-lg font-mono font-semibold text-white">
                    {formatWeight(totalYieldG)}
                </span>
            </div>

            {/* Allocation inputs */}
            <div className="space-y-2">
                {ALLOCATION_FIELDS.map(({ field, label, desc }) => (
                    <div
                        key={field}
                        className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-white/[0.03] px-4 py-2.5"
                    >
                        <div>
                            <p className="text-sm text-white">{label}</p>
                            <p className="text-xs text-muted">{desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                {...register(field, { valueAsNumber: true })}
                                className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-right text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <span className="text-xs text-muted">g</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Running total */}
            <div
                className={cn(
                    'flex items-center justify-between rounded-lg border px-4 py-3 transition-colors',
                    isOverAllocated
                        ? 'border-accent-error/30 bg-accent-error/5'
                        : isFullyAllocated
                            ? 'border-hash-complete/30 bg-hash-complete/5'
                            : 'border-white/5 bg-white/[0.02]'
                )}
            >
                <span className="text-sm text-muted">Remaining</span>
                <span
                    className={cn(
                        'text-lg font-mono font-semibold',
                        isOverAllocated
                            ? 'text-accent-error'
                            : isFullyAllocated
                                ? 'text-hash-complete'
                                : 'text-white'
                    )}
                >
                    {formatWeight(remaining)}
                </span>
            </div>

            {isOverAllocated && (
                <p className="text-xs text-accent-error">
                    Over-allocated by {formatWeight(Math.abs(remaining))}. Reduce allocations to match total yield.
                </p>
            )}

            {/* Notes */}
            <div>
                <label htmlFor="allocationNotes" className="mb-1.5 block text-sm text-muted">
                    Allocation Notes
                </label>
                <textarea
                    id="allocationNotes"
                    rows={3}
                    placeholder="Any notes about this allocation..."
                    {...register('allocationNotes')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
            </div>
        </div>
    )
}
