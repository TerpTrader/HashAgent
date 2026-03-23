import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
    analyzeHashBatchCompliance,
    analyzeRosinBatchCompliance,
    analyzePressedBatchCompliance,
    calculateComplianceScore,
    type ComplianceReport,
} from '@/lib/metrc-utils'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/compliance/reports — Generate compliance gap report
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all non-archived batches
    const [hashBatches, rosinBatches, pressedBatches] = await Promise.all([
        db.hashBatch.findMany({
            where: { orgId: session.orgId, status: { not: 'ARCHIVED' } },
            select: {
                id: true,
                batchNumber: true,
                strain: true,
                status: true,
                metrcSourceUid: true,
                metrcProductUid: true,
                processedBy: true,
                verifiedBy: true,
                allocQa: true,
                totalYieldG: true,
            },
        }),
        db.rosinBatch.findMany({
            where: { orgId: session.orgId, status: { not: 'ARCHIVED' } },
            select: {
                id: true,
                batchNumber: true,
                strain: true,
                status: true,
                rosinProductUid: true,
                rosinProcessedBy: true,
                qcVerifiedBy: true,
            },
        }),
        db.pressedBatch.findMany({
            where: { orgId: session.orgId, status: { not: 'ARCHIVED' } },
            select: {
                id: true,
                batchNumber: true,
                strain: true,
                status: true,
                metrcUid: true,
                processedBy: true,
                verifiedBy: true,
            },
        }),
    ])

    // Analyze each batch type
    const hashIssues = analyzeHashBatchCompliance(hashBatches)
    const rosinIssues = analyzeRosinBatchCompliance(rosinBatches)
    const pressedIssues = analyzePressedBatchCompliance(pressedBatches)

    const allIssues = [...hashIssues, ...rosinIssues, ...pressedIssues]
    const totalBatches = hashBatches.length + rosinBatches.length + pressedBatches.length
    const score = calculateComplianceScore(totalBatches, allIssues)

    const report: ComplianceReport = {
        generatedAt: new Date().toISOString(),
        orgId: session.orgId,
        totalBatches,
        totalIssues: allIssues.length,
        score,
        issues: allIssues,
        summary: {
            missingUids: allIssues.filter((i) => i.type === 'missing_source_uid' || i.type === 'missing_product_uid').length,
            unsignedBatches: allIssues.filter((i) => i.type === 'unsigned_batch').length,
            missingQa: allIssues.filter((i) => i.type === 'missing_qa_allocation').length,
            incompleteSignoffs: allIssues.filter((i) => i.type === 'incomplete_signoff').length,
        },
    }

    return NextResponse.json({ data: report })
}
