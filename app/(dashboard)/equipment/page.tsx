import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, Snowflake, Droplets, Wrench } from 'lucide-react'
import { EquipmentCard } from '@/components/equipment/EquipmentCard'

export const metadata = {
    title: 'Equipment Registry',
}

export default async function EquipmentPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const [freezeDryers, waterSystems] = await Promise.all([
        db.freezeDryer.findMany({
            where: { orgId: session.orgId },
            orderBy: { name: 'asc' },
        }),
        db.waterFiltrationSystem.findMany({
            where: { orgId: session.orgId },
            orderBy: { name: 'asc' },
        }),
    ])

    const totalCount = freezeDryers.length + waterSystems.length

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Equipment Registry</h1>
                    <p className="mt-1 text-sm text-muted">
                        {totalCount} piece{totalCount !== 1 ? 's' : ''} of equipment registered
                    </p>
                </div>

                <Link
                    href="/equipment/register"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    Register Equipment
                </Link>
            </div>

            {totalCount === 0 ? (
                /* Empty state when no equipment at all */
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Wrench className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No equipment registered</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Register your freeze dryers and water filtration systems to track
                        maintenance, monitor status, and log equipment data.
                    </p>
                    <Link
                        href="/equipment/register"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        Register First Equipment
                    </Link>
                </div>
            ) : (
                <div className="mt-8 space-y-8">
                    {/* Freeze Dryers Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Snowflake className="h-4 w-4 text-cyan-400" />
                            <h2 className="text-lg font-medium text-white">Freeze Dryers</h2>
                            <span className="ml-1 text-sm text-muted">({freezeDryers.length})</span>
                        </div>

                        {freezeDryers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {freezeDryers.map((dryer) => (
                                    <EquipmentCard
                                        key={dryer.id}
                                        id={dryer.id}
                                        name={dryer.name}
                                        type="freeze_dryer"
                                        model={dryer.model}
                                        serial={dryer.serial}
                                        isOnline={dryer.isOnline}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/5 bg-surface-card p-8 text-center">
                                <Snowflake className="mx-auto h-8 w-8 text-muted/30" />
                                <p className="mt-2 text-sm text-muted">No freeze dryers registered</p>
                                <Link
                                    href="/equipment/register"
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add freeze dryer
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Water Filtration Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="h-4 w-4 text-blue-400" />
                            <h2 className="text-lg font-medium text-white">Water Filtration Systems</h2>
                            <span className="ml-1 text-sm text-muted">({waterSystems.length})</span>
                        </div>

                        {waterSystems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {waterSystems.map((system) => (
                                    <EquipmentCard
                                        key={system.id}
                                        id={system.id}
                                        name={system.name}
                                        type="water_filtration"
                                        model={system.model}
                                        serial={null}
                                        isOnline={null}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/5 bg-surface-card p-8 text-center">
                                <Droplets className="mx-auto h-8 w-8 text-muted/30" />
                                <p className="mt-2 text-sm text-muted">No water filtration systems registered</p>
                                <Link
                                    href="/equipment/register"
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add water filtration system
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
