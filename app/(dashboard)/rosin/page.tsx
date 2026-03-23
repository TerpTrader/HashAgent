import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { RosinCard } from '@/components/rosin/RosinCard'

export const metadata = {
    title: 'Rosin Batches',
}

export default async function RosinListPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batches = await db.rosinBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { processDate: 'desc' },
        take: 50,
    })

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Rosin Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        {batches.length} batch{batches.length !== 1 ? 'es' : ''} recorded
                    </p>
                </div>
                <Link
                    href="/rosin/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Press
                </Link>
            </div>

            {batches.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <RosinCard
                            key={batch.id}
                            id={batch.id}
                            strain={batch.strain}
                            batchNumber={batch.batchNumber}
                            processDate={batch.processDate.toISOString()}
                            productType={batch.productType as any}
                            rosinYieldWeightG={batch.rosinYieldWeightG}
                            rosinYieldPct={batch.rosinYieldPct}
                            status={batch.status as any}
                            companyProcessedFor={batch.companyProcessedFor}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <span className="material-symbols-outlined text-3xl text-primary">local_fire_department</span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No rosin batches yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Press your first rosin batch from completed bubble hash.
                    </p>
                    <Link
                        href="/rosin/new"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        New Press
                    </Link>
                </div>
            )}
        </div>
    )
}
