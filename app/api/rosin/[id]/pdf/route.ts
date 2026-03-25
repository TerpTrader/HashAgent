import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateRosinBatchPDF } from '@/lib/pdf-generator'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const batch = await db.rosinBatch.findFirst({
        where: { id, orgId: session.orgId },
        include: {
            sourceHashBatch: {
                select: { batchNumber: true, strain: true },
            },
        },
    })

    if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const buffer = await generateRosinBatchPDF(batch as Parameters<typeof generateRosinBatchPDF>[0])
    const filename = `${batch.batchNumber}-${batch.strain.replace(/\s+/g, '_')}-rosin.pdf`

    return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    })
}
