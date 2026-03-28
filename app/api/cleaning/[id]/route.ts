import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/cleaning/[id] — Fetch a single cleaning log with entries
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

    try {
        const log = await db.haCleaningLog.findFirst({
            where: { id, orgId: session.orgId },
            include: {
                entries: { orderBy: { dayOfWeek: 'asc' } },
            },
        })

        if (!log) {
            return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
        }

        return NextResponse.json({ data: log })
    } catch (err) {
        console.error('Failed to fetch cleaning log:', err)
        return NextResponse.json({ error: 'Failed to fetch cleaning log' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/cleaning/[id] — Update cleaning log or its entries
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

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    try {
        // Verify ownership
        const existing = await db.haCleaningLog.findFirst({
            where: { id, orgId: session.orgId },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
        }

        // Strip fields that should not be directly updated
        const { id: _id, orgId: _orgId, createdAt: _ca, updatedAt: _ua, entries, ...updateData } = body

        // Convert weekOf date string to Date if present
        if (typeof updateData.weekOf === 'string') {
            updateData.weekOf = new Date(updateData.weekOf)
        }

        // If entries are provided, replace them (delete existing + create new)
        if (Array.isArray(entries)) {
            await db.haCleaningEntry.deleteMany({
                where: { cleaningLogId: id },
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
                    cleaningLogId: id,
                    dayOfWeek: e.dayOfWeek,
                    date: new Date(e.date),
                    equipmentName: e.equipmentName,
                    cleaned: e.cleaned ?? false,
                    cleanedBy: e.cleanedBy || null,
                    verifiedBy: e.verifiedBy || null,
                    notes: e.notes || null,
                })),
            })
        }

        const log = await db.haCleaningLog.update({
            where: { id },
            data: updateData,
            include: {
                entries: { orderBy: { dayOfWeek: 'asc' } },
            },
        })

        return NextResponse.json({ data: log })
    } catch (err) {
        console.error('Failed to update cleaning log:', err)
        return NextResponse.json({ error: 'Failed to update cleaning log' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/cleaning/[id] — Delete cleaning log and cascade entries
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

    try {
        // Verify ownership
        const existing = await db.haCleaningLog.findFirst({
            where: { id, orgId: session.orgId },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Cleaning log not found' }, { status: 404 })
        }

        // Entries cascade-delete via Prisma onDelete: Cascade on the relation
        await db.haCleaningLog.delete({
            where: { id },
        })

        return NextResponse.json({ data: { deleted: true } })
    } catch (err) {
        console.error('Failed to delete cleaning log:', err)
        return NextResponse.json({ error: 'Failed to delete cleaning log' }, { status: 500 })
    }
}
