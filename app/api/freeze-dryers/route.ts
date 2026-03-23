import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/freeze-dryers — List all freeze dryers for the org
// ═══════════════════════════════════════════════════════════════════════════
export async function GET() {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dryers = await db.freezeDryer.findMany({
        where: { orgId: session.orgId },
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: {
                    batches: true,
                    alerts: true,
                },
            },
        },
    })

    return NextResponse.json({ data: dryers })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/freeze-dryers — Register a new freeze dryer
// ═══════════════════════════════════════════════════════════════════════════
const createSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    callsign: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    pumpModel: z.string().optional(),
    connectionType: z.enum(['MQTT_WIFI', 'RASPBERRY_PI_BRIDGE']).default('MQTT_WIFI'),
    mqttTopic: z.string().optional(),
    ipAddress: z.string().optional(),
})

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const dryer = await db.freezeDryer.create({
        data: {
            orgId: session.orgId,
            ...parsed.data,
        },
    })

    return NextResponse.json({ data: dryer }, { status: 201 })
}
