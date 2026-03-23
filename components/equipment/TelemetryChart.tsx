'use client'

import { useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'

interface TelemetryPoint {
    timestamp: string
    temperatureF: number | null
    pressureMt: number | null
    phase: string | null
    trayTempZoneA: number | null
    trayTempZoneB: number | null
    trayTempZoneC: number | null
    condenserTempF: number | null
}

interface TelemetryChartProps {
    data: TelemetryPoint[]
    mTorrReference?: number // configurable reference line for drying endpoint
}

type ViewMode = 'combined' | 'pressure' | 'temperature'

export function TelemetryChart({ data, mTorrReference = 200 }: TelemetryChartProps) {
    const [view, setView] = useState<ViewMode>('combined')

    const formatted = data.map((point) => ({
        ...point,
        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        elapsed: Math.round(
            (new Date(point.timestamp).getTime() - new Date(data[0]?.timestamp ?? 0).getTime()) / 60000
        ),
    }))

    return (
        <div className="bg-surface-card border border-white/5 rounded-xl p-5">
            {/* View toggle — inspired by Hashy.so's Monitor/Graph toggle */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Telemetry</h3>
                <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                    {(['combined', 'pressure', 'temperature'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setView(mode)}
                            className={cn(
                                'px-3 py-1 text-xs rounded-md transition-colors capitalize',
                                view === mode
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted hover:text-white'
                            )}
                        >
                            {mode === 'combined' ? 'All' : mode}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="time"
                        stroke="#6b7280"
                        fontSize={10}
                        tickLine={false}
                    />

                    {/* Left Y-axis: Temperature */}
                    {(view === 'combined' || view === 'temperature') && (
                        <YAxis
                            yAxisId="temp"
                            orientation="left"
                            stroke="#6b7280"
                            fontSize={10}
                            tickLine={false}
                            label={{
                                value: '°F',
                                position: 'insideTopLeft',
                                offset: 10,
                                style: { fill: '#6b7280', fontSize: 10 },
                            }}
                        />
                    )}

                    {/* Right Y-axis: Pressure */}
                    {(view === 'combined' || view === 'pressure') && (
                        <YAxis
                            yAxisId="pressure"
                            orientation="right"
                            stroke="#6b7280"
                            fontSize={10}
                            tickLine={false}
                            label={{
                                value: 'mTorr',
                                position: 'insideTopRight',
                                offset: 10,
                                style: { fill: '#6b7280', fontSize: 10 },
                            }}
                        />
                    )}

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#151515',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                    />

                    {/* Temperature lines */}
                    {(view === 'combined' || view === 'temperature') && (
                        <>
                            <Line
                                yAxisId="temp"
                                type="monotone"
                                dataKey="temperatureF"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                                name="Shelf Temp"
                            />
                            <Line
                                yAxisId="temp"
                                type="monotone"
                                dataKey="condenserTempF"
                                stroke="#22c55e"
                                strokeWidth={1.5}
                                dot={false}
                                name="Condenser"
                                strokeDasharray="4 4"
                            />
                        </>
                    )}

                    {/* Pressure line */}
                    {(view === 'combined' || view === 'pressure') && (
                        <>
                            <Line
                                yAxisId="pressure"
                                type="monotone"
                                dataKey="pressureMt"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name="Vacuum (mTorr)"
                            />
                            {/* Reference line for drying endpoint */}
                            <ReferenceLine
                                yAxisId="pressure"
                                y={mTorrReference}
                                stroke="#22c55e"
                                strokeDasharray="8 4"
                                label={{
                                    value: `${mTorrReference} mTorr`,
                                    position: 'right',
                                    style: { fill: '#22c55e', fontSize: 10 },
                                }}
                            />
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted">
                {(view === 'combined' || view === 'temperature') && (
                    <>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-[#f97316] rounded" />
                            Shelf Temp
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-[#22c55e] rounded" style={{ borderBottom: '1px dashed' }} />
                            Condenser
                        </span>
                    </>
                )}
                {(view === 'combined' || view === 'pressure') && (
                    <>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-[#3b82f6] rounded" />
                            Vacuum
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-0.5 border-b border-dashed border-[#22c55e]" />
                            Target ({mTorrReference} mTorr)
                        </span>
                    </>
                )}
            </div>
        </div>
    )
}
