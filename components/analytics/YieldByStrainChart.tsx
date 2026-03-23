'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

type StrainYield = {
    strain: string
    batchCount: number
    avgYieldPct: number
    totalOutputG: number
}

const TIER_COLORS = {
    high: '#22c55e',   // green — >4% yield
    mid: '#eab308',    // yellow — 2-4% yield
    low: '#ef4444',    // red — <2% yield
}

function getBarColor(yieldPct: number): string {
    if (yieldPct >= 4) return TIER_COLORS.high
    if (yieldPct >= 2) return TIER_COLORS.mid
    return TIER_COLORS.low
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: StrainYield }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
        <div className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-2 text-xs shadow-panel">
            <p className="font-semibold text-white">{data.strain}</p>
            <p className="text-muted mt-1">
                <span className="font-mono text-white">{data.avgYieldPct.toFixed(2)}%</span> avg yield
            </p>
            <p className="text-muted">
                <span className="font-mono text-white">{data.batchCount}</span> batch{data.batchCount !== 1 ? 'es' : ''}
            </p>
            <p className="text-muted">
                <span className="font-mono text-white">{data.totalOutputG.toFixed(0)}g</span> total output
            </p>
        </div>
    )
}

export function YieldByStrainChart({ data }: { data: StrainYield[] }) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-sm text-muted">
                No batch data available
            </div>
        )
    }

    // Show top 12 strains
    const chartData = data.slice(0, 12)

    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Yield by Strain</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="strain"
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="avgYieldPct" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={getBarColor(entry.avgYieldPct)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
