import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createMaintenanceLogSchema } from '@/lib/validations/maintenance'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/maintenance — List maintenance logs for the org
// Filterable by category and equipmentId query params
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const equipmentId = searchParams.get('equipmentId')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const where: Record<string, unknown> = { orgId: session.orgId }
    if (category) where.category = category
    if (equipmentId) where.equipmentId = equipmentId

    const [logs, total] = await Promise.all([
        db.haEquipmentMaintenanceLog.findMany({
            where,
            orderBy: { date: 'desc' },
            take: limit,
            skip: offset,
        }),
        db.haEquipmentMaintenanceLog.count({ where }),
    ])

    return NextResponse.json({ data: logs, total, limit, offset })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/maintenance — Create a new maintenance log entry
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createMaintenanceLogSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const data = parsed.data

    const log = await db.haEquipmentMaintenanceLog.create({
        data: {
            orgId: session.orgId,
            category: data.category,
            equipmentId: data.equipmentId,
            equipmentType: data.equipmentType,
            equipmentName: data.equipmentName,
            date: new Date(data.date),
            description: data.description,
            actionsTaken: data.actionsTaken,
            partsReplaced: data.partsReplaced,
            performedBy: data.performedBy,
            verifiedBy: data.verifiedBy,
            nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
            notes: data.notes,
        },
    })

    return NextResponse.json({ data: log }, { status: 201 })
}
