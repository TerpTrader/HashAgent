// ═══════════════════════════════════════════════════════════════════════════
// HASH AGENT — DOMAIN TYPES
// Client-safe types exported for use across components and API routes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Material types ───────────────────────────────────────────────────────

export type MaterialState = 'DRIED' | 'FRESH_FROZEN'
export type MaterialGrade = 'SMALLS' | 'BUDS' | 'TRIM' | 'WHOLE_PLANT' | 'LARF'
export type QualityTier = 'TIER_1' | 'TIER_2' | 'TIER_3'

// ─── Batch statuses ───────────────────────────────────────────────────────

export type HashBatchStatus = 'WASHING' | 'DRYING' | 'COMPLETE' | 'ALLOCATED' | 'ARCHIVED'
export type RosinBatchStatus = 'PRESSING' | 'POST_PROCESSING' | 'DECARB' | 'COMPLETE' | 'ARCHIVED'
export type PressedBatchStatus = 'PRESSING' | 'COMPLETE' | 'ARCHIVED'
export type RosinProductType = 'FULL_PRESS' | 'BADDER' | 'VAPE' | 'LIVE_ROSIN' | 'COLD_CURE'

// ─── Equipment types ──────────────────────────────────────────────────────

export type FreezeDryerPhase = 'IDLE' | 'FREEZING' | 'PRIMARY_DRYING' | 'SECONDARY_DRYING' | 'COMPLETE' | 'ERROR'
export type FreezeDryerConnectionType = 'MQTT_WIFI' | 'RASPBERRY_PI_BRIDGE'
export type HaAlertCategory = 'ERROR' | 'OFFLINE' | 'BATCH_COMPLETE' | 'VACUUM_HIGH' | 'TEMP_SPIKE' | 'FILTER_DUE' | 'MAINTENANCE_DUE'
export type HaAlertSeverity = 'info' | 'warning' | 'critical'
export type HaAlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
export type CleaningStatus = 'CLEAN' | 'CLOGGED' | 'REPLACED'
export type FilterType = 'SEDIMENT' | 'CARBON' | 'PRE_FILTER'
export type HaMaintenanceCategory = 'FREEZE_DRYER' | 'WATER_FILTRATION' | 'RO_SYSTEM' | 'PRESS' | 'WASH_TANK' | 'GENERAL'
export type HaMaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETE' | 'OVERDUE'

// ─── Micron grades ────────────────────────────────────────────────────────

export const MICRON_GRADES = ['160u', '120u', '90u', '73u', '45u', '25u'] as const
export type MicronGrade = typeof MICRON_GRADES[number]

export const MICRON_GRADE_LABELS: Record<MicronGrade, string> = {
    '160u': '160 Micron',
    '120u': '120 Micron',
    '90u': '90 Micron',
    '73u': '73 Micron',
    '45u': '45 Micron',
    '25u': '25 Micron',
}

// ─── Equipment presets ────────────────────────────────────────────────────

export const WASH_EQUIPMENT = {
    tank: ['500 Gallon Stainless Steel DCI Tank w/ Impeller'],
    catchment: ['Bruteless 30 Gallon', 'Bruteless 40 Gallon'],
    waterTransfer: ['Food Safe Hoses', 'Transfer Pumps'],
} as const

export const FREEZE_DRYER_PRESETS = [
    { id: 'HR-01', name: 'HR-01', callsign: 'ALPHA', serial: 'Aug20 P-LFD 00771 PH' },
    { id: 'HR-02', name: 'HR-02', callsign: 'BRAVO', serial: 'Aug20 P-LFD 00857 PH' },
    { id: 'HR-03', name: 'HR-03', callsign: 'CHARLIE', serial: 'OCT20 P-LFD 00943 PH' },
    { id: 'HR-04', name: 'HR-04', callsign: 'DELTA', serial: 'Aug20 P-LFD 00770 PH' },
] as const

export const PRESS_EQUIPMENT = ['LTP-01', 'LTP-02', 'LTP-03'] as const
export const POST_PROCESS_EQUIPMENT = ['Toaster Oven', 'Vacuum Oven'] as const

// ─── Session type ─────────────────────────────────────────────────────────

export interface HashAgentSession {
    user: {
        id: string
        email: string
        name?: string
    }
    orgId: string | null
    orgName: string | null
    role: string | null
    plan: string | null
    emailVerified: boolean
}

// ─── API response types ───────────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T | null
    error: string | null
}

export interface ApiError {
    error: string
    details?: unknown
}

// ─── Telemetry snapshot ───────────────────────────────────────────────────

export interface TelemetrySnapshot {
    temperatureF: number | null
    pressureMt: number | null
    phase: FreezeDryerPhase
    progress: number | null
    trayTempZoneA: number | null
    trayTempZoneB: number | null
    trayTempZoneC: number | null
    condenserTempF: number | null
    timestamp: string
}
