'use client'

import { useEffect, useState } from 'react'
import { RosinCard } from '@/components/rosin/RosinCard'
import { Loader2, Plus } from 'lucide-react'

interface RosinBatch {
    id: string
    strain: string
    batchNumber: string
    processDate: string
    productType: 'FULL_PRESS' | 'BADDER' | 'VAPE' | 'LIVE_ROSIN' | 'COLD_CURE'
    rosinYieldWeightG: number | null
    rosinYieldPct: number | null
    status: 'PRESSING' | 'POST_PROCESSING' | 'DECARB' | 'COMPLETE' | 'ARCHIVED'
    companyProcessedFor: string | null
}

export default function RosinListPage() {
    const [batches, setBatches] = useState<RosinBatch[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBatches() {
            try {
                const res = await fetch('/api/rosin')
                const json = await res.json()
                setBatches(json.data ?? [])
            } catch {
                // silent
            } finally {
                setLoading(false)
            }
        }
        fetchBatches()
    }, [])

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Rosin Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        Track rosin presses from source hash to finished product.
                    </p>
                </div>
                <a
                    href="/rosin/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Press
                </a>
            </div>

            {/* Content */}
            {loading ? (
                <div className="mt-16 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted" />
                    <span className="ml-2 text-sm text-muted">Loading rosin batches...</span>
                </div>
            ) : batches.length === 0 ? (
                <div className="mt-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                        <span className="material-symbols-outlined text-3xl text-muted">local_fire_department</span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-white">No rosin batches yet</h3>
                    <p className="mt-1 text-sm text-muted">
                        Press your first rosin batch from completed bubble hash.
                    </p>
                    <a
                        href="/rosin/new"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        New Press
                    </a>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map(batch => (
                        <RosinCard
                            key={batch.id}
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
                    ))}
                </div>
            )}
        </div>
    )
}
