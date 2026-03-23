'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart,
} from 'recharts'

type RosinTrend = {
    month: string
    batchCount: number
    avgYieldPct: number
}

function formatMonth(month: string): string {
    const [year, m] = month.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(m) - 1]} '${year.slice(2)}`
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RosinTrend }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
        <div className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-2 text-xs shadow-panel">
            <p className="font-semibold text-white">{formatMonth(data.month)}</p>
            <p className="text-muted mt-1">
                <span className="font-mono text-white">{data.avgYieldPct.toFixed(2)}%</span> avg yield
            </p>
            <p className="text-muted">
                <span className="font-mono text-white">{data.batchCount}</span> batch{data.batchCount !== 1 ? 'es' : ''}
            </p>
        </div>
    )
}

export function RosinTrendChart({ data }: { data: RosinTrend[] }) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-sm text-muted">
                No rosin trend data available
            </div>
        )
    }

    const avgYield = data.reduce((s, d) => s + d.avgYieldPct, 0) / data.length
    const chartData = data.map((d) => ({ ...d, monthLabel: formatMonth(d.month) }))

    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Rosin Yield Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="monthLabel"
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                        y={avgYield}
                        stroke="#9ca3af"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        label={{
                            value: `Avg ${avgYield.toFixed(1)}%`,
                            position: 'right',
                            fill: '#9ca3af',
                            fontSize: 10,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="avgYieldPct"
                        fill="rgba(20,184,166,0.08)"
                        stroke="none"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgYieldPct"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={{ fill: '#14b8a6', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#14b8a6', stroke: '#151515', strokeWidth: 2 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
