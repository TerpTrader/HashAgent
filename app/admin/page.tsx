import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { Users, Building2, UserPlus, Activity } from 'lucide-react'
import { format } from 'date-fns'

const PLAN_COLORS: Record<string, string> = {
    HOME: '#6b7280',
    PRO: '#14b8a6',
    COMMERCIAL: '#f59e0b',
    ENTERPRISE: '#a78bfa',
}

export default async function AdminOverviewPage() {
    const session = await requireAdmin()
    if (!session) redirect('/dashboard')

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all KPIs in parallel
    const [totalUsers, totalOrgs, signupsThisWeek, activeThisWeek, planDistribution, recentUsers] =
        await Promise.all([
            db.user.count(),
            db.organization.count(),
            db.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
            db.user.count({ where: { lastLoginAt: { gte: oneWeekAgo } } }),
            db.organization.groupBy({ by: ['plan'], _count: { plan: true } }),
            db.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    memberships: {
                        include: { org: { select: { name: true, plan: true } } },
                        take: 1,
                    },
                },
            }),
        ])

    const kpis = [
        { label: 'Total Users', value: totalUsers, icon: Users, color: '#14b8a6' },
        { label: 'Total Organizations', value: totalOrgs, icon: Building2, color: '#3b82f6' },
        { label: 'Signups This Week', value: signupsThisWeek, icon: UserPlus, color: '#f59e0b' },
        { label: 'Active This Week', value: activeThisWeek, icon: Activity, color: '#a78bfa' },
    ]

    // Normalize plan distribution so all plans appear
    const planCounts: Record<string, number> = { HOME: 0, PRO: 0, COMMERCIAL: 0, ENTERPRISE: 0 }
    for (const row of planDistribution) {
        planCounts[row.plan] = row._count.plan
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
                <p className="text-sm text-muted mt-1">High-level metrics across all Hash Agent accounts.</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4" style={{ color }} />
                            <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Plan distribution */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Plan Distribution</h2>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(planCounts).map(([plan, count]) => (
                        <span
                            key={plan}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: `${PLAN_COLORS[plan]}15`,
                                color: PLAN_COLORS[plan],
                                border: `1px solid ${PLAN_COLORS[plan]}30`,
                            }}
                        >
                            {plan}
                            <span className="font-bold">{count}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Recent signups table */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Name
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Email
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Verified
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Plan
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((user) => {
                                const membership = user.memberships[0]
                                const plan = membership?.org?.plan ?? 'HOME'
                                return (
                                    <tr
                                        key={user.id}
                                        className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-white">
                                            {user.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block w-2 h-2 rounded-full ${
                                                    user.emailVerified
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-block text-xs font-medium px-2 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${PLAN_COLORS[plan]}20`,
                                                    color: PLAN_COLORS[plan],
                                                }}
                                            >
                                                {plan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted">
                                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </td>
                                    </tr>
                                )
                            })}
                            {recentUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-sm text-muted"
                                    >
                                        No users yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
