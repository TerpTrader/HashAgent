/**
 * Hash Agent — PDF Generator
 * Uses @react-pdf/renderer to generate batch record PDFs
 * matching the original DOCX templates from the uploaded documents.
 */
import React from 'react'
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    renderToBuffer,
} from '@react-pdf/renderer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
    primary: '#14b8a6',
    primaryDark: '#0d9488',
    surface: '#1a1a1a',
    text: '#111111',
    textLight: '#555555',
    border: '#d1d5db',
    headerBg: '#0f766e',
    headerText: '#ffffff',
    rowAlt: '#f9fafb',
    tierGreen: '#16a34a',
    tierAmber: '#d97706',
    tierRed: '#dc2626',
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: colors.text,
    },
    header: {
        backgroundColor: colors.headerBg,
        padding: 16,
        marginBottom: 20,
        borderRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.headerText,
        fontFamily: 'Helvetica-Bold',
    },
    headerSubtitle: {
        fontSize: 10,
        color: colors.headerText,
        marginTop: 4,
        opacity: 0.85,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: colors.headerBg,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    rowAlt: {
        backgroundColor: colors.rowAlt,
    },
    label: {
        width: '40%',
        fontSize: 8,
        color: colors.textLight,
        fontFamily: 'Helvetica',
    },
    value: {
        width: '60%',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.headerBg,
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 2,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        color: colors.headerText,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    tableCell: {
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: colors.textLight,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        paddingTop: 8,
    },
    signoffGrid: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 8,
    },
    signoffBox: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: colors.border,
        borderRadius: 3,
        padding: 10,
    },
    signoffLabel: {
        fontSize: 7,
        color: colors.textLight,
        marginBottom: 4,
    },
    signoffValue: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
})

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function fmt(val: number | null | undefined, decimals = 1, suffix = 'g'): string {
    if (val == null) return '—'
    return `${val.toFixed(decimals)}${suffix}`
}

function fmtDate(date: Date | string | null | undefined): string {
    if (!date) return '—'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtPct(val: number | null | undefined): string {
    if (val == null) return '—'
    return `${val.toFixed(2)}%`
}

function DataRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
    return React.createElement(
        View,
        { style: [styles.row, alt ? styles.rowAlt : {}] },
        React.createElement(Text, { style: styles.label }, label),
        React.createElement(Text, { style: styles.value }, value)
    )
}

function Footer({ batchNumber }: { batchNumber: string }) {
    return React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, null, `Hash Agent — ${batchNumber}`),
        React.createElement(Text, null, `Generated ${new Date().toLocaleDateString('en-US')}`)
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// HASH BATCH PDF
// ═══════════════════════════════════════════════════════════════════════════

type HashBatchData = {
    batchNumber: string
    strain: string
    washDate: Date | string
    materialState: string
    materialGrade: string
    farmSource?: string | null
    metrcSourceUid?: string | null
    metrcProductUid?: string | null
    rawMaterialWeightG?: number | null
    rawMaterialWeightLb?: number | null
    wetWasteWeightG?: number | null
    equipmentUsed?: Record<string, unknown> | null
    freezeDryer?: { name: string; callsign?: string | null } | null
    dryingDate?: Date | string | null
    shelfLimitF?: number | null
    freezeTimeHrs?: number | null
    dryingTimeHrs?: number | null
    yield160u?: number | null
    yield120u?: number | null
    yield90u?: number | null
    yield73u?: number | null
    yield45u?: number | null
    yield25u?: number | null
    totalYieldG?: number | null
    yieldPct?: number | null
    qualityTier?: string | null
    allocQa?: number | null
    allocPackaged?: number | null
    allocPressed?: number | null
    allocPreRoll?: number | null
    allocWhiteLabel?: number | null
    allocRosin?: number | null
    allocLossG?: number | null
    processedBy?: string | null
    verifiedBy?: string | null
}

