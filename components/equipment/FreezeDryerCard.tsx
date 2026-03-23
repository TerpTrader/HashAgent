'use client'

import { cn } from '@/lib/utils'
import type { FreezeDryerPhase } from '@/types'

interface FreezeDryerCardProps {
    id: string
    name: string
    callsign?: string | null
    model?: string | null
    isOnline: boolean
    currentPhase: FreezeDryerPhase
    currentTempF?: number | null
    currentPressureMt?: number | null
    batchProgress?: number | null
    batchStartedAt?: string | null
    alertCount: number
}

const phaseConfig: Record<FreezeDryerPhase, { label: string; color: string; bgColor: string }> = {
    IDLE: { label: 'Idle', color: 'text-machine-idle', bgColor: 'bg-machine-idle/10' },
    FREEZING: { label: 'Freezing', color: 'text-hash-washing', bgColor: 'bg-hash-washing/10' },
    PRIMARY_DRYING: { label: 'Drying', color: 'text-hash-drying', bgColor: 'bg-hash-drying/10' },
    SECONDARY_DRYING: { label: 'Final Dry', color: 'text-primary', bgColor: 'bg-primary/10' },
    COMPLETE: { label: 'Complete', color: 'text-hash-complete', bgColor: 'bg-hash-complete/10' },
    ERROR: { label: 'Error', color: 'text-accent-error', bgColor: 'bg-accent-error/10' },
}

export function FreezeDryerCard({
    id,
    name,
    callsign,
    model,
    isOnline,
    currentPhase,
    currentTempF,
    currentPressureMt,
    batchProgress,
    batchStartedAt,
    alertCount,
}: FreezeDryerCardProps) {
    const phase = phaseConfig[currentPhase] ?? phaseConfig.IDLE
    const isActive = currentPhase !== 'IDLE' && currentPhase !== 'COMPLETE'

    return (
        <a
            href={`/freeze-dryers/${id}`}
            className={cn(
                'block bg-surface-card border rounded-xl p-5 transition-all hover:border-white/10 hover:shadow-glow-sm',
                currentPhase === 'ERROR' ? 'border-accent-error/30' : 'border-white/5',
                isActive && 'shadow-glow-sm'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Online indicator */}
                    <span
                        className={cn(
                            'w-2.5 h-2.5 rounded-full',
                            isOnline ? 'bg-machine-online animate-pulse-slow' : 'bg-machine-offline'
                        )}
                    />
                    <div>
                        <h3 className="text-sm font-semibold text-white">{name}</h3>
                        {callsign && (
                            <p className="text-[10px] text-muted font-mono uppercase tracking-wider">
                                {callsign}
                            </p>
                        )}
                    </div>
                </div>

                {/* Phase badge */}
                <span className={cn('px-2.5 py-1 text-[10px] font-semibold rounded-full', phase.bgColor, phase.color)}>
                    {phase.label}
                </span>
            </div>

            {/* Sensor readings */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Shelf Temp</p>
                    <p className="text-lg font-mono text-white">
                        {currentTempF != null ? `${currentTempF.toFixed(1)}°F` : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Vacuum</p>
                    <p className="text-lg font-mono text-white">
                        {currentPressureMt != null ? (
                            <>
                                {Math.round(currentPressureMt)}
                                <span className="text-xs text-muted ml-1">mTorr</span>
                            </>
                        ) : '—'}
                    </p>
                </div>
            </div>

            {/* Progress bar (only when active) */}
            {isActive && batchProgress != null && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                        <span>Progress</span>
                        <span className="font-mono">{batchProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-1000',
                                currentPhase === 'ERROR' ? 'bg-accent-error' : 'bg-primary'
                            )}
                            style={{ width: `${Math.min(batchProgress, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {model && (
                    <p className="text-[10px] text-muted truncate">{model}</p>
                )}
                {alertCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-accent-warning">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                            warning
                        </span>
                        {alertCount} alert{alertCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </a>
    )
}
