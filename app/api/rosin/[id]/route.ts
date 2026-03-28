import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Optional string fields on RosinBatch — convert empty strings to null
const OPTIONAL_STRING_FIELDS = [
    'pressId', 'productName', 'consistency', 'rosinChipUid',
    'rosinProductUid', 'metrcBatchNumber', 'companyProcessedFor',
    'rosinProcessedBy', 'decarbProcessedBy', 'qcVerifiedBy', 'cleaningLogRef',
] as const

function sanitizeOptionalStrings(data: Record<string, unknown>) {
    for (const field of OPTIONAL_STRING_FIELDS) {
        if (field in data && typeof data[field] === 'string') {
            data[field] = (data[field] as string) || null
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/rosin/[id] — Fetch single rosin batch
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
        const batch = await db.rosinBatch.findFirst({
            where: { id: id, orgId: session.orgId },
            include: {
                sourceHashBatch: {
                    select: {
                        id: true,
                        strain: true,
                        batchNumber: true,
                        totalYieldG: true,
                        yield120u: true,
                        yield90u: true,
                        yield73u: true,
                        yield45u: true,
                    },
                },
            },
        })

        if (!batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[GET /api/rosin/[id]] DB error:', err)
        return NextResponse.json({ error: 'Failed to fetch rosin batch' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/rosin/[id] — Partial update
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

    // Verify batch exists and belongs to org
    let existing
    try {
        existing = await db.rosinBatch.findFirst({
            where: { id: id, orgId: session.orgId },
        })
    } catch (err) {
        console.error('[PATCH /api/rosin/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify rosin batch ownership' }, { status: 500 })
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

    // Convert empty strings to null for optional string fields
    sanitizeOptionalStrings(body)

    // Recalculate yield if weight changed
    if (body.rosinYieldWeightG !== undefined) {
        const totalHash = body.totalHashWeightG ?? existing.totalHashWeightG
        if (totalHash > 0) {
            body.rosinYieldPct = (body.rosinYieldWeightG / totalHash) * 100
            body.hashToRosinDiffG = totalHash - body.rosinYieldWeightG
        }
    }

    // Recalculate decarb loss if relevant
    if (body.decarbWeightG !== undefined) {
        const rosinWeight = body.rosinYieldWeightG ?? existing.rosinYieldWeightG
        if (rosinWeight) {
            body.decarbLossG = rosinWeight - body.decarbWeightG
        }
    }

    // Convert date strings
    if (body.processDate) body.processDate = new Date(body.processDate)

    try {
        const batch = await db.rosinBatch.update({
            where: { id: id },
            data: body,
            include: {
                sourceHashBatch: {
                    select: { strain: true, batchNumber: true },
                },
            },
        })

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[PATCH /api/rosin/[id]] DB error (update):', err)
        return NextResponse.json({ error: 'Failed to update rosin batch' }, { status: 500 })
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/rosin/[id] — Soft archive
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

    let existing
    try {
        existing = await db.rosinBatch.findFirst({
            where: { id: id, orgId: session.orgId },
        })
    } catch (err) {
        console.error('[DELETE /api/rosin/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify rosin batch ownership' }, { status: 500 })
    }

    if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    try {
        await db.rosinBatch.update({
            where: { id: id },
            data: { status: 'ARCHIVED' },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[DELETE /api/rosin/[id]] DB error (archive):', err)
        return NextResponse.json({ error: 'Failed to archive rosin batch' }, { status: 500 })
    }
}
