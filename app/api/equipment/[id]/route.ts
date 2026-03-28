import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT [id] — CRUD for individual equipment records
// Requires `type` query param to determine which table to operate on
// ═══════════════════════════════════════════════════════════════════════════

const typeSchema = z.enum(['freeze_dryer', 'water_filtration'])

function getEquipmentType(searchParams: URLSearchParams) {
    const typeParam = searchParams.get('type')
    const parsed = typeSchema.safeParse(typeParam)
    if (!parsed.success) return null
    return parsed.data
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/equipment/[id]?type=freeze_dryer|water_filtration
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

    const equipmentType = getEquipmentType(req.nextUrl.searchParams)
    if (!equipmentType) {
        return NextResponse.json({ error: 'Invalid or missing type parameter' }, { status: 400 })
    }

    try {
        if (equipmentType === 'freeze_dryer') {
            const dryer = await db.freezeDryer.findFirst({
                where: { id: id, orgId: session.orgId },
            })
            if (!dryer) {
                return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
            }
            return NextResponse.json({ data: { ...dryer, type: 'freeze_dryer' } })
        }

        const system = await db.waterFiltrationSystem.findFirst({
            where: { id: id, orgId: session.orgId },
        })
        if (!system) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
        }
        return NextResponse.json({ data: { ...system, type: 'water_filtration' } })
    } catch (err) {
        console.error('Failed to fetch equipment:', err)
        return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/equipment/[id]?type=freeze_dryer|water_filtration
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

    const equipmentType = getEquipmentType(req.nextUrl.searchParams)
    if (!equipmentType) {
        return NextResponse.json({ error: 'Invalid or missing type parameter' }, { status: 400 })
    }

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Strip fields that should not be directly updated
    const { id: _id, orgId: _orgId, createdAt: _ca, updatedAt: _ua, type: _type, ...updateData } = body

    try {
        if (equipmentType === 'freeze_dryer') {
            // Verify ownership
            const existing = await db.freezeDryer.findFirst({
                where: { id: id, orgId: session.orgId },
                select: { id: true },
            })
            if (!existing) {
                return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
            }

            const dryer = await db.freezeDryer.update({
                where: { id: id },
                data: updateData,
            })
            return NextResponse.json({ data: { ...dryer, type: 'freeze_dryer' } })
        }

        // Water filtration
        const existing = await db.waterFiltrationSystem.findFirst({
            where: { id: id, orgId: session.orgId },
            select: { id: true },
        })
        if (!existing) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
        }

        // Convert date strings to Date objects if present
        if (typeof updateData.sedimentFilterDate === 'string') {
            updateData.sedimentFilterDate = new Date(updateData.sedimentFilterDate)
        }
        if (typeof updateData.carbonFilterDate === 'string') {
            updateData.carbonFilterDate = new Date(updateData.carbonFilterDate)
        }
        if (typeof updateData.preFilterDate === 'string') {
            updateData.preFilterDate = new Date(updateData.preFilterDate)
        }

        const system = await db.waterFiltrationSystem.update({
            where: { id: id },
            data: updateData,
        })
        return NextResponse.json({ data: { ...system, type: 'water_filtration' } })
    } catch (err) {
        console.error('Failed to update equipment:', err)
        return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/equipment/[id]?type=freeze_dryer|water_filtration
// ═══════════════════════════════════════════════════════════════════════════
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const equipmentType = getEquipmentType(req.nextUrl.searchParams)
    if (!equipmentType) {
        return NextResponse.json({ error: 'Invalid or missing type parameter' }, { status: 400 })
    }

    try {
        if (equipmentType === 'freeze_dryer') {
            const existing = await db.freezeDryer.findFirst({
                where: { id: id, orgId: session.orgId },
                select: { id: true },
            })
            if (!existing) {
                return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
            }

            await db.freezeDryer.delete({ where: { id: id } })
            return NextResponse.json({ data: { deleted: true } })
        }

        const existing = await db.waterFiltrationSystem.findFirst({
            where: { id: id, orgId: session.orgId },
            select: { id: true },
        })
        if (!existing) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
        }

        await db.waterFiltrationSystem.delete({ where: { id: id } })
        return NextResponse.json({ data: { deleted: true } })
    } catch (err) {
        console.error('Failed to delete equipment:', err)
        return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 })
    }
}
