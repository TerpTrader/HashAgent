import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, Beaker } from 'lucide-react'
import { BatchCard } from '@/components/batches/BatchCard'

export const metadata = {
    title: 'Bubble Hash Batches',
}

export default async function BatchesPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batches = await db.hashBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { washDate: 'desc' },
        take: 50,
    })

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Bubble Hash Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        {batches.length} batch{batches.length !== 1 ? 'es' : ''} recorded
                    </p>
                </div>

                <Link
                    href="/batches/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Batch
                </Link>
            </div>

            {/* Batch Grid or Empty State */}
            {batches.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch, index) => (
                        <div key={batch.id} className="stagger-fade-in" style={{ '--stagger-index': index } as React.CSSProperties}>
                            <BatchCard
                                id={batch.id}
                                strain={batch.strain}
                                batchNumber={batch.batchNumber}
                                washDate={batch.washDate.toISOString()}
                                status={batch.status as any}
                                totalYieldG={batch.totalYieldG}
                                yieldPct={batch.yieldPct}
                                qualityTier={batch.qualityTier as any}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Beaker className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No batches yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Start your first wash. Create a batch to track your bubble hash
                        from material intake through allocation.
                    </p>
                    <Link
                        href="/batches/new"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        Create First Batch
                    </Link>
                </div>
            )}
        </div>
    )
}
