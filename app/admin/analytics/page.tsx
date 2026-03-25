'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, Activity } from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts'

const PLAN_COLORS: Record<string, string> = {
    HOME: '#6b7280',
    PRO: '#14b8a6',
    COMMERCIAL: '#f59e0b',
    ENTERPRISE: '#a78bfa',
}

const DATE_RANGES = [
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
] as const

type AnalyticsData = {
    data: {
        signupTrend: { date: string; count: number }[]
        engagement: { dau: number; wau: number; mau: number }
        planDistribution: { plan: string; count: number }[]
    }
}

export default function AdminAnalyticsPage() {
    const [days, setDays] = useState(30)

    const { data, isLoading } = useQuery<AnalyticsData>({
        queryKey: ['admin-analytics', days],
        queryFn: async () => {
            const res = await fetch(`/api/admin/analytics?days=${days}`)
            if (!res.ok) throw new Error('Failed to fetch analytics')
            return res.json()
        },
    })

    const signupTrend = data?.data.signupTrend ?? []
    const engagement = data?.data.engagement ?? { dau: 0, wau: 0, mau: 0 }
    const planDistribution = data?.data.planDistribution ?? []

    const engagementKpis = [
        { label: 'DAU', sublabel: 'Daily Active', value: engagement.dau, icon: Activity, color: '#14b8a6' },
        { label: 'WAU', sublabel: 'Weekly Active', value: engagement.wau, icon: UserCheck, color: '#3b82f6' },
        { label: 'MAU', sublabel: 'Monthly Active', value: engagement.mau, icon: Users, color: '#a78bfa' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-sm text-muted mt-1">
                        Platform usage and growth metrics.
                    </p>
                </div>

                {/* Date range selector */}
                <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-lg p-1">
                    {DATE_RANGES.map(({ label, days: d }) => (
                        <button
                            key={label}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                                days === d
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-muted hover:text-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Engagement KPIs */}
            <div className="grid grid-cols-3 gap-4">
                {engagementKpis.map(({ label, sublabel, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4" style={{ color }} />
                            <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {isLoading ? '—' : value.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted mt-1">{sublabel} Users</p>
                    </div>
                ))}
            </div>

            {/* Signup trend chart */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Signup Trend</h2>
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : signupTrend.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-muted">
                        No signup data for this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={signupTrend}>
                            <defs>
                                <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: string) => {
                                    const d = new Date(v + 'T00:00:00')
                                    return `${d.getMonth() + 1}/${d.getDate()}`
                                }}
                                interval={Math.max(0, Math.floor(signupTrend.length / 8))}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1c1c1c',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#fff',
                                }}
                                labelFormatter={(v) => {
                                    const d = new Date(String(v) + 'T00:00:00')
                                    return d.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                fill="url(#signupGradient)"
                                name="Signups"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Plan distribution chart */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Plan Distribution</h2>
                {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={planDistribution} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="plan"
                                stroke="#6b7280"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1c1c1c',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Bar dataKey="count" name="Organizations" radius={[4, 4, 0, 0]}>
                                {planDistribution.map((entry) => (
                                    <Cell
                                        key={entry.plan}
                                        fill={PLAN_COLORS[entry.plan] ?? '#6b7280'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
