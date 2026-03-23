import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
    sourceHashBatchId: z.string().min(1),
    strain: z.string().optional(),
    batchNumber: z.string().min(1),
    pressDate: z.string().min(1),
    micronsUsed: z.string().optional(),
    inputWeightG: z.number().positive(),
    finalWeightG: z.number().min(0).optional(),
    notes: z.string().optional(),
    metrcUid: z.string().optional(),
    processedBy: z.string().optional(),
    verifiedBy: z.string().optional(),
})

export async function GET() {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const batches = await db.pressedBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { pressDate: 'desc' },
        include: { sourceHashBatch: { select: { strain: true, batchNumber: true } } },
    })

    return NextResponse.json({ data: batches })
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const processingLossG = data.finalWeightG != null ? data.inputWeightG - data.finalWeightG : null
    const processingLossPct = processingLossG != null && data.inputWeightG > 0
        ? (processingLossG / data.inputWeightG) * 100
        : null

    const batch = await db.pressedBatch.create({
        data: {
            orgId: session.orgId,
            sourceHashBatchId: data.sourceHashBatchId,
            strain: data.strain,
            batchNumber: data.batchNumber,
            pressDate: new Date(data.pressDate),
            micronsUsed: data.micronsUsed,
            inputWeightG: data.inputWeightG,
            finalWeightG: data.finalWeightG,
            processingLossG,
            processingLossPct,
            status: data.finalWeightG != null ? 'COMPLETE' : 'PRESSING',
            notes: data.notes,
            metrcUid: data.metrcUid,
            processedBy: data.processedBy,
            verifiedBy: data.verifiedBy,
        },
    })

    return NextResponse.json({ data: batch }, { status: 201 })
}
