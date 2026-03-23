'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Snowflake, Droplets, ChevronRight } from 'lucide-react'

// ─── Type badge styling ─────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    freeze_dryer: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: 'Freeze Dryer' },
    water_filtration: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Water Filtration' },
}

interface EquipmentCardProps {
    id: string
    name: string
    type: 'freeze_dryer' | 'water_filtration'
    model?: string | null
    serial?: string | null
    isOnline?: boolean | null
}

export function EquipmentCard({
    id,
    name,
    type,
    model,
    serial,
    isOnline,
}: EquipmentCardProps) {
    const typeStyle = TYPE_STYLES[type] ?? TYPE_STYLES.freeze_dryer
    const Icon = type === 'freeze_dryer' ? Snowflake : Droplets

    // Freeze dryers link to their detail page; water filtration stays as a card
    const isLinked = type === 'freeze_dryer'

    const cardContent = (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Online indicator for freeze dryers */}
                    {type === 'freeze_dryer' && (
                        <span
                            className={cn(
                                'w-2.5 h-2.5 rounded-full',
                                isOnline ? 'bg-machine-online animate-pulse-slow' : 'bg-machine-offline'
                            )}
                        />
                    )}

                    {/* Equipment icon for water filtration */}
                    {type === 'water_filtration' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                            <Icon className="h-4 w-4 text-blue-400" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-white">{name}</h3>
                        {model && (
                            <p className="text-[10px] text-muted truncate">{model}</p>
                        )}
                    </div>
                </div>

                {/* Type badge */}
                <span
                    className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold',
                        typeStyle.bg,
                        typeStyle.text
                    )}
                >
                    {typeStyle.label}
                </span>
            </div>

            {/* Details */}
            <div className="space-y-2">
                {serial && (
                    <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider">Serial</p>
                        <p className="text-xs font-mono text-white/80">{serial}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-muted" />
                    <span className="text-[10px] text-muted">{typeStyle.label}</span>
                </div>
                {isLinked && (
                    <ChevronRight className="h-4 w-4 text-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                )}
            </div>
        </>
    )

    if (isLinked) {
        return (
            <Link
                href={`/freeze-dryers/${id}`}
                className="group block rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10 hover:bg-surface-elevated hover:shadow-glow-sm"
            >
                {cardContent}
            </Link>
        )
    }

    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10">
            {cardContent}
        </div>
    )
}
