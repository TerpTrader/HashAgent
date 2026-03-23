import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.orgId) return null

    // Fetch summary stats
    const [hashBatchCount, rosinBatchCount, freezeDryerCount, activeAlerts] = await Promise.all([
        db.hashBatch.count({ where: { orgId: session.orgId } }),
        db.rosinBatch.count({ where: { orgId: session.orgId } }),
        db.freezeDryer.count({ where: { orgId: session.orgId } }),
        db.haAlert.count({ where: { orgId: session.orgId, status: 'ACTIVE' } }),
    ])

    // Recent batches
    const recentBatches = await db.hashBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            batchNumber: true,
            strain: true,
            status: true,
            totalYieldG: true,
            yieldPct: true,
            washDate: true,
        },
    })

    // Online freeze dryers
    const freezeDryers = await db.freezeDryer.findMany({
        where: { orgId: session.orgId },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            callsign: true,
            isOnline: true,
            currentPhase: true,
            currentTempF: true,
            currentPressureMt: true,
            batchProgress: true,
        },
    })

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <p className="text-sm text-muted mt-1">
                    Welcome back. Here&apos;s what&apos;s happening in your lab.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Hash Batches"
                    value={hashBatchCount}
                    icon="science"
                />
                <KpiCard
                    label="Rosin Batches"
                    value={rosinBatchCount}
                    icon="local_fire_department"
                />
                <KpiCard
                    label="Freeze Dryers"
                    value={freezeDryerCount}
                    icon="ac_unit"
                />
                <KpiCard
                    label="Active Alerts"
                    value={activeAlerts}
                    icon="warning"
                    variant={activeAlerts > 0 ? 'warning' : 'default'}
                />
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Batches */}
                <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">Recent Hash Batches</h2>
                        <a href="/batches" className="text-xs text-primary hover:underline">
                            View all
                        </a>
                    </div>
                    {recentBatches.length === 0 ? (
                        <EmptyState
                            message="No batches yet"
                            action="Start your first wash"
                            href="/batches/new"
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentBatches.map((batch) => (
                                <a
                                    key={batch.id}
                                    href={`/batches/${batch.id}`}
                                    className="flex items-center justify-between py-2 px-3 -mx-1 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {batch.strain}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {batch.batchNumber} &middot; {new Date(batch.washDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={batch.status} />
                                        {batch.totalYieldG != null && (
                                            <p className="text-xs text-muted mt-0.5">
                                                {batch.totalYieldG.toFixed(0)}g
                                                {batch.yieldPct != null && (
                                                    <span className="text-primary ml-1">
                                                        ({batch.yieldPct.toFixed(1)}%)
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Freeze Dryer Fleet */}
                <div className="bg-surface-card border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">Freeze Dryers</h2>
                        <a href="/freeze-dryers" className="text-xs text-primary hover:underline">
                            View fleet
                        </a>
                    </div>
                    {freezeDryers.length === 0 ? (
                        <EmptyState
                            message="No freeze dryers configured"
                            action="Add a machine"
                            href="/freeze-dryers"
                        />
                    ) : (
                        <div className="space-y-3">
                            {freezeDryers.map((fd) => (
                                <a
                                    key={fd.id}
                                    href={`/freeze-dryers/${fd.id}`}
                                    className="flex items-center justify-between py-2 px-3 -mx-1 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${fd.isOnline ? 'bg-machine-online' : 'bg-machine-offline'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {fd.name}
                                                {fd.callsign && (
                                                    <span className="text-muted ml-1">({fd.callsign})</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted capitalize">
                                                {fd.currentPhase.toLowerCase().replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs">
                                        {fd.currentTempF != null && (
                                            <p className="text-white">{fd.currentTempF.toFixed(1)}°F</p>
                                        )}
                                        {fd.currentPressureMt != null && (
                                            <p className="text-muted">{Math.round(fd.currentPressureMt)} mTorr</p>
                                        )}
                                        {fd.batchProgress != null && fd.batchProgress > 0 && (
                                            <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${fd.batchProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────

function KpiCard({
    label,
    value,
    icon,
    variant = 'default',
}: {
    label: string
    value: number
    icon: string
    variant?: 'default' | 'warning'
}) {
    return (
        <div className="bg-surface-card border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <span
                    className={`material-symbols-outlined text-[18px] ${
                        variant === 'warning' ? 'text-accent-warning' : 'text-muted'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                >
                    {icon}
                </span>
                <p className="text-xs text-muted">{label}</p>
            </div>
            <p className={`text-2xl font-semibold ${
                variant === 'warning' && value > 0 ? 'text-accent-warning' : 'text-white'
            }`}>
                {value}
            </p>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        WASHING: 'bg-hash-washing/15 text-hash-washing',
        DRYING: 'bg-hash-drying/15 text-hash-drying',
        COMPLETE: 'bg-hash-complete/15 text-hash-complete',
        ALLOCATED: 'bg-hash-allocated/15 text-hash-allocated',
        ARCHIVED: 'bg-white/5 text-muted',
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${colors[status] ?? 'bg-white/5 text-muted'}`}>
            {status.toLowerCase()}
        </span>
    )
}

function EmptyState({
    message,
    action,
    href,
}: {
    message: string
    action: string
    href: string
}) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted mb-3">{message}</p>
            <a
                href={href}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>add</span>
                {action}
            </a>
        </div>
    )
}
