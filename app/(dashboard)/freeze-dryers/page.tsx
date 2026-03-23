import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { FreezeDryerCard } from '@/components/equipment/FreezeDryerCard'

export const metadata = { title: 'Freeze Dryers' }

export default async function FreezeDryersPage() {
    const session = await auth()
    if (!session?.orgId) return null

    const dryers = await db.freezeDryer.findMany({
        where: { orgId: session.orgId },
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: {
                    alerts: { where: { status: 'ACTIVE' } },
                },
            },
        },
    })

    const onlineCount = dryers.filter((d) => d.isOnline).length
    const activeCount = dryers.filter((d) =>
        d.currentPhase !== 'IDLE' && d.currentPhase !== 'COMPLETE'
    ).length

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Freeze Dryers</h1>
                    <p className="text-sm text-muted mt-1">
                        {onlineCount} online &middot; {activeCount} active
                        {dryers.length > 0 && ` &middot; ${dryers.length} total`}
                    </p>
                </div>
                <a
                    href="/equipment"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                        add
                    </span>
                    Add Machine
                </a>
            </div>

            {/* Fleet Grid */}
            {dryers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-card border border-white/5 rounded-xl">
                    <span className="material-symbols-outlined text-[48px] text-muted/30 mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                        ac_unit
                    </span>
                    <h2 className="text-lg font-medium text-white mb-2">No freeze dryers configured</h2>
                    <p className="text-sm text-muted mb-6 max-w-md">
                        Add your Harvest Right freeze dryers to monitor temperature, vacuum pressure, and batch progress in real time.
                    </p>
                    <a
                        href="/equipment"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                    >
                        Add your first machine
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {dryers.map((dryer) => (
                        <FreezeDryerCard
                            key={dryer.id}
                            id={dryer.id}
                            name={dryer.name}
                            callsign={dryer.callsign}
                            model={dryer.model}
                            isOnline={dryer.isOnline}
                            currentPhase={dryer.currentPhase}
                            currentTempF={dryer.currentTempF}
                            currentPressureMt={dryer.currentPressureMt}
                            batchProgress={dryer.batchProgress}
                            batchStartedAt={dryer.batchStartedAt?.toISOString() ?? null}
                            alertCount={dryer._count.alerts}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
