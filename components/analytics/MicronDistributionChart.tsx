'use client'

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

type MicronData = {
    grade: string
    weightG: number
    pct: number
}

// Matches micron.* tokens from tailwind.config.ts
const MICRON_COLORS: Record<string, string> = {
    '160u': '#f43f5e', // rose
    '120u': '#f97316', // orange
    '90u': '#eab308',  // yellow — premium
    '73u': '#22c55e',  // green — full melt
    '45u': '#3b82f6',  // blue
    '25u': '#8b5cf6',  // violet
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MicronData }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
        <div className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-2 text-xs shadow-panel">
            <p className="font-semibold text-white">{data.grade}</p>
            <p className="text-muted mt-1">
                <span className="font-mono text-white">{data.weightG}g</span> ({data.pct}%)
            </p>
        </div>
    )
}

function renderLegend(props: { payload?: Array<{ value: string; color: string }> }) {
    const { payload } = props
    if (!payload) return null
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    {entry.value}
                </div>
            ))}
        </div>
    )
}

export function MicronDistributionChart({ data }: { data: MicronData[] }) {
    const totalWeight = data.reduce((s, d) => s + d.weightG, 0)

    if (totalWeight === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-sm text-muted">
                No micron data available
            </div>
        )
    }

    // Filter out zero-weight grades
    const chartData = data.filter((d) => d.weightG > 0)

    return (
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Micron Distribution</h3>
            <p className="text-xs text-muted mb-4">
                Total: <span className="font-mono text-white">{totalWeight.toFixed(0)}g</span>
            </p>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="weightG"
                        nameKey="grade"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        strokeWidth={2}
                        stroke="#151515"
                    >
                        {chartData.map((entry) => (
                            <Cell
                                key={entry.grade}
                                fill={MICRON_COLORS[entry.grade] ?? '#6b7280'}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Legend content={renderLegend as any} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
