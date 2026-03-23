import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, Stamp } from 'lucide-react'
import { PressedCard } from '@/components/pressed/PressedCard'

export const metadata = {
    title: 'Pressed Hash',
}

export default async function PressedPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batches = await db.pressedBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { pressDate: 'desc' },
        take: 50,
        include: { sourceHashBatch: { select: { strain: true, batchNumber: true } } },
    })

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Pressed Hash</h1>
                    <p className="mt-1 text-sm text-muted">
                        {batches.length} batch{batches.length !== 1 ? 'es' : ''} recorded
                    </p>
                </div>

                <Link
                    href="/pressed/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Batch
                </Link>
            </div>

            {/* Batch Grid or Empty State */}
            {batches.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <PressedCard
                            key={batch.id}
                            id={batch.id}
                            strain={batch.strain ?? batch.sourceHashBatch.strain}
                            batchNumber={batch.batchNumber}
                            pressDate={batch.pressDate.toISOString()}
                            inputWeightG={batch.inputWeightG}
                            finalWeightG={batch.finalWeightG}
                            processingLossPct={batch.processingLossPct}
                            status={batch.status as any}
                            sourceBatchNumber={batch.sourceHashBatch.batchNumber}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Stamp className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No pressed hash batches yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Start pressing hash. Create a batch to track your pressed hash
                        from source material through completion.
                    </p>
                    <Link
                        href="/pressed/new"
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
