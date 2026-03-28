import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createHashBatchSchema } from '@/lib/validations/batch'
import { calculateTotalMicronYield, calculateYieldPct, suggestQualityTier, lbsToGrams } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/batches — List hash batches for the org
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')
    const strain = searchParams.get('strain')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sort = searchParams.get('sort') === 'asc' ? 'asc' as const : 'desc' as const
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const where: Record<string, unknown> = { orgId: session.orgId }

    // search takes precedence over strain — broad text search across key fields
    if (search) {
        where.OR = [
            { strain: { contains: search, mode: 'insensitive' } },
            { batchNumber: { contains: search, mode: 'insensitive' } },
            { farmSource: { contains: search, mode: 'insensitive' } },
            { processedBy: { contains: search, mode: 'insensitive' } },
        ]
    } else if (strain) {
        where.strain = { contains: strain, mode: 'insensitive' }
    }

    if (status) where.status = status

    // Date range filtering on washDate
    if (dateFrom || dateTo) {
        const washDateFilter: Record<string, Date> = {}
        if (dateFrom) washDateFilter.gte = new Date(dateFrom)
        if (dateTo) washDateFilter.lte = new Date(dateTo)
        where.washDate = washDateFilter
    }

    const [batches, total] = await Promise.all([
        db.hashBatch.findMany({
            where,
            orderBy: { washDate: sort },
            take: limit,
            skip: offset,
            include: {
                freezeDryer: { select: { name: true, callsign: true } },
                _count: { select: { rosinBatches: true, pressedBatches: true } },
            },
        }),
        db.hashBatch.count({ where }),
    ])

    return NextResponse.json({ data: batches, total, limit, offset })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/batches — Create a new hash batch
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createHashBatchSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const data = parsed.data

    // Auto-calculate fields
    const totalYieldG = calculateTotalMicronYield(data)
    const yieldPct = calculateYieldPct(totalYieldG, data.rawMaterialWeightG)
    const qualityTier = data.qualityTier ?? suggestQualityTier(data)

    // Determine status based on what data is present
    let status: 'WASHING' | 'DRYING' | 'COMPLETE' = 'WASHING'
    if (totalYieldG > 0) status = 'COMPLETE'
    else if (data.freezeDryerId || data.dryingDate) status = 'DRYING'

    // Sanitize optional foreign-key fields — empty strings from form defaults
    // must be converted to null to avoid FK constraint violations
    const freezeDryerId = data.freezeDryerId?.trim() || null

    try {
        const batch = await db.hashBatch.create({
            data: {
                orgId: session.orgId,
                strain: data.strain,
                batchNumber: data.batchNumber,
                washDate: new Date(data.washDate),
                materialState: data.materialState,
                materialGrade: data.materialGrade,
                farmSource: data.farmSource || null,
                metrcSourceUid: data.metrcSourceUid || null,
                metrcProductUid: data.metrcProductUid || null,
                licenseKey: data.licenseKey || null,
                cleaningLogRef: data.cleaningLogRef || null,
                rawMaterialWeightG: data.rawMaterialWeightG,
                rawMaterialWeightLb: data.rawMaterialWeightG ? data.rawMaterialWeightG / 453.592 : null,
                wetWasteWeightG: data.wetWasteWeightG,
                expectedYieldPct: data.expectedYieldPct,
                equipmentUsed: data.equipmentUsed ?? undefined,
                freezeDryerId,
                dryingDate: data.dryingDate ? new Date(data.dryingDate) : undefined,
                shelfLimitF: data.shelfLimitF,
                freezeTimeHrs: data.freezeTimeHrs,
                dryingTimeHrs: data.dryingTimeHrs,
                yield160u: data.yield160u,
                yield120u: data.yield120u,
                yield90u: data.yield90u,
                yield73u: data.yield73u,
                yield45u: data.yield45u,
                yield25u: data.yield25u,
                totalYieldG,
                yieldPct,
                qualityTier,
                status,
                productName: data.productName || null,
                manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
                allocQa: data.allocQa,
                allocPackaged: data.allocPackaged,
                allocPressed: data.allocPressed,
                allocPreRoll: data.allocPreRoll,
                allocWhiteLabel: data.allocWhiteLabel,
                allocRosin: data.allocRosin,
                allocLossG: data.allocLossG,
                allocationNotes: data.allocationNotes || null,
                processedBy: data.processedBy || null,
                verifiedBy: data.verifiedBy || null,
            },
        })

        return NextResponse.json({ data: batch }, { status: 201 })
    } catch (err) {
        console.error('[POST /api/batches] DB error:', err)
        const message = err instanceof Error ? err.message : 'Database error'
        return NextResponse.json({ error: `Failed to create batch: ${message}` }, { status: 500 })
    }
}
