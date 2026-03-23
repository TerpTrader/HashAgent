import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createRosinBatchSchema } from '@/lib/validations/rosin'
import { calculateYieldPct } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/rosin — List rosin batches for the org
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const strain = searchParams.get('strain')
    const status = searchParams.get('status')
    const sourceHashBatchId = searchParams.get('sourceHashBatchId')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const where: Record<string, unknown> = { orgId: session.orgId }
    if (strain) where.strain = { contains: strain, mode: 'insensitive' }
    if (status) where.status = status
    if (sourceHashBatchId) where.sourceHashBatchId = sourceHashBatchId

    const [batches, total] = await Promise.all([
        db.rosinBatch.findMany({
            where,
            orderBy: { processDate: 'desc' },
            take: limit,
            skip: offset,
            include: {
                sourceHashBatch: {
                    select: {
                        strain: true,
                        batchNumber: true,
                        totalYieldG: true,
                    },
                },
            },
        }),
        db.rosinBatch.count({ where }),
    ])

    return NextResponse.json({ data: batches, total, limit, offset })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/rosin — Create a new rosin batch
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createRosinBatchSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const data = parsed.data

    // Verify source hash batch exists and belongs to org
    const sourceBatch = await db.hashBatch.findFirst({
        where: { id: data.sourceHashBatchId, orgId: session.orgId },
    })
    if (!sourceBatch) {
        return NextResponse.json(
            { error: 'Source hash batch not found' },
            { status: 404 }
        )
    }

    // Auto-calculate derived fields
    const totalHashWeightG =
        (data.micron120uWeightG ?? 0) +
        (data.micron90uWeightG ?? 0) +
        (data.micron73uWeightG ?? 0) +
        (data.micron45uWeightG ?? 0)

    const rosinYieldPct = data.rosinYieldWeightG
        ? calculateYieldPct(data.rosinYieldWeightG, totalHashWeightG)
        : null

    const hashToRosinDiffG = data.rosinYieldWeightG
        ? totalHashWeightG - data.rosinYieldWeightG
        : null

    const decarbLossG =
        data.decarb && data.decarbWeightG && data.rosinYieldWeightG
            ? data.rosinYieldWeightG - data.decarbWeightG
            : null

    // Determine status
    let status: 'PRESSING' | 'POST_PROCESSING' | 'DECARB' | 'COMPLETE' = 'PRESSING'
    if (data.rosinYieldWeightG && data.rosinYieldWeightG > 0) {
        status = data.decarb ? 'DECARB' : 'COMPLETE'
    }
    if (data.qcVerifiedBy) status = 'COMPLETE'

    const batch = await db.rosinBatch.create({
        data: {
            orgId: session.orgId,
            batchNumber: data.batchNumber,
            sourceHashBatchId: data.sourceHashBatchId,
            strain: data.strain,

            // Micron weights
            micron120uWeightG: data.micron120uWeightG,
            micron90uWeightG: data.micron90uWeightG,
            micron73uWeightG: data.micron73uWeightG,
            micron45uWeightG: data.micron45uWeightG,
            totalHashWeightG,

            // Press
            pressId: data.pressId,
            equipmentUsed: data.equipmentUsed ?? undefined,
            productName: data.productName,
            productType: data.productType,
            processDate: new Date(data.processDate),

            // Yield
            rosinYieldWeightG: data.rosinYieldWeightG,
            rosinYieldPct,
            hashToRosinDiffG,

            // Decarb
            decarb: data.decarb,
            decarbWeightG: data.decarbWeightG,
            decarbLossG,

            // Chip & bag
            rosinChipUid: data.rosinChipUid,
            rosinChipEstimateG: data.rosinChipEstimateG,
            bagWeightG: data.bagWeightG,

            // METRC
            rosinProductUid: data.rosinProductUid,
            metrcBatchNumber: data.metrcBatchNumber,
            companyProcessedFor: data.companyProcessedFor,

            // Status & personnel
            status,
            consistency: data.consistency,
            rosinProcessedBy: data.rosinProcessedBy,
            decarbProcessedBy: data.decarbProcessedBy,
            qcVerifiedBy: data.qcVerifiedBy,
            cleaningLogRef: data.cleaningLogRef,
        },
        include: {
            sourceHashBatch: {
                select: { strain: true, batchNumber: true },
            },
        },
    })

    return NextResponse.json({ data: batch }, { status: 201 })
}
