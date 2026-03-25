import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/maintenance/[id] — Fetch a single maintenance log
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const log = await db.haEquipmentMaintenanceLog.findFirst({
        where: { id, orgId: session.orgId },
    })

    if (!log) {
        return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })
    }

    return NextResponse.json({ data: log })
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/maintenance/[id] — Partial update a maintenance log
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await db.haEquipmentMaintenanceLog.findFirst({
        where: { id, orgId: session.orgId },
        select: { id: true },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })
    }

    const body = await req.json()

    // Strip fields that should not be directly updated
    const { id: _id, orgId: _orgId, createdAt: _ca, updatedAt: _ua, ...updateData } = body

    // Convert date strings to Date objects if present
    if (typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date)
    }
    if (typeof updateData.nextDueDate === 'string') {
        updateData.nextDueDate = new Date(updateData.nextDueDate)
    }

    const log = await db.haEquipmentMaintenanceLog.update({
        where: { id },
        data: updateData,
    })

    return NextResponse.json({ data: log })
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/maintenance/[id] — Delete a maintenance log
// ═══════════════════════════════════════════════════════════════════════════
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await db.haEquipmentMaintenanceLog.findFirst({
        where: { id, orgId: session.orgId },
        select: { id: true },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })
    }

    await db.haEquipmentMaintenanceLog.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
}
