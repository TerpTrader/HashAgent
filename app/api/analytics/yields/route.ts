import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/analytics/yields — Aggregated yield analytics
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const period = searchParams.get('period') ?? '90d'

    // Calculate date filter
    const now = new Date()
    let dateFrom: Date | null = null
    switch (period) {
        case '30d':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
        case '90d':
            dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
        case '1y':
            dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
        case 'all':
        default:
            dateFrom = null
    }

    const dateFilter = dateFrom ? { gte: dateFrom } : undefined

    try {
        // Fetch all hash batches in period
        const hashBatches = await db.hashBatch.findMany({
            where: {
                orgId: session.orgId,
                status: { not: 'ARCHIVED' },
                ...(dateFilter ? { washDate: dateFilter } : {}),
            },
            select: {
                id: true,
                strain: true,
                washDate: true,
                totalYieldG: true,
                yieldPct: true,
                qualityTier: true,
                yield160u: true,
                yield120u: true,
                yield90u: true,
                yield73u: true,
                yield45u: true,
                yield25u: true,
                rawMaterialWeightG: true,
            },
        })

        // Fetch rosin batches
        const rosinBatches = await db.rosinBatch.findMany({
            where: {
                orgId: session.orgId,
                status: { not: 'ARCHIVED' },
                ...(dateFilter ? { processDate: dateFilter } : {}),
            },
            select: {
                id: true,
                strain: true,
                processDate: true,
                rosinYieldWeightG: true,
                rosinYieldPct: true,
                totalHashWeightG: true,
            },
        })

        // ─── Yield by strain ────────────────────────────────────────────────
        const strainMap = new Map<string, { count: number; totalYieldPct: number; totalOutputG: number }>()
        for (const b of hashBatches) {
            const existing = strainMap.get(b.strain) ?? { count: 0, totalYieldPct: 0, totalOutputG: 0 }
            existing.count++
            existing.totalYieldPct += b.yieldPct ?? 0
            existing.totalOutputG += b.totalYieldG ?? 0
            strainMap.set(b.strain, existing)
        }

        const yieldByStrain = Array.from(strainMap.entries())
            .map(([strain, data]) => ({
                strain,
                batchCount: data.count,
                avgYieldPct: data.count > 0 ? data.totalYieldPct / data.count : 0,
                totalOutputG: data.totalOutputG,
            }))
            .sort((a, b) => b.avgYieldPct - a.avgYieldPct)

        // ─── Micron distribution ────────────────────────────────────────────
        const micronDistribution = {
            '160u': 0,
            '120u': 0,
            '90u': 0,
            '73u': 0,
            '45u': 0,
            '25u': 0,
        }
        for (const b of hashBatches) {
            micronDistribution['160u'] += b.yield160u ?? 0
            micronDistribution['120u'] += b.yield120u ?? 0
            micronDistribution['90u'] += b.yield90u ?? 0
            micronDistribution['73u'] += b.yield73u ?? 0
            micronDistribution['45u'] += b.yield45u ?? 0
            micronDistribution['25u'] += b.yield25u ?? 0
        }

        const micronTotal = Object.values(micronDistribution).reduce((s, v) => s + v, 0)
        const micronData = Object.entries(micronDistribution).map(([grade, weight]) => ({
            grade,
            weightG: Math.round(weight * 10) / 10,
            pct: micronTotal > 0 ? Math.round((weight / micronTotal) * 1000) / 10 : 0,
        }))

        // ─── Rosin trends by month ──────────────────────────────────────────
        const monthMap = new Map<string, { count: number; totalYieldPct: number }>()
        for (const r of rosinBatches) {
            const d = new Date(r.processDate)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const existing = monthMap.get(key) ?? { count: 0, totalYieldPct: 0 }
            existing.count++
            existing.totalYieldPct += r.rosinYieldPct ?? 0
            monthMap.set(key, existing)
        }

        const rosinTrends = Array.from(monthMap.entries())
            .map(([month, data]) => ({
                month,
                batchCount: data.count,
                avgYieldPct: data.count > 0 ? Math.round((data.totalYieldPct / data.count) * 100) / 100 : 0,
            }))
            .sort((a, b) => a.month.localeCompare(b.month))

        // ─── KPIs ───────────────────────────────────────────────────────────
        const totalHashBatches = hashBatches.length
        const totalRosinBatches = rosinBatches.length
        const avgHashYieldPct = totalHashBatches > 0
            ? hashBatches.reduce((s, b) => s + (b.yieldPct ?? 0), 0) / totalHashBatches
            : 0
        const totalOutputG = hashBatches.reduce((s, b) => s + (b.totalYieldG ?? 0), 0)
        const bestStrain = yieldByStrain[0] ?? null

        return NextResponse.json({
            data: {
                period,
                kpis: {
                    totalHashBatches,
                    totalRosinBatches,
                    avgHashYieldPct: Math.round(avgHashYieldPct * 100) / 100,
                    totalOutputG: Math.round(totalOutputG * 10) / 10,
                    bestStrain: bestStrain ? { strain: bestStrain.strain, avgYieldPct: bestStrain.avgYieldPct } : null,
                },
                yieldByStrain,
                micronDistribution: micronData,
                rosinTrends,
            },
        })
    } catch (err) {
        console.error('Failed to fetch yield analytics:', err)
        return NextResponse.json({ error: 'Failed to fetch yield analytics' }, { status: 500 })
    }
}
