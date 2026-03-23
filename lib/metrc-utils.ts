/**
 * Hash Agent — METRC Cross-Reference Utilities
 * Pure utility functions for METRC UID validation and compliance checks.
 * Database queries live in API routes — these are pure helpers.
 */

// ═══════════════════════════════════════════════════════════════════════════
// METRC UID VALIDATION
// METRC UIDs are 24-character alphanumeric strings with state prefix.
// Format: 1AXXXXXXXXXXXXXXXXXX (1A = state code prefix, followed by 22 alphanum)
// ═══════════════════════════════════════════════════════════════════════════

const METRC_UID_PATTERN = /^[0-9][A-Z][A-Z0-9]{22}$/

export function validateMetrcUid(uid: string): boolean {
    if (!uid || uid.trim().length === 0) return false
    return METRC_UID_PATTERN.test(uid.trim().toUpperCase())
}

export function formatMetrcUid(uid: string): string {
    return uid.trim().toUpperCase()
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH NUMBER FORMATTING FOR METRC
// ═══════════════════════════════════════════════════════════════════════════

export function formatMetrcBatchNumber(
    batchNumber: string,
    type: 'BH' | 'R' | 'PH'
): string {
    // Ensure batch number follows METRC-friendly format
    const clean = batchNumber.trim().replace(/[^A-Za-z0-9-]/g, '')
    const typePrefix = { BH: 'HASH', R: 'ROSIN', PH: 'PRESSED' }[type]
    // If already has the prefix, return as-is
    if (clean.toUpperCase().includes(typePrefix)) return clean.toUpperCase()
    return `${typePrefix}-${clean}`.toUpperCase()
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE GAP ANALYSIS
// These types define the output shape. The actual queries happen in API routes.
// ═══════════════════════════════════════════════════════════════════════════

export type ComplianceIssueType =
    | 'missing_source_uid'
    | 'missing_product_uid'
    | 'unsigned_batch'
    | 'missing_qa_allocation'
    | 'incomplete_signoff'

export type ComplianceSeverity = 'high' | 'medium' | 'low'

export type ComplianceIssue = {
    type: ComplianceIssueType
    severity: ComplianceSeverity
    batchId: string
    batchNumber: string
    batchType: 'hash' | 'rosin' | 'pressed'
    strain: string
    description: string
}

export type ComplianceReport = {
    generatedAt: string
    orgId: string
    totalBatches: number
    totalIssues: number
    score: number // 0-100
    issues: ComplianceIssue[]
    summary: {
        missingUids: number
        unsignedBatches: number
        missingQa: number
        incompleteSignoffs: number
    }
}

/**
 * Analyze hash batches for compliance gaps.
 * Call this from API routes with the fetched batch data.
 */
export function analyzeHashBatchCompliance(batches: Array<{
    id: string
    batchNumber: string
    strain: string
    status: string
    metrcSourceUid: string | null
    metrcProductUid: string | null
    processedBy: string | null
    verifiedBy: string | null
    allocQa: number | null
    totalYieldG: number | null
}>): ComplianceIssue[] {
    const issues: ComplianceIssue[] = []

    for (const batch of batches) {
        if (batch.status === 'ARCHIVED') continue

        if (!batch.metrcSourceUid) {
            issues.push({
                type: 'missing_source_uid',
                severity: 'high',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'hash',
                strain: batch.strain,
                description: 'Missing METRC source material UID',
            })
        }

        if (!batch.metrcProductUid && batch.status === 'COMPLETE') {
            issues.push({
                type: 'missing_product_uid',
                severity: 'high',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'hash',
                strain: batch.strain,
                description: 'Completed batch missing METRC product UID',
            })
        }

        if (!batch.processedBy || !batch.verifiedBy) {
            issues.push({
                type: 'incomplete_signoff',
                severity: 'medium',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'hash',
                strain: batch.strain,
                description: `Missing ${!batch.processedBy ? 'processor' : 'QA verifier'} signature`,
            })
        }

        // QA allocation check: completed batches should have QA sample
        if (batch.status === 'COMPLETE' && (batch.allocQa == null || batch.allocQa <= 0) && (batch.totalYieldG ?? 0) > 0) {
            issues.push({
                type: 'missing_qa_allocation',
                severity: 'medium',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'hash',
                strain: batch.strain,
                description: 'No QA sample allocated from completed batch',
            })
        }
    }

    return issues
}

/**
 * Analyze rosin batches for compliance gaps.
 */
export function analyzeRosinBatchCompliance(batches: Array<{
    id: string
    batchNumber: string
    strain: string
    status: string
    rosinProductUid: string | null
    rosinProcessedBy: string | null
    qcVerifiedBy: string | null
}>): ComplianceIssue[] {
    const issues: ComplianceIssue[] = []

    for (const batch of batches) {
        if (batch.status === 'ARCHIVED') continue

        if (!batch.rosinProductUid && batch.status === 'COMPLETE') {
            issues.push({
                type: 'missing_product_uid',
                severity: 'high',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'rosin',
                strain: batch.strain,
                description: 'Completed rosin batch missing METRC product UID',
            })
        }

        if (!batch.rosinProcessedBy || !batch.qcVerifiedBy) {
            issues.push({
                type: 'incomplete_signoff',
                severity: 'medium',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'rosin',
                strain: batch.strain,
                description: `Missing ${!batch.rosinProcessedBy ? 'processor' : 'QC verifier'} signature`,
            })
        }
    }

    return issues
}

/**
 * Analyze pressed batches for compliance gaps.
 */
export function analyzePressedBatchCompliance(batches: Array<{
    id: string
    batchNumber: string
    strain: string | null
    status: string
    metrcUid: string | null
    processedBy: string | null
    verifiedBy: string | null
}>): ComplianceIssue[] {
    const issues: ComplianceIssue[] = []

    for (const batch of batches) {
        if (batch.status === 'ARCHIVED') continue

        if (!batch.metrcUid && batch.status === 'COMPLETE') {
            issues.push({
                type: 'missing_product_uid',
                severity: 'high',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'pressed',
                strain: batch.strain ?? 'Unknown',
                description: 'Completed pressed batch missing METRC UID',
            })
        }

        if (!batch.processedBy || !batch.verifiedBy) {
            issues.push({
                type: 'incomplete_signoff',
                severity: 'medium',
                batchId: batch.id,
                batchNumber: batch.batchNumber,
                batchType: 'pressed',
                strain: batch.strain ?? 'Unknown',
                description: `Missing ${!batch.processedBy ? 'processor' : 'verifier'} signature`,
            })
        }
    }

    return issues
}

/**
 * Calculate compliance score from issue counts.
 * Score = 100 - (weighted issues / total possible checks) * 100
 */
export function calculateComplianceScore(totalBatches: number, issues: ComplianceIssue[]): number {
    if (totalBatches === 0) return 100

    const highWeight = 3
    const mediumWeight = 1.5
    const lowWeight = 0.5

    const weightedIssues = issues.reduce((sum, issue) => {
        const w = issue.severity === 'high' ? highWeight : issue.severity === 'medium' ? mediumWeight : lowWeight
        return sum + w
    }, 0)

    // Max possible weighted issues: 4 checks per batch * highWeight
    const maxWeighted = totalBatches * 4 * highWeight
    const score = Math.max(0, 100 - (weightedIssues / maxWeighted) * 100)
    return Math.round(score * 10) / 10
}
