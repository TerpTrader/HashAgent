import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, Wrench } from 'lucide-react'
import { MaintenanceCard } from '@/components/maintenance/MaintenanceCard'
import type { HaMaintenanceCategory, HaMaintenanceStatus } from '@/types'

export const metadata = {
    title: 'Maintenance Logs',
}

export default async function MaintenancePage({
    searchParams,
}: {
    searchParams: { category?: string }
}) {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const categoryFilter = searchParams.category

    const where: Record<string, unknown> = { orgId: session.orgId }
    if (categoryFilter && categoryFilter !== 'ALL') {
        where.category = categoryFilter
    }

    const [logs, total] = await Promise.all([
        db.haEquipmentMaintenanceLog.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 50,
        }),
        db.haEquipmentMaintenanceLog.count({ where: { orgId: session.orgId } }),
    ])

    // Category filter tabs
    const categories = [
        { value: 'ALL', label: 'All' },
        { value: 'FREEZE_DRYER', label: 'Freeze Dryer' },
        { value: 'WATER_FILTRATION', label: 'Water Filtration' },
        { value: 'PRESS', label: 'Press' },
        { value: 'RO_SYSTEM', label: 'RO System' },
        { value: 'WASH_TANK', label: 'Wash Tank' },
        { value: 'GENERAL', label: 'Other' },
    ]

    const activeCategory = categoryFilter ?? 'ALL'

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Maintenance Logs</h1>
                    <p className="mt-1 text-sm text-muted">
                        {total} log{total !== 1 ? 's' : ''} recorded
                    </p>
                </div>

                <Link
                    href="/maintenance/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    Log Maintenance
                </Link>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                    <Link
                        key={cat.value}
                        href={cat.value === 'ALL' ? '/maintenance' : `/maintenance?category=${cat.value}`}
                        className={
                            activeCategory === cat.value
                                ? 'rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary border border-primary/20 transition-colors'
                                : 'rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-muted border border-white/5 hover:border-white/10 hover:text-white transition-colors'
                        }
                    >
                        {cat.label}
                    </Link>
                ))}
            </div>

            {/* Logs Grid or Empty State */}
            {logs.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {logs.map((log) => (
                        <MaintenanceCard
                            key={log.id}
                            id={log.id}
                            category={log.category as HaMaintenanceCategory}
                            equipmentName={log.equipmentName}
                            date={log.date.toISOString()}
                            description={log.description}
                            performedBy={log.performedBy}
                            status={log.status as HaMaintenanceStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Wrench className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No maintenance logs yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Keep your equipment running at peak performance. Log maintenance
                        activities to track service history and schedule future work.
                    </p>
                    <Link
                        href="/maintenance/new"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        Log First Maintenance
                    </Link>
                </div>
            )}
        </div>
    )
}