function HashBatchDocument({ batch }: { batch: HashBatchData }) {
    const micronRows = [
        { grade: '160μ', weight: batch.yield160u },
        { grade: '120μ', weight: batch.yield120u },
        { grade: '90μ', weight: batch.yield90u },
        { grade: '73μ', weight: batch.yield73u },
        { grade: '45μ', weight: batch.yield45u },
        { grade: '25μ', weight: batch.yield25u },
    ]

    return React.createElement(
        Document,
        null,
        React.createElement(
            Page,
            { size: 'LETTER', style: styles.page },
            // Header
            React.createElement(
                View,
                { style: styles.header },
                React.createElement(Text, { style: styles.headerTitle }, 'Bubble Hash Manufacturing Batch Record'),
                React.createElement(Text, { style: styles.headerSubtitle }, `${batch.batchNumber}  •  ${batch.strain}  •  ${fmtDate(batch.washDate)}`)
            ),
            // Starting Material
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Starting Material'),
                React.createElement(DataRow, { label: 'Strain', value: batch.strain }),
                React.createElement(DataRow, { label: 'Material State', value: batch.materialState, alt: true }),
                React.createElement(DataRow, { label: 'Material Grade', value: batch.materialGrade }),
                React.createElement(DataRow, { label: 'Farm Source', value: batch.farmSource ?? '—', alt: true }),
                React.createElement(DataRow, { label: 'METRC Source UID', value: batch.metrcSourceUid ?? '—' }),
                React.createElement(DataRow, { label: 'Raw Material Weight', value: `${fmt(batch.rawMaterialWeightG)} (${fmt(batch.rawMaterialWeightLb, 2, ' lbs')})`, alt: true })
            ),
            // Processing
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Processing & Drying'),
                React.createElement(DataRow, { label: 'Wash Date', value: fmtDate(batch.washDate) }),
                React.createElement(DataRow, { label: 'Freeze Dryer', value: batch.freezeDryer ? `${batch.freezeDryer.name}${batch.freezeDryer.callsign ? ` (${batch.freezeDryer.callsign})` : ''}` : '—', alt: true }),
                React.createElement(DataRow, { label: 'Shelf Limit', value: batch.shelfLimitF != null ? `${batch.shelfLimitF}°F` : '—' }),
                React.createElement(DataRow, { label: 'Freeze Time', value: batch.freezeTimeHrs != null ? `${batch.freezeTimeHrs} hrs` : '—', alt: true }),
                React.createElement(DataRow, { label: 'Drying Time', value: batch.dryingTimeHrs != null ? `${batch.dryingTimeHrs} hrs` : '—' })
            ),
            // Micron Yields
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Micron Yield Breakdown'),
                React.createElement(
                    View,
                    { style: styles.tableHeader },
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '33%' }] }, 'Micron Grade'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '33%', textAlign: 'right' }] }, 'Weight (g)'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '34%', textAlign: 'right' }] }, '% of Total')
                ),
                ...micronRows.map((row, i) =>
                    React.createElement(
                        View,
                        { key: i, style: [styles.tableRow, i % 2 === 1 ? styles.rowAlt : {}] },
                        React.createElement(Text, { style: [styles.tableCell, { width: '33%' }] }, row.grade),
                        React.createElement(Text, { style: [styles.tableCell, { width: '33%', textAlign: 'right', fontFamily: 'Courier' }] }, fmt(row.weight)),
                        React.createElement(Text, { style: [styles.tableCell, { width: '34%', textAlign: 'right', fontFamily: 'Courier' }] },
                            batch.totalYieldG && row.weight ? fmtPct((row.weight / batch.totalYieldG) * 100) : '—'
                        )
                    )
                ),
                React.createElement(
                    View,
                    { style: [styles.tableRow, { borderTopWidth: 1, borderTopColor: colors.primary }] },
                    React.createElement(Text, { style: [styles.tableCell, { width: '33%', fontFamily: 'Helvetica-Bold' }] }, 'TOTAL'),
                    React.createElement(Text, { style: [styles.tableCell, { width: '33%', textAlign: 'right', fontFamily: 'Courier-Bold' }] }, fmt(batch.totalYieldG)),
                    React.createElement(Text, { style: [styles.tableCell, { width: '34%', textAlign: 'right', fontFamily: 'Courier-Bold' }] }, fmtPct(batch.yieldPct))
                )
            ),
            // Allocation
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Allocation'),
                React.createElement(DataRow, { label: 'QA Sample', value: fmt(batch.allocQa) }),
                React.createElement(DataRow, { label: 'Packaged Bubble Hash', value: fmt(batch.allocPackaged), alt: true }),
                React.createElement(DataRow, { label: 'Pressed Bubble Hash', value: fmt(batch.allocPressed) }),
                React.createElement(DataRow, { label: 'Pre-Roll Hash', value: fmt(batch.allocPreRoll), alt: true }),
                React.createElement(DataRow, { label: 'White Label', value: fmt(batch.allocWhiteLabel) }),
                React.createElement(DataRow, { label: 'To Rosin', value: fmt(batch.allocRosin), alt: true }),
                React.createElement(DataRow, { label: 'Processing Loss', value: fmt(batch.allocLossG) })
            ),
            // Sign-off
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Sign-Off'),
                React.createElement(
                    View,
                    { style: styles.signoffGrid },
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Processed By'),
                        React.createElement(Text, { style: styles.signoffValue }, batch.processedBy ?? '—')
                    ),
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Verified By (QAP)'),
                        React.createElement(Text, { style: styles.signoffValue }, batch.verifiedBy ?? '—')
                    )
                )
            ),
            React.createElement(Footer, { batchNumber: batch.batchNumber })
        )
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROSIN BATCH PDF
// ═══════════════════════════════════════════════════════════════════════════

