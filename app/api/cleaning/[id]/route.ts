import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/cleaning/[id] — Fetch a single cleaning log with entries
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const log = await db.haCleaningLog.findFirst({
        where: { id: params.id, orgId: session.orgId },
        include: {
            entries: { orderBy: { dayOfWeek: 'asc' } },
        },
    })

    if (!log) {
        return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
    }

    return NextResponse.json({ data: log })
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/cleaning/[id] — Update cleaning log or its entries
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await db.haCleaningLog.findFirst({
        where: { id: params.id, orgId: session.orgId },
        select: { id: true },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
    }

    const body = await req.json()

    // Strip fields that should not be directly updated
    const { id: _id, orgId: _orgId, createdAt: _ca, updatedAt: _ua, entries, ...updateData } = body

    // Convert weekOf date string to Date if present
    if (typeof updateData.weekOf === 'string') {
        updateData.weekOf = new Date(updateData.weekOf)
    }

    // If entries are provided, replace them (delete existing + create new)
    if (Array.isArray(entries)) {
        await db.haCleaningEntry.deleteMany({
            where: { cleaningLogId: params.id },
        })

        await db.haCleaningEntry.createMany({
            data: entries.map((e: {
                dayOfWeek: number
                date: string
                equipmentName: string
                cleaned?: boolean
                cleanedBy?: string
                verifiedBy?: string
                notes?: string
            }) => ({
                cleaningLogId: params.id,
                dayOfWeek: e.dayOfWeek,
                date: new Date(e.date),
                equipmentName: e.equipmentName,
                cleaned: e.cleaned ?? false,
                cleanedBy: e.cleanedBy,
                verifiedBy: e.verifiedBy,
                notes: e.notes,
            })),
        })
    }

    const log = await db.haCleaningLog.update({
        where: { id: params.id },
        data: updateData,
        include: {
            entries: { orderBy: { dayOfWeek: 'asc' } },
        },
    })

    return NextResponse.json({ data: log })
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/cleaning/[id] — Delete cleaning log and cascade entries
// ═══════════════════════════════════════════════════════════════════════════
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await db.haCleaningLog.findFirst({
        where: { id: params.id, orgId: session.orgId },
        select: { id: true },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
    }

    // Entries cascade-delete via Prisma onDelete: Cascade on the relation
    await db.haCleaningLog.delete({
        where: { id: params.id },
    })

    return NextResponse.json({ data: { deleted: true } })
}
