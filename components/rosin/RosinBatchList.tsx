'use client'

import Link from 'next/link'
import { Plus, Flame } from 'lucide-react'
import { RosinCard } from '@/components/rosin/RosinCard'
import { BatchListShell } from '@/components/shared/BatchListShell'

const ROSIN_STATUS_OPTIONS = [
    { value: 'PRESSING', label: 'Pressing' },
    { value: 'POST_PROCESSING', label: 'Post Processing' },
    { value: 'DECARB', label: 'Decarb' },
    { value: 'COMPLETE', label: 'Complete' },
    { value: 'ARCHIVED', label: 'Archived' },
]

export function RosinBatchList() {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Rosin Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        Track rosin presses from hash input through final output
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

            <BatchListShell
                apiPath="/api/rosin"
                statusOptions={ROSIN_STATUS_OPTIONS}
                newBatchHref="/rosin/new"
                newBatchLabel="New Press"
                emptyIcon={<Flame className="h-8 w-8 text-primary" />}
                emptyTitle="No rosin batches yet"
                emptyDescription="Press your first rosin batch from completed bubble hash."
                renderCard={(batch) => (
                    <RosinCard
                        id={batch.id}
                        strain={batch.strain}
                        batchNumber={batch.batchNumber}
                        processDate={batch.processDate}
                        productType={batch.productType}
                        rosinYieldWeightG={batch.rosinYieldWeightG}
                        rosinYieldPct={batch.rosinYieldPct}
                        status={batch.status}
                        companyProcessedFor={batch.companyProcessedFor}
                    />
                )}
            />
        </div>
    )
}
