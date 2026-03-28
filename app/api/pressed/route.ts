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

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sort = searchParams.get('sort') === 'asc' ? 'asc' as const : 'desc' as const
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const where: Record<string, unknown> = { orgId: session.orgId }

    // Broad text search across key fields
    if (search) {
        where.OR = [
            { strain: { contains: search, mode: 'insensitive' } },
            { batchNumber: { contains: search, mode: 'insensitive' } },
            { processedBy: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
        ]
    }

    if (status) where.status = status

    // Date range filtering on pressDate
    if (dateFrom || dateTo) {
        const pressDateFilter: Record<string, Date> = {}
        if (dateFrom) pressDateFilter.gte = new Date(dateFrom)
        if (dateTo) pressDateFilter.lte = new Date(dateTo)
        where.pressDate = pressDateFilter
    }

    const [batches, total] = await Promise.all([
        db.pressedBatch.findMany({
            where,
            orderBy: { pressDate: sort },
            take: limit,
            skip: offset,
            include: { sourceHashBatch: { select: { strain: true, batchNumber: true } } },
        }),
        db.pressedBatch.count({ where }),
    ])

    return NextResponse.json({ data: batches, total, limit, offset })
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const processingLossG = data.finalWeightG != null ? data.inputWeightG - data.finalWeightG : null
    const processingLossPct = processingLossG != null && data.inputWeightG > 0
        ? (processingLossG / data.inputWeightG) * 100
        : null

    try {
        const batch = await db.pressedBatch.create({
            data: {
                orgId: session.orgId,
                sourceHashBatchId: data.sourceHashBatchId,
                strain: data.strain || null,
                batchNumber: data.batchNumber,
                pressDate: new Date(data.pressDate),
                micronsUsed: data.micronsUsed || null,
                inputWeightG: data.inputWeightG,
                finalWeightG: data.finalWeightG,
                processingLossG,
                processingLossPct,
                status: data.finalWeightG != null ? 'COMPLETE' : 'PRESSING',
                notes: data.notes || null,
                metrcUid: data.metrcUid || null,
                processedBy: data.processedBy || null,
                verifiedBy: data.verifiedBy || null,
            },
        })

        return NextResponse.json({ data: batch }, { status: 201 })
    } catch (err) {
        console.error('[POST /api/pressed] DB error:', err)
        const message = err instanceof Error ? err.message : 'Database error'
        return NextResponse.json({ error: `Failed to create pressed hash batch: ${message}` }, { status: 500 })
    }
}
