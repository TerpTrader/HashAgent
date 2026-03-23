'use client'

import { cn } from '@/lib/utils'
import { Snowflake, Droplets, Wrench, Filter, Calendar, User } from 'lucide-react'
import type { HaMaintenanceCategory, HaMaintenanceStatus } from '@/types'

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: typeof Snowflake; color: string; bgColor: string; label: string }> = {
    FREEZE_DRYER: { icon: Snowflake, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', label: 'Freeze Dryer' },
    WATER_FILTRATION: { icon: Droplets, color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Water Filtration' },
    RO_SYSTEM: { icon: Filter, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', label: 'RO System' },
    PRESS: { icon: Wrench, color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Press' },
    WASH_TANK: { icon: Droplets, color: 'text-teal-400', bgColor: 'bg-teal-500/10', label: 'Wash Tank' },
    GENERAL: { icon: Wrench, color: 'text-gray-400', bgColor: 'bg-white/5', label: 'General' },
}

// ─── Status badge styling ───────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    SCHEDULED: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Scheduled' },
    IN_PROGRESS: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'In Progress' },
    COMPLETE: { bg: 'bg-hash-complete/10', text: 'text-hash-complete', label: 'Complete' },
    OVERDUE: { bg: 'bg-accent-error/10', text: 'text-accent-error', label: 'Overdue' },
}

interface MaintenanceCardProps {
    id: string
    category: HaMaintenanceCategory
    equipmentName: string
    date: string
    description: string
    performedBy: string
    status: HaMaintenanceStatus
}

export function MaintenanceCard({
    id,
    category,
    equipmentName,
    date,
    description,
    performedBy,
    status,
}: MaintenanceCardProps) {
    const catConfig = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.GENERAL
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.COMPLETE
    const CatIcon = catConfig.icon

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <div className="group rounded-xl border border-white/5 bg-surface-card p-5 transition-all duration-200 hover:border-white/10">
            {/* Top row: category icon + equipment name + status */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', catConfig.bgColor)}>
                        <CatIcon className={cn('h-4 w-4', catConfig.color)} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{equipmentName}</h3>
                        <span className={cn('text-[10px] font-medium', catConfig.color)}>{catConfig.label}</span>
                    </div>
                </div>

                <span
                    className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        statusStyle.bg,
                        statusStyle.text
                    )}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Description preview */}
            <p className="mt-3 text-sm text-muted line-clamp-2">{description}</p>

            {/* Bottom: date + performed by */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    <User className="h-3 w-3" />
                    {performedBy}
                </div>
            </div>
        </div>
    )
}
