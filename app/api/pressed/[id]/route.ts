import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Fields that cannot be updated via PATCH
const PROTECTED_FIELDS = ['id', 'orgId', 'createdAt', 'updatedAt'] as const

// Optional string fields on PressedBatch — convert empty strings to null
const OPTIONAL_STRING_FIELDS = [
    'strain', 'micronsUsed', 'notes', 'metrcUid', 'processedBy', 'verifiedBy',
] as const

function sanitizeOptionalStrings(data: Record<string, unknown>) {
    for (const field of OPTIONAL_STRING_FIELDS) {
        if (field in data && typeof data[field] === 'string') {
            data[field] = (data[field] as string) || null
        }
    }
}

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

    try {
        const batch = await db.pressedBatch.findFirst({
            where: { id, orgId: session.orgId },
            include: { sourceHashBatch: { select: { id: true, strain: true, batchNumber: true } } },
        })

        if (!batch) {
            return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
        }

        return NextResponse.json({ data: batch })
    } catch (err) {
        console.error('[GET /api/pressed/[id]] DB error:', err)
        return NextResponse.json({ error: 'Failed to fetch pressed batch' }, { status: 500 })
    }
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
    let existing
    try {
        existing = await db.pressedBatch.findFirst({
            where: { id, orgId: session.orgId },
        })
    } catch (err) {
        console.error('[PATCH /api/pressed/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify pressed batch ownership' }, { status: 500 })
    }

    if (!existing) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    let body
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Strip protected fields
    for (const field of PROTECTED_FIELDS) {
        delete body[field]
    }

    // Convert empty strings to null for optional string fields
    sanitizeOptionalStrings(body)

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

    try {
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
    } catch (err) {
        console.error('[PATCH /api/pressed/[id]] DB error (update):', err)
        return NextResponse.json({ error: 'Failed to update pressed batch' }, { status: 500 })
    }
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
    let existing
    try {
        existing = await db.pressedBatch.findFirst({
            where: { id, orgId: session.orgId },
        })
    } catch (err) {
        console.error('[DELETE /api/pressed/[id]] DB error (ownership check):', err)
        return NextResponse.json({ error: 'Failed to verify pressed batch ownership' }, { status: 500 })
    }

    if (!existing) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    // Soft delete — set status to ARCHIVED
    try {
        const archived = await db.pressedBatch.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        })

        return NextResponse.json({ data: archived })
    } catch (err) {
        console.error('[DELETE /api/pressed/[id]] DB error (archive):', err)
        return NextResponse.json({ error: 'Failed to archive pressed batch' }, { status: 500 })
    }
}
