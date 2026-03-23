import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/freeze-dryers/[id]/telemetry — Historical telemetry data
// Query params: hours (default 4), resolution (default 'raw' | '1min' | '5min')
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const hours = parseInt(searchParams.get('hours') ?? '4')
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Verify ownership
    const dryer = await db.freezeDryer.findFirst({
        where: { id: params.id, orgId: session.orgId },
        select: { id: true },
    })
    if (!dryer) {
        return NextResponse.json({ error: 'Freeze dryer not found' }, { status: 404 })
    }

    const telemetry = await db.freezeDryerTelemetry.findMany({
        where: {
            freezeDryerId: params.id,
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
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/freeze-dryers/[id]/telemetry — Ingest telemetry (from MQTT bridge or Pi)
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // This endpoint is called by the MQTT bridge service or Raspberry Pi
    // Auth via API key header (not user session)
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.TELEMETRY_API_KEY) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await req.json()

    // Insert telemetry reading
    const reading = await db.freezeDryerTelemetry.create({
        data: {
            freezeDryerId: params.id,
            temperatureF: body.temperatureF ?? null,
            pressureMt: body.pressureMt ?? null,
            phase: body.phase ?? null,
            progress: body.progress ?? null,
            trayTempZoneA: body.trayTempZoneA ?? null,
            trayTempZoneB: body.trayTempZoneB ?? null,
            trayTempZoneC: body.trayTempZoneC ?? null,
            condenserTempF: body.condenserTempF ?? null,
            errorCode: body.errorCode ?? null,
        },
    })

    // Update freeze dryer current state
    await db.freezeDryer.update({
        where: { id: params.id },
        data: {
            isOnline: true,
            lastSeenAt: new Date(),
            currentPhase: body.phase ?? undefined,
            currentTempF: body.temperatureF ?? undefined,
            currentPressureMt: body.pressureMt ?? undefined,
            batchProgress: body.progress ?? undefined,
        },
    })

    return NextResponse.json({ data: reading }, { status: 201 })
}
