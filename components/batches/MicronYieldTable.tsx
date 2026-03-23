'use client'

import { cn, formatWeight, formatPercent, calculateTotalMicronYield, calculateYieldPct } from '@/lib/utils'
import { MICRON_GRADES } from '@/types'
import { CameraCapture } from '@/components/ui/CameraCapture'

// ─── Micron grade color mapping ─────────────────────────────────────────────
const MICRON_COLORS: Record<string, string> = {
    '160u': 'bg-micron-160',
    '120u': 'bg-micron-120',
    '90u': 'bg-micron-90',
    '73u': 'bg-micron-73',
    '45u': 'bg-micron-45',
    '25u': 'bg-micron-25',
}

const MICRON_LABELS: Record<string, string> = {
    '160u': '160\u00B5',
    '120u': '120\u00B5',
    '90u': '90\u00B5',
    '73u': '73\u00B5',
    '45u': '45\u00B5',
    '25u': '25\u00B5',
}

interface MicronYieldTableProps {
    values: {
        yield160u: number
        yield120u: number
        yield90u: number
        yield73u: number
        yield45u: number
        yield25u: number
    }
    rawMaterialWeightG: number
    onChange?: (field: string, value: number) => void
    onCameraCapture?: (grade: string, file: File) => void
    readOnly?: boolean
}

export function MicronYieldTable({
    values,
    rawMaterialWeightG,
    onChange,
    onCameraCapture,
    readOnly = false,
}: MicronYieldTableProps) {
    const totalYield = calculateTotalMicronYield(values)
    const yieldPct = calculateYieldPct(totalYield, rawMaterialWeightG)

    const gradeFields: { grade: string; field: keyof typeof values }[] = MICRON_GRADES.map(grade => ({
        grade,
        field: `yield${grade.replace('u', 'u')}` as keyof typeof values,
    }))

    // Map grade to field key properly
    const fieldMap: Record<string, keyof typeof values> = {
        '160u': 'yield160u',
        '120u': 'yield120u',
        '90u': 'yield90u',
        '73u': 'yield73u',
        '45u': 'yield45u',
        '25u': 'yield25u',
    }

    return (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-white/5 px-4 py-2.5">
                <span className="text-xs font-medium uppercase tracking-wider text-muted/60 w-16">
                    Micron
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted/60">
                    Weight (g)
                </span>
                {!readOnly && (
                    <span className="text-xs font-medium uppercase tracking-wider text-muted/60 w-20">
                        Capture
                    </span>
                )}
            </div>

            {/* Rows */}
            {MICRON_GRADES.map((grade) => {
                const fieldKey = fieldMap[grade]
                const value = values[fieldKey] ?? 0

                return (
                    <div
                        key={grade}
                        className="grid grid-cols-[auto_1fr_auto] gap-4 items-center border-b border-white/[0.03] px-4 py-2"
                    >
                        {/* Micron label with colored dot */}
                        <div className="flex items-center gap-2 w-16">
                            <span
                                className={cn(
                                    'h-2.5 w-2.5 rounded-full shrink-0',
                                    MICRON_COLORS[grade]
                                )}
                            />
                            <span className="text-sm font-mono text-white">
                                {MICRON_LABELS[grade]}
                            </span>
                        </div>

                        {/* Weight input */}
                        {readOnly ? (
                            <span className="text-sm font-mono text-white">
                                {formatWeight(value)}
                            </span>
                        ) : (
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={value || ''}
                                onChange={(e) => onChange?.(fieldKey, parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-mono text-white placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                        )}

                        {/* Camera button */}
                        {!readOnly && (
                            <div className="w-20">
                                <CameraCapture
                                    onCapture={(file) => onCameraCapture?.(grade, file)}
                                    label="OCR"
                                />
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Footer: Totals */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center bg-white/[0.03] px-4 py-3">
                <span className="text-sm font-semibold text-white w-16">Total</span>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-semibold text-white">
                        {formatWeight(totalYield)}
                    </span>
                    <span
                        className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-medium',
                            yieldPct > 0
                                ? 'bg-primary/10 text-primary'
                                : 'bg-white/5 text-muted'
                        )}
                    >
                        Yield: {formatPercent(yieldPct)}
                    </span>
                </div>
                {!readOnly && <div className="w-20" />}
            </div>
        </div>
    )
}
