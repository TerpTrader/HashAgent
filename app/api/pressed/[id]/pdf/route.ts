import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generatePressedBatchPDF } from '@/lib/pdf-generator'

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
        batch = await db.pressedBatch.findFirst({
            where: { id, orgId: session.orgId },
            include: {
                sourceHashBatch: {
                    select: { batchNumber: true, strain: true },
                },
            },
        })
    } catch (err) {
        console.error('[GET /api/pressed/[id]/pdf] DB error:', err)
        return NextResponse.json({ error: 'Failed to fetch pressed batch for PDF' }, { status: 500 })
    }

    if (!batch) {
        return NextResponse.json({ error: 'Pressed batch not found' }, { status: 404 })
    }

    try {
        const buffer = await generatePressedBatchPDF(batch as Parameters<typeof generatePressedBatchPDF>[0])
        const strain = batch.strain ?? batch.sourceHashBatch.strain
        const filename = `${batch.batchNumber}-${strain.replace(/\s+/g, '_')}-pressed.pdf`

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (err) {
        console.error('[GET /api/pressed/[id]/pdf] PDF generation error:', err)
        return NextResponse.json({ error: 'Failed to generate pressed batch PDF' }, { status: 500 })
    }
}
