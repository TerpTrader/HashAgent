'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { KpiSummary } from '@/components/analytics/KpiSummary'
import { YieldByStrainChart } from '@/components/analytics/YieldByStrainChart'
import { MicronDistributionChart } from '@/components/analytics/MicronDistributionChart'
import { RosinTrendChart } from '@/components/analytics/RosinTrendChart'
import { BarChart3 } from 'lucide-react'
import { SkeletonKpi, SkeletonCard } from '@/components/ui/Skeleton'

type AnalyticsData = {
    period: string
    kpis: {
        totalHashBatches: number
        totalRosinBatches: number
        avgHashYieldPct: number
        totalOutputG: number
        bestStrain: { strain: string; avgYieldPct: number } | null
    }
    yieldByStrain: Array<{
        strain: string
        batchCount: number
        avgYieldPct: number
        totalOutputG: number
    }>
    micronDistribution: Array<{
        grade: string
        weightG: number
        pct: number
    }>
    rosinTrends: Array<{
        month: string
        batchCount: number
        avgYieldPct: number
    }>
}

const PERIODS = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' },
]

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('90d')
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/analytics/yields?period=${period}`)
            if (!res.ok) throw new Error('Failed to fetch analytics')
            const json = await res.json()
            setData(json.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Analytics</h1>
                    <p className="mt-1 text-sm text-muted">
                        Yield performance, micron distribution, and trends
                    </p>
                </div>

                {/* Period selector */}
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-surface p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                period === p.value
                                    ? 'bg-primary text-white'
                                    : 'text-muted hover:text-white'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-4">
                        <SkeletonCard className="h-64" />
                        <SkeletonCard className="h-64" />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-accent-error/30 bg-accent-error/5 px-4 py-3">
                    <p className="text-sm text-accent-error">{error}</p>
                </div>
            )}

            {/* Data */}
            {data && !loading && (
                <>
                    {/* KPI Cards */}
                    <KpiSummary data={data.kpis} />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <YieldByStrainChart data={data.yieldByStrain} />
                        </div>
                        <div>
                            <MicronDistributionChart data={data.micronDistribution} />
                        </div>
                    </div>

                    {/* Rosin Trend (full width) */}
                    <RosinTrendChart data={data.rosinTrends} />
                </>
            )}

            {/* Empty state */}
            {data && !loading && data.kpis.totalHashBatches === 0 && data.kpis.totalRosinBatches === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No data to analyze</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Create some bubble hash or rosin batches to see yield analytics,
                        micron distribution, and trend data here.
                    </p>
                </div>
            )}
        </div>
    )
}
