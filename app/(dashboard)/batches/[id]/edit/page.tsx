'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { HashBatchEditForm } from '@/components/batches/HashBatchEditForm'

export default function EditHashBatchPage() {
    const params = useParams()
    const router = useRouter()
    const [batch, setBatch] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBatch() {
            try {
                const res = await fetch(`/api/batches/${params.id}`)
                const json = await res.json()
                if (json.data) setBatch(json.data)
            } catch {
                // silent
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchBatch()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
                <span className="ml-2 text-sm text-muted">Loading batch...</span>
            </div>
        )
    }

    if (!batch) {
        return (
            <div className="py-24 text-center">
                <p className="text-lg font-medium text-white">Batch not found</p>
                <a href="/batches" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to Batches
                </a>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl animate-fade-in">
            <a
                href={`/batches/${params.id}`}
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Batch
            </a>

            <h1 className="text-2xl font-semibold text-white mb-6">
                Edit — {batch.strain} <span className="text-muted font-mono text-base ml-2">{batch.batchNumber}</span>
            </h1>

            <HashBatchEditForm
                batch={batch}
                onSave={() => router.push(`/batches/${params.id}`)}
            />
        </div>
    )
}
