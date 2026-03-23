import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createMaintenanceAlerts } from '@/lib/maintenance-scheduler'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/cron/maintenance — Scheduled maintenance alert check
// Designed for Vercel Cron or external cron service.
// Authenticates via CRON_SECRET header.
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all organizations that have equipment registered
        const orgs = await db.organization.findMany({
            where: {
                OR: [
                    { freezeDryers: { some: {} } },
                    { waterFiltrationSystems: { some: {} } },
                ],
            },
            select: { id: true, name: true },
        })

        const results: Array<{ orgId: string; orgName: string; alertsCreated: number }> = []

        for (const org of orgs) {
            const alertsCreated = await createMaintenanceAlerts(org.id)
            results.push({
                orgId: org.id,
                orgName: org.name,
                alertsCreated,
            })
        }

        const totalAlerts = results.reduce((sum, r) => sum + r.alertsCreated, 0)

        return NextResponse.json({
            data: {
                timestamp: new Date().toISOString(),
                orgsChecked: orgs.length,
                totalAlertsCreated: totalAlerts,
                results,
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Cron job failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