type RosinBatchData = {
    batchNumber: string
    strain: string
    processDate: Date | string
    sourceHashBatch?: { batchNumber: string; strain: string } | null
    micron120uWeightG?: number | null
    micron90uWeightG?: number | null
    micron73uWeightG?: number | null
    micron45uWeightG?: number | null
    totalHashWeightG?: number | null
    productType: string
    productName?: string | null
    rosinYieldWeightG?: number | null
    rosinYieldPct?: number | null
    consistency?: string | null
    decarb: boolean
    decarbWeightG?: number | null
    decarbLossG?: number | null
    rosinChipEstimateG?: number | null
    bagWeightG?: number | null
    rosinProductUid?: string | null
    rosinProcessedBy?: string | null
    decarbProcessedBy?: string | null
    qcVerifiedBy?: string | null
}

function RosinBatchDocument({ batch }: { batch: RosinBatchData }) {
    return React.createElement(
        Document,
        null,
        React.createElement(
            Page,
            { size: 'LETTER', style: styles.page },
            React.createElement(
                View,
                { style: styles.header },
                React.createElement(Text, { style: styles.headerTitle }, 'Rosin Manufacturing Batch Record'),
                React.createElement(Text, { style: styles.headerSubtitle }, `${batch.batchNumber}  •  ${batch.strain}  •  ${fmtDate(batch.processDate)}`)
            ),
            // Source Hash
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Source Hash'),
                React.createElement(DataRow, { label: 'Source Batch', value: batch.sourceHashBatch?.batchNumber ?? '—' }),
                React.createElement(DataRow, { label: 'Source Strain', value: batch.sourceHashBatch?.strain ?? batch.strain, alt: true }),
                React.createElement(DataRow, { label: '120μ Used', value: fmt(batch.micron120uWeightG) }),
                React.createElement(DataRow, { label: '90μ Used', value: fmt(batch.micron90uWeightG), alt: true }),
                React.createElement(DataRow, { label: '73μ Used', value: fmt(batch.micron73uWeightG) }),
                React.createElement(DataRow, { label: '45μ Used', value: fmt(batch.micron45uWeightG), alt: true }),
                React.createElement(DataRow, { label: 'Total Hash Weight', value: fmt(batch.totalHashWeightG) })
            ),
            // Processing
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Processing'),
                React.createElement(DataRow, { label: 'Product Type', value: batch.productType }),
                React.createElement(DataRow, { label: 'Product Name', value: batch.productName ?? '—', alt: true }),
                React.createElement(DataRow, { label: 'Process Date', value: fmtDate(batch.processDate) }),
                React.createElement(DataRow, { label: 'Rosin Yield', value: fmt(batch.rosinYieldWeightG), alt: true }),
                React.createElement(DataRow, { label: 'Yield %', value: fmtPct(batch.rosinYieldPct) }),
                React.createElement(DataRow, { label: 'Consistency', value: batch.consistency ?? '—', alt: true })
            ),
            // Post-Processing
            batch.decarb
                ? React.createElement(
                    View,
                    { style: styles.section },
                    React.createElement(Text, { style: styles.sectionTitle }, 'Post-Processing (Decarb)'),
                    React.createElement(DataRow, { label: 'Weight After Decarb', value: fmt(batch.decarbWeightG) }),
                    React.createElement(DataRow, { label: 'Decarb Loss', value: fmt(batch.decarbLossG), alt: true })
                )
                : null,
            // Output
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Output'),
                React.createElement(DataRow, { label: 'Rosin Chip Estimate', value: fmt(batch.rosinChipEstimateG) }),
                React.createElement(DataRow, { label: 'Bag Weight', value: fmt(batch.bagWeightG), alt: true }),
                React.createElement(DataRow, { label: 'METRC Product UID', value: batch.rosinProductUid ?? '—' })
            ),
            // Sign-off
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Sign-Off'),
                React.createElement(
                    View,
                    { style: styles.signoffGrid },
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Rosin Processed By'),
                        React.createElement(Text, { style: styles.signoffValue }, batch.rosinProcessedBy ?? '—')
                    ),
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Decarb Processed By'),
                        React.createElement(Text, { style: styles.signoffValue }, batch.decarbProcessedBy ?? '—')
                    ),
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'QC Verified By'),
                        React.createElement(Text, { style: styles.signoffValue }, batch.qcVerifiedBy ?? '—')
                    )
                )
            ),
            React.createElement(Footer, { batchNumber: batch.batchNumber })
        )
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANING LOG PDF
// ═══════════════════════════════════════════════════════════════════════════

