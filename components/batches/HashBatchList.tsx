'use client'

import Link from 'next/link'
import { Plus, Beaker } from 'lucide-react'
import { BatchCard } from '@/components/batches/BatchCard'
import { BatchListShell } from '@/components/shared/BatchListShell'

const HASH_STATUS_OPTIONS = [
    { value: 'WASHING', label: 'Washing' },
    { value: 'DRYING', label: 'Drying' },
    { value: 'COMPLETE', label: 'Complete' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'ARCHIVED', label: 'Archived' },
]

export function HashBatchList() {
    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Bubble Hash Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        Track your bubble hash from wash through allocation
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

            {/* Filterable batch list */}
            <BatchListShell
                apiPath="/api/batches"
                statusOptions={HASH_STATUS_OPTIONS}
                newBatchHref="/batches/new"
                newBatchLabel="Create First Batch"
                emptyIcon={<Beaker className="h-8 w-8 text-primary" />}
                emptyTitle="No batches yet"
                emptyDescription="Start your first wash. Create a batch to track your bubble hash from material intake through allocation."
                renderCard={(batch) => (
                    <BatchCard
                        id={batch.id}
                        strain={batch.strain}
                        batchNumber={batch.batchNumber}
                        washDate={batch.washDate}
                        status={batch.status}
                        totalYieldG={batch.totalYieldG}
                        yieldPct={batch.yieldPct}
                        qualityTier={batch.qualityTier}
                    />
                )}
            />
        </div>
    )
}
