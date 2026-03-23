import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TelemetryChart } from '@/components/equipment/TelemetryChart'
import { formatTemp, formatPressure } from '@/lib/utils'

export const metadata = { title: 'Freeze Dryer Detail' }

export default async function FreezeDryerDetailPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session?.orgId) return null

    const dryer = await db.freezeDryer.findFirst({
        where: { id: params.id, orgId: session.orgId },
        include: {
            alerts: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
        },
    })

    if (!dryer) notFound()

    // Fetch maintenance logs for this freeze dryer
    const maintenanceLogs = await db.haEquipmentMaintenanceLog.findMany({
        where: { orgId: session.orgId, equipmentId: params.id, equipmentType: 'freeze_dryer' },
        orderBy: { date: 'desc' },
        take: 10,
    })

    // Fetch last 4 hours of telemetry
    const since = new Date(Date.now() - 4 * 60 * 60 * 1000)
    const telemetry = await db.freezeDryerTelemetry.findMany({
        where: {
            freezeDryerId: dryer.id,
            timestamp: { gte: since },
        },
        orderBy: { timestamp: 'asc' },
        select: {
            timestamp: true,
            temperatureF: true,
            pressureMt: true,
            phase: true,
            progress: true,
            trayTempZoneA: true,
            trayTempZoneB: true,
            trayTempZoneC: true,
            condenserTempF: true,
            errorCode: true,
        },
    })

    const isActive = dryer.currentPhase !== 'IDLE' && dryer.currentPhase !== 'COMPLETE'

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <a href="/freeze-dryers" className="text-muted hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                            arrow_back
                        </span>
                    </a>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${dryer.isOnline ? 'bg-machine-online animate-pulse-slow' : 'bg-machine-offline'}`} />
                            <h1 className="text-2xl font-semibold text-white">{dryer.name}</h1>
                            {dryer.callsign && (
                                <span className="text-sm font-mono text-muted">({dryer.callsign})</span>
                            )}
                        </div>
                        <p className="text-sm text-muted mt-0.5">
                            {dryer.model ?? 'Harvest Right'} &middot; {dryer.serial ?? 'No serial'}
                        </p>
                    </div>
                </div>

                {/* Phase badge */}
                <PhaseBadge phase={dryer.currentPhase} />
            </div>

            {/* Sensor Readings Grid — Inspired by Hashy.so changelog screenshot */}
            <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>sensors</span>
                    Sensors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <SensorReading label="Tray" value={formatTemp(dryer.currentTempF)} />
                    <SensorReading label="Condenser" value={formatTemp(null)} variant="warning" />
                    <SensorReading label="Pressure" value={formatPressure(dryer.currentPressureMt)} />
                    <SensorReading
                        label="Progress"
                        value={dryer.batchProgress != null ? `${dryer.batchProgress.toFixed(0)}%` : '—'}
                    />
                    <SensorReading
                        label="Status"
                        value={dryer.isOnline ? 'Online' : 'Offline'}
                        variant={dryer.isOnline ? 'success' : 'error'}
                    />
                </div>

                {/* Relay status — Hashy.so pattern */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>toggle_on</span>
                        Relays
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        <RelayBadge label="Condenser" on={isActive} />
                        <RelayBadge label="Vacuum" on={dryer.currentPhase === 'PRIMARY_DRYING' || dryer.currentPhase === 'SECONDARY_DRYING'} />
                        <RelayBadge label="Heater" on={dryer.currentPhase === 'PRIMARY_DRYING' || dryer.currentPhase === 'SECONDARY_DRYING'} />
                        <RelayBadge label="Drain" on={false} />
                    </div>
                </div>
            </div>

            {/* Telemetry Chart */}
            {telemetry.length > 0 ? (
                <TelemetryChart
                    data={telemetry.map(t => ({
                        ...t,
                        timestamp: t.timestamp.toISOString(),
                    }))}
                    mTorrReference={200}
                />
            ) : (
                <div className="bg-surface-card border border-white/5 rounded-xl p-8 text-center">
                    <p className="text-sm text-muted">No telemetry data in the last 4 hours</p>
                </div>
            )}

            {/* Machine Control Panel */}
            <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Machine Control</h3>
                <div className="flex flex-wrap gap-3">
                    <ControlButton
                        label="Start Batch"
                        icon="play_arrow"
                        disabled={!dryer.isOnline || isActive}
                        variant="primary"
                        machineId={dryer.id}
                        command="start_batch"
                    />
                    <ControlButton
                        label="Stop Batch"
                        icon="stop"
                        disabled={!dryer.isOnline || !isActive}
                        variant="danger"
                        machineId={dryer.id}
                        command="stop_batch"
                    />
                    <ControlButton
                        label="Add Time"
                        icon="more_time"
                        disabled={!dryer.isOnline || !isActive}
                        machineId={dryer.id}
                        command="add_time"
                    />
                    <ControlButton
                        label="Ack Error"
                        icon="check_circle"
                        disabled={dryer.currentPhase !== 'ERROR'}
                        machineId={dryer.id}
                        command="acknowledge_error"
                    />
                </div>
                <p className="text-[10px] text-muted mt-3">
                    Machine control pending Harvest Right API capture confirmation. Commands are logged.
                </p>
            </div>

            {/* Two-column: Alerts + Maintenance */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Alerts */}
                <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Active Alerts</h3>
                    {dryer.alerts.length === 0 ? (
                        <p className="text-sm text-muted py-4 text-center">No active alerts</p>
                    ) : (
                        <div className="space-y-2">
                            {dryer.alerts.map((alert: typeof dryer.alerts[number]) => (
                                <div
                                    key={alert.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg ${
                                        alert.severity === 'critical' ? 'bg-accent-error/5' :
                                        alert.severity === 'warning' ? 'bg-accent-warning/5' :
                                        'bg-accent-info/5'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                                        alert.severity === 'critical' ? 'text-accent-error' :
                                        alert.severity === 'warning' ? 'text-accent-warning' :
                                        'text-accent-info'
                                    }`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                                        {alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                                    </span>
                                    <div>
                                        <p className="text-sm text-white">{alert.message}</p>
                                        <p className="text-[10px] text-muted mt-1">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Maintenance History */}
                <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Maintenance Log</h3>
                    {maintenanceLogs.length === 0 ? (
                        <p className="text-sm text-muted py-4 text-center">No maintenance records</p>
                    ) : (
                        <div className="space-y-2">
                            {maintenanceLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                                    <span className="material-symbols-outlined text-[16px] text-muted mt-0.5" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                                        build
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{log.description}</p>
                                        <p className="text-[10px] text-muted">
                                            {new Date(log.date).toLocaleDateString()} &middot; {log.performedBy ?? 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: string }) {
    const config: Record<string, { label: string; cls: string }> = {
        IDLE: { label: 'Idle', cls: 'bg-white/5 text-muted' },
        FREEZING: { label: 'Freezing', cls: 'bg-hash-washing/15 text-hash-washing' },
        PRIMARY_DRYING: { label: 'Primary Drying', cls: 'bg-hash-drying/15 text-hash-drying' },
        SECONDARY_DRYING: { label: 'Final Dry', cls: 'bg-primary/15 text-primary' },
        COMPLETE: { label: 'Batch Complete', cls: 'bg-hash-complete/15 text-hash-complete' },
        ERROR: { label: 'Error', cls: 'bg-accent-error/15 text-accent-error animate-pulse-slow' },
    }
    const c = config[phase] ?? config.IDLE
    return (
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${c.cls}`}>
            {c.label}
        </span>
    )
}

function SensorReading({
    label,
    value,
    variant,
}: {
    label: string
    value: string
    variant?: 'success' | 'warning' | 'error'
}) {
    const valueColor = variant === 'success' ? 'text-hash-complete' :
        variant === 'warning' ? 'text-accent-warning' :
        variant === 'error' ? 'text-accent-error' :
        'text-white'

    return (
        <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>
                    thermostat
                </span>
                {label}
            </p>
            <p className={`text-lg font-mono ${valueColor}`}>{value}</p>
        </div>
    )
}

function RelayBadge({ label, on }: { label: string; on: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
            on ? 'bg-hash-complete/10 text-hash-complete' : 'bg-white/5 text-muted'
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-hash-complete' : 'bg-machine-offline'}`} />
            {label}
            <span className={`text-[10px] font-semibold ${on ? 'text-hash-complete' : 'text-accent-error'}`}>
                {on ? 'ON' : 'OFF'}
            </span>
        </span>
    )
}

function ControlButton({
    label,
    icon,
    disabled,
    variant,
    machineId,
    command,
}: {
    label: string
    icon: string
    disabled: boolean
    variant?: 'primary' | 'danger'
    machineId: string
    command: string
}) {
    const cls = variant === 'primary'
        ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
        : variant === 'danger'
        ? 'bg-accent-error/10 text-accent-error hover:bg-accent-error/20 border-accent-error/20'
        : 'bg-white/5 text-white hover:bg-white/10 border-white/10'

    return (
        <button
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${cls}`}
            title={disabled ? 'Machine must be online' : `${label} — ${command}`}
        >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                {icon}
            </span>
            {label}
        </button>
    )
}
