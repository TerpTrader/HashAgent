import { db } from '@/lib/db'
import type { FreezeDryerPhase } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// HASH AGENT — ALERT ENGINE
// Evaluates telemetry readings against thresholds and creates alerts.
// Called after each telemetry ingestion.
// ═══════════════════════════════════════════════════════════════════════════

interface TelemetryReading {
    freezeDryerId: string
    orgId: string
    temperatureF: number | null
    pressureMt: number | null
    phase: FreezeDryerPhase | null
    condenserTempF: number | null
    errorCode: string | null
    isOnline: boolean
}

interface AlertRule {
    category: 'ERROR' | 'OFFLINE' | 'BATCH_COMPLETE' | 'VACUUM_HIGH' | 'TEMP_SPIKE'
    severity: 'info' | 'warning' | 'critical'
    check: (current: TelemetryReading, previous?: TelemetryReading) => boolean
    message: (current: TelemetryReading) => string
}

const ALERT_RULES: AlertRule[] = [
    {
        category: 'ERROR',
        severity: 'critical',
        check: (curr, prev) => curr.phase === 'ERROR' && prev?.phase !== 'ERROR',
        message: (curr) => `Freeze dryer entered error state${curr.errorCode ? `: ${curr.errorCode}` : ''}. Batch may be at risk.`,
    },
    {
        category: 'OFFLINE',
        severity: 'critical',
        check: (curr, prev) => !curr.isOnline && (prev?.isOnline ?? true),
        message: () => 'Lost connection to freeze dryer. Check WiFi and power.',
    },
    {
        category: 'BATCH_COMPLETE',
        severity: 'info',
        check: (curr, prev) => curr.phase === 'COMPLETE' && prev?.phase !== 'COMPLETE',
        message: () => 'Freeze dry cycle complete. Hash is ready for collection.',
    },
    {
        category: 'VACUUM_HIGH',
        severity: 'warning',
        check: (curr) => {
            // Only alert during drying phases
            const isDrying = curr.phase === 'PRIMARY_DRYING' || curr.phase === 'SECONDARY_DRYING'
            return isDrying && curr.pressureMt != null && curr.pressureMt > 500
        },
        message: (curr) => `Vacuum pressure at ${Math.round(curr.pressureMt!)} mTorr during drying. Check pump oil and door seal.`,
    },
    {
        category: 'TEMP_SPIKE',
        severity: 'warning',
        check: (curr, prev) => {
            const isDrying = curr.phase === 'PRIMARY_DRYING' || curr.phase === 'SECONDARY_DRYING'
            if (!isDrying || curr.temperatureF == null || prev?.temperatureF == null) return false
            return (curr.temperatureF - prev.temperatureF) > 15
        },
        message: (curr) => `Shelf temperature spiked to ${curr.temperatureF?.toFixed(1)}°F. Possible heater relay issue.`,
    },
]

/**
 * Evaluate all alert rules against the current telemetry reading.
 * Creates HaAlert records for any triggered rules.
 */
export async function evaluateAlerts(
    current: TelemetryReading,
    previous?: TelemetryReading
): Promise<void> {
    const triggered = ALERT_RULES.filter((rule) => rule.check(current, previous))

    for (const rule of triggered) {
        // Check if an active alert of this category already exists for this machine
        // (debounce — don't create duplicate alerts)
        const existing = await db.haAlert.findFirst({
            where: {
                freezeDryerId: current.freezeDryerId,
                category: rule.category,
                status: 'ACTIVE',
            },
        })

        if (!existing) {
            await db.haAlert.create({
                data: {
                    orgId: current.orgId,
                    freezeDryerId: current.freezeDryerId,
                    category: rule.category,
                    severity: rule.severity,
                    message: rule.message(current),
                    status: 'ACTIVE',
                },
            })
        }
    }

    // Auto-resolve: if machine is online and no longer in error, resolve those alerts
    if (current.isOnline && current.phase !== 'ERROR') {
        await db.haAlert.updateMany({
            where: {
                freezeDryerId: current.freezeDryerId,
                category: { in: ['ERROR', 'OFFLINE'] },
                status: 'ACTIVE',
            },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
            },
        })
    }
}
