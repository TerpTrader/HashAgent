import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT — UNIFIED EQUIPMENT REGISTRY API
// Combines freeze dryers and water filtration systems into a single endpoint
// ═══════════════════════════════════════════════════════════════════════════

const freezeDryerSchema = z.object({
    type: z.literal('freeze_dryer'),
    name: z.string().min(1, 'Name is required'),
    callsign: z.string().optional(),
    model: z.string().optional(),
    serial: z.string().optional(),
    pumpModel: z.string().optional(),
    connectionType: z.enum(['MQTT_WIFI', 'RASPBERRY_PI_BRIDGE']).optional(),
})

const waterFiltrationSchema = z.object({
    type: z.literal('water_filtration'),
    name: z.string().min(1, 'Name is required'),
    model: z.string().optional(),
    sedimentFilterDate: z.string().optional(),
    carbonFilterDate: z.string().optional(),
    preFilterDate: z.string().optional(),
})

const createEquipmentSchema = z.discriminatedUnion('type', [freezeDryerSchema, waterFiltrationSchema])

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/equipment — List all equipment for the org (unified)
// ═══════════════════════════════════════════════════════════════════════════
export async function GET() {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const [freezeDryers, waterSystems] = await Promise.all([
            db.freezeDryer.findMany({
                where: { orgId: session.orgId },
                orderBy: { name: 'asc' },
            }),
            db.waterFiltrationSystem.findMany({
                where: { orgId: session.orgId },
                orderBy: { name: 'asc' },
            }),
        ])

        // Map to unified shape for the equipment registry
        const equipment = [
            ...freezeDryers.map((fd) => ({
                id: fd.id,
                name: fd.name,
                type: 'freeze_dryer' as const,
                model: fd.model,
                serial: fd.serial,
                callsign: fd.callsign,
                pumpModel: fd.pumpModel,
                connectionType: fd.connectionType,
                isOnline: fd.isOnline,
                currentPhase: fd.currentPhase,
                createdAt: fd.createdAt,
            })),
            ...waterSystems.map((ws) => ({
                id: ws.id,
                name: ws.name,
                type: 'water_filtration' as const,
                model: ws.model,
                serial: null,
                callsign: null,
                pumpModel: null,
                connectionType: null,
                isOnline: null,
                currentPhase: null,
                sedimentFilterDate: ws.sedimentFilterDate,
                carbonFilterDate: ws.carbonFilterDate,
                preFilterDate: ws.preFilterDate,
                createdAt: ws.createdAt,
            })),
        ].sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({ data: equipment })
    } catch (err) {
        console.error('Failed to fetch equipment:', err)
        return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/equipment — Register new equipment
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createEquipmentSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const data = parsed.data

    try {
        if (data.type === 'freeze_dryer') {
            const dryer = await db.freezeDryer.create({
                data: {
                    orgId: session.orgId,
                    name: data.name,
                    callsign: data.callsign || null,
                    model: data.model || null,
                    serial: data.serial || null,
                    pumpModel: data.pumpModel || null,
                    connectionType: data.connectionType,
                },
            })

            return NextResponse.json({ data: { ...dryer, type: 'freeze_dryer' } }, { status: 201 })
        }

        // Water filtration
        const system = await db.waterFiltrationSystem.create({
            data: {
                orgId: session.orgId,
                name: data.name,
                model: data.model || null,
                sedimentFilterDate: data.sedimentFilterDate ? new Date(data.sedimentFilterDate) : undefined,
                carbonFilterDate: data.carbonFilterDate ? new Date(data.carbonFilterDate) : undefined,
                preFilterDate: data.preFilterDate ? new Date(data.preFilterDate) : undefined,
            },
        })

        return NextResponse.json({ data: { ...system, type: 'water_filtration' } }, { status: 201 })
    } catch (err) {
        console.error('Failed to create equipment:', err)
        return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 })
    }
}
