import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Optional string fields on HashBatch — convert empty strings to null
const OPTIONAL_STRING_FIELDS = [
    'farmSource', 'metrcSourceUid', 'metrcProductUid', 'licenseKey',
    'cleaningLogRef', 'productName', 'allocationNotes', 'processedBy', 'verifiedBy',
] as const

function sanitizeOptionalStrings(data: Record<string, unknown>) {
    for (const field of OPTIONAL_STRING_FIELDS) {
        if (field in data && typeof data[field] === 'string') {
            data[field] = (data[field] as string) || null
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/batches/[id] — Fetch a single hash batch
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
        const batch = await db.hashBatch.findFirst({
            where: { id, orgId: session.orgId },
            include: {
                freezeDryer: { select: { name: true, callsign: true, serial: true } },
                rosinBatches: {
                    select: { id: true, batchNumber: true, status: true },
                    orderBy: { createdAt: 'desc' },
                },
                pressedBatches: {
                    select: { id: true, batchNumber: true, status: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[GET /api/batches/[id]] DB error:', err)
        return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/batches/[id] — Partial update a hash batch
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
    let existing
    try {
        existing = await db.hashBatch.findFirst({
            where: { id, orgId: session.orgId },
            select: { id: true },
        })
    } catch (err) {
        console.error('[PATCH /api/batches/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify batch ownership' }, { status: 500 })
    }

    if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    let body
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Strip fields that should not be directly updated
    const { id: _id, orgId: _orgId, createdAt: _ca, updatedAt: _ua, ...updateData } = body

    // Convert empty strings to null for optional string fields
    sanitizeOptionalStrings(updateData)

    // Convert date strings to Date objects if present
    if (typeof updateData.washDate === 'string') {
        updateData.washDate = new Date(updateData.washDate)
    }
    if (typeof updateData.dryingDate === 'string') {
        updateData.dryingDate = new Date(updateData.dryingDate)
    }
    if (typeof updateData.manufacturingDate === 'string') {
        updateData.manufacturingDate = new Date(updateData.manufacturingDate)
    }

    // Recalculate derived fields if micron yields are being updated
    if (
        updateData.yield160u !== undefined ||
        updateData.yield120u !== undefined ||
        updateData.yield90u !== undefined ||
        updateData.yield73u !== undefined ||
        updateData.yield45u !== undefined ||
        updateData.yield25u !== undefined
    ) {
        try {
            const merged = await db.hashBatch.findFirst({
                where: { id: id },
                select: {
                    yield160u: true,
                    yield120u: true,
                    yield90u: true,
                    yield73u: true,
                    yield45u: true,
                    yield25u: true,
                    rawMaterialWeightG: true,
                },
            })

            if (merged) {
                const yields = {
                    yield160u: updateData.yield160u ?? merged.yield160u ?? 0,
                    yield120u: updateData.yield120u ?? merged.yield120u ?? 0,
                    yield90u: updateData.yield90u ?? merged.yield90u ?? 0,
                    yield73u: updateData.yield73u ?? merged.yield73u ?? 0,
                    yield45u: updateData.yield45u ?? merged.yield45u ?? 0,
                    yield25u: updateData.yield25u ?? merged.yield25u ?? 0,
                }

                const totalYieldG = Object.values(yields).reduce((sum, v) => sum + (v ?? 0), 0)
                const rawWeight = updateData.rawMaterialWeightG ?? merged.rawMaterialWeightG ?? 0
                const yieldPct = rawWeight > 0 ? (totalYieldG / rawWeight) * 100 : 0

                updateData.totalYieldG = totalYieldG
                updateData.yieldPct = yieldPct
            }
        } catch (err) {
            console.error('[PATCH /api/batches/[id]] DB error (yield recalc):', err)
            return NextResponse.json({ error: 'Failed to recalculate yields' }, { status: 500 })
        }
    }

    try {
        const batch = await db.hashBatch.update({
            where: { id: id },
            data: updateData,
        })

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[PATCH /api/batches/[id]] DB error (update):', err)
        return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/batches/[id] — Soft delete (archive) a hash batch
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
    let existing
    try {
        existing = await db.hashBatch.findFirst({
            where: { id: id, orgId: session.orgId },
            select: { id: true },
        })
    } catch (err) {
        console.error('[DELETE /api/batches/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify batch ownership' }, { status: 500 })
    }

    if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Soft delete: set status to ARCHIVED
    try {
        const batch = await db.hashBatch.update({
            where: { id: id },
            data: { status: 'ARCHIVED' },
        })

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[DELETE /api/batches/[id]] DB error (archive):', err)
        return NextResponse.json({ error: 'Failed to archive batch' }, { status: 500 })
    }
}