type CleaningLogData = {
    logNumber: string
    weekOf: Date | string
    entries: Array<{
        dayOfWeek: number
        date: Date | string
        equipmentName: string
        cleaned: boolean
        cleanedBy?: string | null
        verifiedBy?: string | null
        notes?: string | null
    }>
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CleaningLogDocument({ log }: { log: CleaningLogData }) {
    return React.createElement(
        Document,
        null,
        React.createElement(
            Page,
            { size: 'LETTER', style: styles.page },
            React.createElement(
                View,
                { style: styles.header },
                React.createElement(Text, { style: styles.headerTitle }, 'Cleaning Log — Manufacturing'),
                React.createElement(Text, { style: styles.headerSubtitle }, `${log.logNumber}  •  Week of ${fmtDate(log.weekOf)}`)
            ),
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(
                    View,
                    { style: styles.tableHeader },
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '8%' }] }, 'Day'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '14%' }] }, 'Date'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '28%' }] }, 'Equipment'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '10%', textAlign: 'center' }] }, 'Clean'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '15%' }] }, 'By'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '15%' }] }, 'Verified'),
                    React.createElement(Text, { style: [styles.tableHeaderCell, { width: '10%' }] }, 'Notes')
                ),
                ...log.entries.map((entry, i) =>
                    React.createElement(
                        View,
                        { key: i, style: [styles.tableRow, i % 2 === 1 ? styles.rowAlt : {}] },
                        React.createElement(Text, { style: [styles.tableCell, { width: '8%' }] }, DAY_NAMES[entry.dayOfWeek] ?? '—'),
                        React.createElement(Text, { style: [styles.tableCell, { width: '14%' }] }, fmtDate(entry.date)),
                        React.createElement(Text, { style: [styles.tableCell, { width: '28%' }] }, entry.equipmentName),
                        React.createElement(Text, { style: [styles.tableCell, { width: '10%', textAlign: 'center' }] }, entry.cleaned ? '✓' : '—'),
                        React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, entry.cleanedBy ?? '—'),
                        React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, entry.verifiedBy ?? '—'),
                        React.createElement(Text, { style: [styles.tableCell, { width: '10%', fontSize: 7 }] }, entry.notes ?? '')
                    )
                )
            ),
            React.createElement(Footer, { batchNumber: log.logNumber })
        )
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE LOG PDF
// ═══════════════════════════════════════════════════════════════════════════

