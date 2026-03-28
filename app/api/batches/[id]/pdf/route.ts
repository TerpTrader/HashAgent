import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateHashBatchPDF } from '@/lib/pdf-generator'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let batch
    try {
        batch = await db.hashBatch.findFirst({
            where: { id, orgId: session.orgId },
            include: {
                freezeDryer: { select: { name: true, callsign: true } },
            },
        })
    } catch (err) {
        console.error('[GET /api/batches/[id]/pdf] DB error:', err)
        return NextResponse.json({ error: 'Failed to fetch batch for PDF' }, { status: 500 })
    }

    if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    try {
        // Cast to match HashBatchData type — equipmentUsed is JsonValue in Prisma but Record in our type
        const buffer = await generateHashBatchPDF(batch as Parameters<typeof generateHashBatchPDF>[0])
        const filename = `${batch.batchNumber}-${batch.strain.replace(/\s+/g, '_')}.pdf`

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (err) {
        console.error('[GET /api/batches/[id]/pdf] PDF generation error:', err)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
