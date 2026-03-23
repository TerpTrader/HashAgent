import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { generateCleaningLogNumber } from '@/lib/utils'

const createSchema = z.object({
    weekOf: z.string().min(1),
    entries: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        date: z.string().min(1),
        equipmentName: z.string().min(1),
        cleaned: z.boolean().default(false),
        cleanedBy: z.string().optional(),
        verifiedBy: z.string().optional(),
        notes: z.string().optional(),
    })).optional(),
})

export async function GET() {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const logs = await db.haCleaningLog.findMany({
        where: { orgId: session.orgId },
        orderBy: { weekOf: 'desc' },
        include: { entries: { orderBy: { dayOfWeek: 'asc' } } },
    })

    return NextResponse.json({ data: logs })
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    // Auto-generate log number
    const lastLog = await db.haCleaningLog.findFirst({
        where: { orgId: session.orgId },
        orderBy: { createdAt: 'desc' },
        select: { logNumber: true },
    })
    const lastNum = lastLog?.logNumber ? parseInt(lastLog.logNumber.replace('CL-', '')) : 229
    const logNumber = generateCleaningLogNumber(lastNum + 1)

    const log = await db.haCleaningLog.create({
        data: {
            orgId: session.orgId,
            logNumber,
            weekOf: new Date(parsed.data.weekOf),
            entries: parsed.data.entries ? {
                create: parsed.data.entries.map((e) => ({
                    dayOfWeek: e.dayOfWeek,
                    date: new Date(e.date),
                    equipmentName: e.equipmentName,
                    cleaned: e.cleaned,
                    cleanedBy: e.cleanedBy,
                    verifiedBy: e.verifiedBy,
                    notes: e.notes,
                })),
            } : undefined,
        },
        include: { entries: true },
    })

    return NextResponse.json({ data: log }, { status: 201 })
}
