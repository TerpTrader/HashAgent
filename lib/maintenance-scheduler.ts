/**
 * Hash Agent — Maintenance Scheduler
 * Checks equipment maintenance status and creates alerts for overdue items.
 * Called by the cron route and available for manual checks.
 */
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// FILTER REPLACEMENT INTERVALS (days)
// ═══════════════════════════════════════════════════════════════════════════

const FILTER_INTERVALS = {
    SEDIMENT: 90,   // Replace sediment filter every 90 days
    CARBON: 180,    // Replace carbon filter every 180 days
    PRE_FILTER: 30, // Replace pre-filter every 30 days
} as const

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type OverdueTask = {
    equipmentId: string
    equipmentName: string
    equipmentType: 'freeze_dryer' | 'water_filtration'
    lastMaintenanceDate: Date | null
    nextDueDate: Date
    overdueDays: number
}

export type FilterReplacement = {
    systemId: string
    systemName: string
    filterType: 'SEDIMENT' | 'CARBON' | 'PRE_FILTER'
    lastReplacedDate: Date | null
    intervalDays: number
    overdueDays: number
}

export type UpcomingTask = {
    equipmentId: string
    equipmentName: string
    equipmentType: 'freeze_dryer' | 'water_filtration'
    nextDueDate: Date
    daysUntilDue: number
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERDUE MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════

export async function getOverdueMaintenanceTasks(orgId: string): Promise<OverdueTask[]> {
    const now = new Date()
    const tasks: OverdueTask[] = []

    // Check freeze dryers with past-due maintenance dates
    const overdueDryers = await db.freezeDryer.findMany({
        where: {
            orgId,
            nextMaintenanceDate: { lt: now },
        },
        select: {
            id: true,
            name: true,
            nextMaintenanceDate: true,
        },
    })

    for (const dryer of overdueDryers) {
        if (!dryer.nextMaintenanceDate) continue
        const overdueDays = Math.floor((now.getTime() - dryer.nextMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
        tasks.push({
            equipmentId: dryer.id,
            equipmentName: dryer.name,
            equipmentType: 'freeze_dryer',
            lastMaintenanceDate: null,
            nextDueDate: dryer.nextMaintenanceDate,
            overdueDays,
        })
    }

    // Check water filtration with past-due maintenance dates
    const overdueFilters = await db.waterFiltrationSystem.findMany({
        where: {
            orgId,
            nextMaintenanceDate: { lt: now },
        },
        select: {
            id: true,
            name: true,
            nextMaintenanceDate: true,
        },
    })

    for (const sys of overdueFilters) {
        if (!sys.nextMaintenanceDate) continue
        const overdueDays = Math.floor((now.getTime() - sys.nextMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
        tasks.push({
            equipmentId: sys.id,
            equipmentName: sys.name,
            equipmentType: 'water_filtration',
            lastMaintenanceDate: null,
            nextDueDate: sys.nextMaintenanceDate,
            overdueDays,
        })
    }

    return tasks.sort((a, b) => b.overdueDays - a.overdueDays)
}

// ═══════════════════════════════════════════════════════════════════════════
// UPCOMING MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════

export async function getUpcomingMaintenanceTasks(orgId: string, daysAhead = 7): Promise<UpcomingTask[]> {
    const now = new Date()
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const tasks: UpcomingTask[] = []

    const upcomingDryers = await db.freezeDryer.findMany({
        where: {
            orgId,
            nextMaintenanceDate: { gte: now, lte: cutoff },
        },
        select: { id: true, name: true, nextMaintenanceDate: true },
    })

    for (const dryer of upcomingDryers) {
        if (!dryer.nextMaintenanceDate) continue
        tasks.push({
            equipmentId: dryer.id,
            equipmentName: dryer.name,
            equipmentType: 'freeze_dryer',
            nextDueDate: dryer.nextMaintenanceDate,
            daysUntilDue: Math.ceil((dryer.nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })
    }

    const upcomingFilters = await db.waterFiltrationSystem.findMany({
        where: {
            orgId,
            nextMaintenanceDate: { gte: now, lte: cutoff },
        },
        select: { id: true, name: true, nextMaintenanceDate: true },
    })

    for (const sys of upcomingFilters) {
        if (!sys.nextMaintenanceDate) continue
        tasks.push({
            equipmentId: sys.id,
            equipmentName: sys.name,
            equipmentType: 'water_filtration',
            nextDueDate: sys.nextMaintenanceDate,
            daysUntilDue: Math.ceil((sys.nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })
    }

    return tasks.sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER REPLACEMENT CHECKS
// ═══════════════════════════════════════════════════════════════════════════

export async function checkFilterReplacements(orgId: string): Promise<FilterReplacement[]> {
    const now = new Date()
    const replacements: FilterReplacement[] = []

    const systems = await db.waterFiltrationSystem.findMany({
        where: { orgId },
        select: {
            id: true,
            name: true,
            sedimentFilterDate: true,
            carbonFilterDate: true,
            preFilterDate: true,
        },
    })

    for (const sys of systems) {
        const checks: Array<{
            filterType: 'SEDIMENT' | 'CARBON' | 'PRE_FILTER'
            lastDate: Date | null
            interval: number
        }> = [
            { filterType: 'SEDIMENT', lastDate: sys.sedimentFilterDate, interval: FILTER_INTERVALS.SEDIMENT },
            { filterType: 'CARBON', lastDate: sys.carbonFilterDate, interval: FILTER_INTERVALS.CARBON },
            { filterType: 'PRE_FILTER', lastDate: sys.preFilterDate, interval: FILTER_INTERVALS.PRE_FILTER },
        ]

        for (const check of checks) {
            if (!check.lastDate) {
                // No date recorded — flag as needing attention
                replacements.push({
                    systemId: sys.id,
                    systemName: sys.name,
                    filterType: check.filterType,
                    lastReplacedDate: null,
                    intervalDays: check.interval,
                    overdueDays: -1, // Unknown
                })
                continue
            }

            const daysSinceReplacement = Math.floor(
                (now.getTime() - check.lastDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceReplacement >= check.interval) {
                replacements.push({
                    systemId: sys.id,
                    systemName: sys.name,
                    filterType: check.filterType,
                    lastReplacedDate: check.lastDate,
                    intervalDays: check.interval,
                    overdueDays: daysSinceReplacement - check.interval,
                })
            }
        }
    }

    return replacements.sort((a, b) => b.overdueDays - a.overdueDays)
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE ALERTS
// Combines all checks and creates HaAlert records, with deduplication.
// ═══════════════════════════════════════════════════════════════════════════

export async function createMaintenanceAlerts(orgId: string): Promise<number> {
    let alertsCreated = 0

    // Check overdue maintenance
    const overdueTasks = await getOverdueMaintenanceTasks(orgId)
    for (const task of overdueTasks) {
        const existing = await db.haAlert.findFirst({
            where: {
                orgId,
                category: 'MAINTENANCE_DUE',
                status: 'ACTIVE',
                // Match by checking message contains equipment name
                message: { contains: task.equipmentName },
            },
        })

        if (!existing) {
            await db.haAlert.create({
                data: {
                    orgId,
                    category: 'MAINTENANCE_DUE',
                    severity: task.overdueDays > 14 ? 'critical' : 'warning',
                    status: 'ACTIVE',
                    message: `${task.equipmentName} maintenance overdue by ${task.overdueDays} day${task.overdueDays !== 1 ? 's' : ''}. Last due: ${task.nextDueDate.toLocaleDateString()}.`,
                    freezeDryerId: task.equipmentType === 'freeze_dryer' ? task.equipmentId : null,
                },
            })
            alertsCreated++
        }
    }

    // Check filter replacements
    const filterIssues = await checkFilterReplacements(orgId)
    for (const filter of filterIssues) {
        const existing = await db.haAlert.findFirst({
            where: {
                orgId,
                category: 'FILTER_DUE',
                status: 'ACTIVE',
                message: { contains: `${filter.systemName} ${filter.filterType}` },
            },
        })

        if (!existing) {
            const msg = filter.overdueDays === -1
                ? `${filter.systemName} ${filter.filterType.toLowerCase()} filter has no replacement date recorded.`
                : `${filter.systemName} ${filter.filterType.toLowerCase()} filter overdue for replacement by ${filter.overdueDays} day${filter.overdueDays !== 1 ? 's' : ''}.`

            await db.haAlert.create({
                data: {
                    orgId,
                    category: 'FILTER_DUE',
                    severity: filter.overdueDays > 30 ? 'critical' : 'warning',
                    status: 'ACTIVE',
                    message: msg,
                },
            })
            alertsCreated++
        }
    }

    return alertsCreated
}