type MaintenanceLogData = {
    equipmentName: string
    category: string
    date: Date | string
    description: string
    actionsTaken?: string | null
    partsReplaced?: string | null
    performedBy: string
    verifiedBy?: string | null
    nextDueDate?: Date | string | null
    notes?: string | null
}

function MaintenanceLogDocument({ log }: { log: MaintenanceLogData }) {
    return React.createElement(
        Document,
        null,
        React.createElement(
            Page,
            { size: 'LETTER', style: styles.page },
            React.createElement(
                View,
                { style: styles.header },
                React.createElement(Text, { style: styles.headerTitle }, 'Equipment Maintenance Record'),
                React.createElement(Text, { style: styles.headerSubtitle }, `${log.equipmentName}  •  ${log.category}  •  ${fmtDate(log.date)}`)
            ),
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Maintenance Details'),
                React.createElement(DataRow, { label: 'Equipment', value: log.equipmentName }),
                React.createElement(DataRow, { label: 'Category', value: log.category, alt: true }),
                React.createElement(DataRow, { label: 'Date', value: fmtDate(log.date) }),
                React.createElement(DataRow, { label: 'Description', value: log.description, alt: true }),
                React.createElement(DataRow, { label: 'Actions Taken', value: log.actionsTaken ?? '—' }),
                React.createElement(DataRow, { label: 'Parts Replaced', value: log.partsReplaced ?? '—', alt: true }),
                React.createElement(DataRow, { label: 'Next Due Date', value: fmtDate(log.nextDueDate) }),
                React.createElement(DataRow, { label: 'Notes', value: log.notes ?? '—', alt: true })
            ),
            React.createElement(
                View,
                { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Sign-Off'),
                React.createElement(
                    View,
                    { style: styles.signoffGrid },
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Performed By'),
                        React.createElement(Text, { style: styles.signoffValue }, log.performedBy)
                    ),
                    React.createElement(
                        View,
                        { style: styles.signoffBox },
                        React.createElement(Text, { style: styles.signoffLabel }, 'Verified By'),
                        React.createElement(Text, { style: styles.signoffValue }, log.verifiedBy ?? '—')
                    )
                )
            ),
            React.createElement(Footer, { batchNumber: log.equipmentName })
        )
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API — Generate PDF buffers
// ═══════════════════════════════════════════════════════════════════════════

export async function generateHashBatchPDF(batch: HashBatchData): Promise<Buffer> {
    return renderToBuffer(React.createElement(HashBatchDocument, { batch }) as AnyElement)
}

export async function generateRosinBatchPDF(batch: RosinBatchData): Promise<Buffer> {
    return renderToBuffer(React.createElement(RosinBatchDocument, { batch }) as AnyElement)
}

export async function generateCleaningLogPDF(log: CleaningLogData): Promise<Buffer> {
    return renderToBuffer(React.createElement(CleaningLogDocument, { log }) as AnyElement)
}

export async function generateMaintenanceLogPDF(log: MaintenanceLogData): Promise<Buffer> {
    return renderToBuffer(React.createElement(MaintenanceLogDocument, { log }) as AnyElement)
}
