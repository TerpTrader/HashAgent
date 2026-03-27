'use client'

import Link from 'next/link'
import { Plus, Stamp } from 'lucide-react'
import { PressedCard } from '@/components/pressed/PressedCard'
import { BatchListShell } from '@/components/shared/BatchListShell'

const PRESSED_STATUS_OPTIONS = [
    { value: 'PRESSING', label: 'Pressing' },
    { value: 'COMPLETE', label: 'Complete' },
    { value: 'ARCHIVED', label: 'Archived' },
]

export function PressedBatchList() {
    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Pressed Hash</h1>
                    <p className="mt-1 text-sm text-muted">
                        Track pressed hash from source material through completion
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

            <BatchListShell
                apiPath="/api/pressed"
                statusOptions={PRESSED_STATUS_OPTIONS}
                newBatchHref="/pressed/new"
                newBatchLabel="Create First Batch"
                emptyIcon={<Stamp className="h-8 w-8 text-primary" />}
                emptyTitle="No pressed hash batches yet"
                emptyDescription="Start pressing hash. Create a batch to track your pressed hash from source material through completion."
                renderCard={(batch) => (
                    <PressedCard
                        id={batch.id}
                        strain={batch.strain ?? batch.sourceHashBatch?.strain ?? '—'}
                        batchNumber={batch.batchNumber}
                        pressDate={batch.pressDate}
                        inputWeightG={batch.inputWeightG}
                        finalWeightG={batch.finalWeightG}
                        processingLossPct={batch.processingLossPct}
                        status={batch.status}
                        sourceBatchNumber={batch.sourceHashBatch?.batchNumber ?? null}
                    />
                )}
            />
        </div>
    )
}
