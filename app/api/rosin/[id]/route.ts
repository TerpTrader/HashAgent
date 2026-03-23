import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/rosin/[id] — Fetch single rosin batch
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const batch = await db.rosinBatch.findFirst({
        where: { id: params.id, orgId: session.orgId },
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
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/rosin/[id] — Partial update
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify batch exists and belongs to org
    const existing = await db.rosinBatch.findFirst({
        where: { id: params.id, orgId: session.orgId },
    })
    if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const body = await req.json()

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

    const batch = await db.rosinBatch.update({
        where: { id: params.id },
        data: body,
        include: {
            sourceHashBatch: {
                select: { strain: true, batchNumber: true },
            },
        },
    })

    return NextResponse.json({ data: batch })
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/rosin/[id] — Soft archive
// ═══════════════════════════════════════════════════════════════════════════
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await db.rosinBatch.findFirst({
        where: { id: params.id, orgId: session.orgId },
    })
    if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    await db.rosinBatch.update({
        where: { id: params.id },
        data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ success: true })
}
