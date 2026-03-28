import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { type FreezeDryerPhase } from '@prisma/client'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/freeze-dryers/[id]/telemetry — Historical telemetry data
// Query params: hours (default 4), resolution (default 'raw' | '1min' | '5min')
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const hours = parseInt(searchParams.get('hours') ?? '4')
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    try {
        // Verify ownership
        const dryer = await db.freezeDryer.findFirst({
            where: { id, orgId: session.orgId },
            select: { id: true },
        })
        if (!dryer) {
            return NextResponse.json({ error: 'Freeze dryer not found' }, { status: 404 })
        }

        const telemetry = await db.freezeDryerTelemetry.findMany({
            where: {
                freezeDryerId: id,
                timestamp: { gte: since },
            },
            orderBy: { timestamp: 'asc' },
            select: {
                timestamp: true,
                temperatureF: true,
                pressureMt: true,
                phase: true,
                progress: true,
                trayTempZoneA: true,
                trayTempZoneB: true,
                trayTempZoneC: true,
                condenserTempF: true,
                errorCode: true,
            },
        })

        return NextResponse.json({ data: telemetry })
    } catch (err) {
        console.error('Failed to fetch telemetry data:', err)
        return NextResponse.json({ error: 'Failed to fetch telemetry data' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/freeze-dryers/[id]/telemetry — Ingest telemetry (from MQTT bridge or Pi)
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    // This endpoint is called by the MQTT bridge service or Raspberry Pi
    // Auth via API key header (not user session)
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.TELEMETRY_API_KEY) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    try {
        // Insert telemetry reading
        const reading = await db.freezeDryerTelemetry.create({
            data: {
                freezeDryerId: id,
                temperatureF: (body.temperatureF as number) ?? null,
                pressureMt: (body.pressureMt as number) ?? null,
                phase: body.phase as FreezeDryerPhase,
                progress: (body.progress as number) ?? null,
                trayTempZoneA: (body.trayTempZoneA as number) ?? null,
                trayTempZoneB: (body.trayTempZoneB as number) ?? null,
                trayTempZoneC: (body.trayTempZoneC as number) ?? null,
                condenserTempF: (body.condenserTempF as number) ?? null,
                errorCode: (body.errorCode as string) ?? null,
            },
        })

        // Update freeze dryer current state
        await db.freezeDryer.update({
            where: { id },
            data: {
                isOnline: true,
                lastSeenAt: new Date(),
                currentPhase: body.phase as FreezeDryerPhase ?? undefined,
                currentTempF: (body.temperatureF as number) ?? undefined,
                currentPressureMt: (body.pressureMt as number) ?? undefined,
                batchProgress: (body.progress as number) ?? undefined,
            },
        })

        return NextResponse.json({ data: reading }, { status: 201 })
    } catch (err) {
        console.error('Failed to ingest telemetry data:', err)
        return NextResponse.json({ error: 'Failed to ingest telemetry data' }, { status: 500 })
    }
}
