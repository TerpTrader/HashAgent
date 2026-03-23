import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Fields that cannot be updated via PATCH
const PROTECTED_FIELDS = ['id', 'orgId', 'createdAt', 'updatedAt'] as const

const updateSchema = z.object({
    strain: z.string().optional(),
    batchNumber: z.string().min(1).optional(),
    pressDate: z.string().min(1).optional(),
    micronsUsed: z.string().optional(),
    inputWeightG: z.number().positive().optional(),
    finalWeightG: z.number().min(0).nullable().optional(),
    notes: z.string().optional(),
    metrcUid: z.string().optional(),
    processedBy: z.string().optional(),
    verifiedBy: z.string().optional(),
    status: z.enum(['PRESSING', 'COMPLETE', 'ARCHIVED']).optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/pressed/[id] — Fetch a single pressed hash batch
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

    const batch = await db.pressedBatch.findFirst({
        where: { id, orgId: session.orgId },
        include: { sourceHashBatch: { select: { id: true, strain: true, batchNumber: true } } },
    })

    if (!batch) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    return NextResponse.json({ data: batch })
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/pressed/[id] — Update a pressed hash batch
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
    const existing = await db.pressedBatch.findFirst({
        where: { id, orgId: session.orgId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    const body = await req.json()

    // Strip protected fields
    for (const field of PROTECTED_FIELDS) {
        delete body[field]
    }

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const data = parsed.data

    // Recalculate derived fields if weights changed
    const inputWeightG = data.inputWeightG ?? existing.inputWeightG
    const finalWeightG = data.finalWeightG !== undefined ? data.finalWeightG : existing.finalWeightG

    const processingLossG = finalWeightG != null ? inputWeightG - finalWeightG : null
    const processingLossPct =
        processingLossG != null && inputWeightG > 0
            ? (processingLossG / inputWeightG) * 100
            : null

    // Auto-determine status if finalWeightG is provided and status not explicitly set
    let status = data.status
    if (!status && data.finalWeightG != null && data.finalWeightG > 0) {
        status = 'COMPLETE'
    }

    const updated = await db.pressedBatch.update({
        where: { id },
        data: {
            ...data,
            pressDate: data.pressDate ? new Date(data.pressDate) : undefined,
            processingLossG,
            processingLossPct,
            ...(status ? { status } : {}),
        },
        include: { sourceHashBatch: { select: { id: true, strain: true, batchNumber: true } } },
    })

    return NextResponse.json({ data: updated })
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/pressed/[id] — Soft archive a pressed hash batch
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
    const existing = await db.pressedBatch.findFirst({
        where: { id, orgId: session.orgId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    // Soft delete — set status to ARCHIVED
    const archived = await db.pressedBatch.update({
        where: { id },
        data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ data: archived })
}
