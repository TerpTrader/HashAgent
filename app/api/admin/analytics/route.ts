import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/admin/analytics — Aggregate platform analytics
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    const session = await requireAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') ?? '30')))

    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    try {
        // All queries in parallel
        const [signups, dau, wau, mau, planDistribution] = await Promise.all([
            // Signups in the selected period
            db.user.findMany({
                where: { createdAt: { gte: startDate } },
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),
            // DAU: distinct users who logged in within the last 24 hours
            db.user.count({ where: { lastLoginAt: { gte: oneDayAgo } } }),
            // WAU: within last 7 days
            db.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
            // MAU: within last 30 days
            db.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
            // Plan distribution
            db.organization.groupBy({ by: ['plan'], _count: { plan: true } }),
        ])

        // Group signups by date for the trend chart
        const signupsByDate = new Map<string, number>()

        // Pre-fill all dates in range with zero
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            signupsByDate.set(d.toISOString().slice(0, 10), 0)
        }

        for (const user of signups) {
            const dateKey = user.createdAt.toISOString().slice(0, 10)
            signupsByDate.set(dateKey, (signupsByDate.get(dateKey) ?? 0) + 1)
        }

        const signupTrend = Array.from(signupsByDate.entries()).map(([date, count]) => ({
            date,
            count,
        }))

        // Normalize plan distribution
        const planMap: Record<string, number> = { HOME: 0, PRO: 0, COMMERCIAL: 0, ENTERPRISE: 0 }
        for (const row of planDistribution) {
            planMap[row.plan] = row._count.plan
        }
        const planDist = Object.entries(planMap).map(([plan, count]) => ({ plan, count }))

        return NextResponse.json({
            data: {
                signupTrend,
                engagement: { dau, wau, mau },
                planDistribution: planDist,
            },
        })
    } catch (error) {
        console.error('Failed to fetch analytics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        )
    }
}
