/**
 * Hash Agent — AI Tool Declarations & Handlers
 * Gemini function-calling tools for managing hash lab operations
 */
import { type FunctionDeclaration, SchemaType } from '@google/generative-ai'
import { db } from '@/lib/db'
import { calculateYieldPct, calculateTotalMicronYield, suggestQualityTier } from '@/lib/utils'
import { geminiVision } from '@/lib/gemini'
import { MaterialState, MaterialGrade, RosinProductType, HaMaintenanceCategory } from '@prisma/client'

// ═══════════════════════════════════════════════════════════════════════════
// TOOL DECLARATIONS (Gemini FunctionDeclaration format)
// ═══════════════════════════════════════════════════════════════════════════

export const toolDeclarations: FunctionDeclaration[] = [
    {
        name: 'create_hash_batch',
        description: 'Create a new bubble hash batch record in the system',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                strain: { type: SchemaType.STRING, description: 'Cannabis strain name' },
                materialState: { type: SchemaType.STRING, description: 'DRIED or FRESH_FROZEN' },
                materialGrade: { type: SchemaType.STRING, description: 'SMALLS, BUDS, TRIM, WHOLE_PLANT, or LARF' },
                farmSource: { type: SchemaType.STRING, description: 'Farm or source name' },
                rawMaterialWeightG: { type: SchemaType.NUMBER, description: 'Starting material weight in grams' },
                washDate: { type: SchemaType.STRING, description: 'Wash date in YYYY-MM-DD format' },
            },
            required: ['strain', 'materialState', 'materialGrade', 'rawMaterialWeightG', 'washDate'],
        },
    },
    {
        name: 'list_hash_batches',
        description: 'List bubble hash batches with optional filters',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                strain: { type: SchemaType.STRING, description: 'Filter by strain name' },
                status: { type: SchemaType.STRING, description: 'Filter by status: WASHING, DRYING, COMPLETE, ALLOCATED, ARCHIVED' },
                limit: { type: SchemaType.NUMBER, description: 'Max results to return (default 10)' },
            },
        },
    },
    {
        name: 'get_hash_batch',
        description: 'Get detailed information about a specific hash batch',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                batchId: { type: SchemaType.STRING, description: 'The batch ID or batch number' },
            },
            required: ['batchId'],
        },
    },
    {
        name: 'enter_micron_yields',
        description: 'Enter freeze-dried micron yield weights for a hash batch',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                batchId: { type: SchemaType.STRING, description: 'The batch ID' },
                yield160u: { type: SchemaType.NUMBER, description: '160 micron yield in grams' },
                yield120u: { type: SchemaType.NUMBER, description: '120 micron yield in grams' },
                yield90u: { type: SchemaType.NUMBER, description: '90 micron yield in grams' },
                yield73u: { type: SchemaType.NUMBER, description: '73 micron yield in grams' },
                yield45u: { type: SchemaType.NUMBER, description: '45 micron yield in grams' },
            },
            required: ['batchId'],
        },
    },
    {
        name: 'allocate_hash',
        description: 'Set allocation percentages for a completed hash batch',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                batchId: { type: SchemaType.STRING, description: 'The batch ID' },
                allocRosin: { type: SchemaType.NUMBER, description: 'Grams allocated to rosin pressing' },
                allocPackaged: { type: SchemaType.NUMBER, description: 'Grams allocated to packaging' },
                allocQa: { type: SchemaType.NUMBER, description: 'Grams allocated to QA testing' },
                allocPressed: { type: SchemaType.NUMBER, description: 'Grams allocated to pressed hash' },
                allocPreRoll: { type: SchemaType.NUMBER, description: 'Grams allocated to pre-rolls' },
                allocWhiteLabel: { type: SchemaType.NUMBER, description: 'Grams allocated to white label' },
            },
            required: ['batchId'],
        },
    },
    {
        name: 'create_rosin_batch',
        description: 'Create a new rosin press batch from a source hash batch',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                sourceHashBatchId: { type: SchemaType.STRING, description: 'Source hash batch ID' },
                micron120u: { type: SchemaType.NUMBER, description: '120 micron hash weight in grams' },
                micron90u: { type: SchemaType.NUMBER, description: '90 micron hash weight in grams' },
                micron73u: { type: SchemaType.NUMBER, description: '73 micron hash weight in grams' },
                micron45u: { type: SchemaType.NUMBER, description: '45 micron hash weight in grams' },
                processDate: { type: SchemaType.STRING, description: 'Press date in YYYY-MM-DD format' },
                productType: { type: SchemaType.STRING, description: 'FULL_PRESS, BADDER, VAPE, LIVE_ROSIN, or COLD_CURE' },
            },
            required: ['sourceHashBatchId', 'processDate'],
        },
    },
    {
        name: 'list_rosin_batches',
        description: 'List rosin batches with optional filters',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                strain: { type: SchemaType.STRING, description: 'Filter by strain' },
                status: { type: SchemaType.STRING, description: 'Filter by status: PRESSING, POST_PROCESSING, DECARB, COMPLETE, ARCHIVED' },
                limit: { type: SchemaType.NUMBER, description: 'Max results (default 10)' },
            },
        },
    },
    {
        name: 'get_rosin_batch',
        description: 'Get detailed information about a specific rosin batch',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                batchId: { type: SchemaType.STRING, description: 'The rosin batch ID' },
            },
            required: ['batchId'],
        },
    },
    {
        name: 'get_freeze_dryer_status',
        description: 'Get current status of freeze dryers (temperature, pressure, phase)',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                freezeDryerId: { type: SchemaType.STRING, description: 'Specific freeze dryer ID (optional, returns all if omitted)' },
            },
        },
    },
    {
        name: 'get_fleet_overview',
        description: 'Get a high-level overview of the entire hash lab operation: batch counts, equipment status, recent activity',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {},
        },
    },
    {
        name: 'log_maintenance',
        description: 'Log an equipment maintenance task',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                category: { type: SchemaType.STRING, description: 'FREEZE_DRYER, WATER_FILTRATION, RO_SYSTEM, PRESS, WASH_TANK, or GENERAL' },
                equipmentId: { type: SchemaType.STRING, description: 'Specific equipment/freeze dryer ID' },
                task: { type: SchemaType.STRING, description: 'Description of maintenance performed' },
                performedBy: { type: SchemaType.STRING, description: 'Name of person who performed maintenance' },
            },
            required: ['category', 'task'],
        },
    },
    {
        name: 'get_yield_analytics',
        description: 'Get yield analytics: averages, trends, best/worst batches',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                strain: { type: SchemaType.STRING, description: 'Filter by strain' },
                dateFrom: { type: SchemaType.STRING, description: 'Start date YYYY-MM-DD' },
                dateTo: { type: SchemaType.STRING, description: 'End date YYYY-MM-DD' },
            },
        },
    },
    {
        name: 'get_strain_performance',
        description: 'Get performance rankings by strain: avg yield, batch count, best micron distribution',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                limit: { type: SchemaType.NUMBER, description: 'Number of top strains to return (default 10)' },
            },
        },
    },
    {
        name: 'process_weight_image',
        description: 'Process a scale/weight photo using OCR to extract the weight reading',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                imageBase64: { type: SchemaType.STRING, description: 'Base64-encoded image of the scale' },
            },
            required: ['imageBase64'],
        },
    },
]

// ═══════════════════════════════════════════════════════════════════════════
// TOOL HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

type ToolHandler = (orgId: string, args: Record<string, unknown>) => Promise<string>

const handlers: Record<string, ToolHandler> = {
    // ── 1. Create Hash Batch ────────────────────────────────────────────
    async create_hash_batch(orgId, args) {
        const seq = await db.hashBatch.count({ where: { orgId } }) + 1
        const batchNumber = `BMR-${String(seq).padStart(3, '0')}-BH`

        const batch = await db.hashBatch.create({
            data: {
                orgId,
                strain: args.strain as string,
                batchNumber,
                materialState: args.materialState as MaterialState,
                materialGrade: args.materialGrade as MaterialGrade,
                farmSource: (args.farmSource as string) ?? null,
                rawMaterialWeightG: args.rawMaterialWeightG as number,
                washDate: new Date(args.washDate as string),
                status: 'WASHING',
            },
        })

        return JSON.stringify({
            success: true,
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            strain: batch.strain,
            rawMaterialWeightG: batch.rawMaterialWeightG,
        })
    },

    // ── 2. List Hash Batches ────────────────────────────────────────────
    async list_hash_batches(orgId, args) {
        const where: Record<string, unknown> = { orgId }
        if (args.strain) where.strain = { contains: args.strain as string, mode: 'insensitive' }
        if (args.status) where.status = args.status

        const batches = await db.hashBatch.findMany({
            where,
            orderBy: { washDate: 'desc' },
            take: (args.limit as number) ?? 10,
            select: {
                id: true,
                batchNumber: true,
                strain: true,
                status: true,
                washDate: true,
                rawMaterialWeightG: true,
                totalYieldG: true,
                yieldPct: true,
                qualityTier: true,
            },
        })

        return JSON.stringify({ batches, count: batches.length })
    },

    // ── 3. Get Hash Batch ───────────────────────────────────────────────
    async get_hash_batch(orgId, args) {
        const batchId = args.batchId as string

        // Try finding by ID first, then by batch number
        let batch = await db.hashBatch.findFirst({
            where: { id: batchId, orgId },
            include: {
                freezeDryer: { select: { name: true, callsign: true } },
                _count: { select: { rosinBatches: true } },
            },
        })

        if (!batch) {
            batch = await db.hashBatch.findFirst({
                where: { batchNumber: batchId, orgId },
                include: {
                    freezeDryer: { select: { name: true, callsign: true } },
                    _count: { select: { rosinBatches: true } },
                },
            })
        }

        if (!batch) return JSON.stringify({ error: 'Batch not found' })
        return JSON.stringify(batch)
    },

    // ── 4. Enter Micron Yields ──────────────────────────────────────────
    async enter_micron_yields(orgId, args) {
        const batch = await db.hashBatch.findFirst({
            where: { id: args.batchId as string, orgId },
        })
        if (!batch) return JSON.stringify({ error: 'Batch not found' })

        const yields = {
            yield160u: (args.yield160u as number) ?? 0,
            yield120u: (args.yield120u as number) ?? 0,
            yield90u: (args.yield90u as number) ?? 0,
            yield73u: (args.yield73u as number) ?? 0,
            yield45u: (args.yield45u as number) ?? 0,
        }

        const totalYieldG = calculateTotalMicronYield(yields)
        const yieldPct = calculateYieldPct(totalYieldG, batch.rawMaterialWeightG ?? 0)
        const qualityTier = suggestQualityTier(yields)

        const updated = await db.hashBatch.update({
            where: { id: batch.id },
            data: {
                ...yields,
                totalYieldG,
                yieldPct,
                qualityTier,
                status: 'COMPLETE',
            },
        })

        return JSON.stringify({
            success: true,
            batchNumber: updated.batchNumber,
            totalYieldG,
            yieldPct: Math.round(yieldPct * 100) / 100,
            qualityTier,
        })
    },

    // ── 5. Allocate Hash ────────────────────────────────────────────────
    async allocate_hash(orgId, args) {
        const batch = await db.hashBatch.findFirst({
            where: { id: args.batchId as string, orgId },
        })
        if (!batch) return JSON.stringify({ error: 'Batch not found' })

        const updated = await db.hashBatch.update({
            where: { id: batch.id },
            data: {
                allocRosin: (args.allocRosin as number) ?? 0,
                allocPackaged: (args.allocPackaged as number) ?? 0,
                allocQa: (args.allocQa as number) ?? 0,
                allocPressed: (args.allocPressed as number) ?? 0,
                allocPreRoll: (args.allocPreRoll as number) ?? 0,
                allocWhiteLabel: (args.allocWhiteLabel as number) ?? 0,
                status: 'ALLOCATED',
            },
        })

        return JSON.stringify({
            success: true,
            batchNumber: updated.batchNumber,
            allocations: {
                rosin: updated.allocRosin,
                packaged: updated.allocPackaged,
                qa: updated.allocQa,
                pressed: updated.allocPressed,
                preRoll: updated.allocPreRoll,
                whiteLabel: updated.allocWhiteLabel,
            },
        })
    },

    // ── 6. Create Rosin Batch ───────────────────────────────────────────
    async create_rosin_batch(orgId, args) {
        const sourceBatch = await db.hashBatch.findFirst({
            where: { id: args.sourceHashBatchId as string, orgId },
        })
        if (!sourceBatch) return JSON.stringify({ error: 'Source hash batch not found' })

        const seq = await db.rosinBatch.count({ where: { orgId } }) + 1
        const batchNumber = `BMR-${String(seq).padStart(3, '0')}-R`

        const m120 = (args.micron120u as number) ?? 0
        const m90 = (args.micron90u as number) ?? 0
        const m73 = (args.micron73u as number) ?? 0
        const m45 = (args.micron45u as number) ?? 0
        const totalHashWeightG = m120 + m90 + m73 + m45

        const batch = await db.rosinBatch.create({
            data: {
                orgId,
                batchNumber,
                sourceHashBatchId: sourceBatch.id,
                strain: sourceBatch.strain,
                micron120uWeightG: m120,
                micron90uWeightG: m90,
                micron73uWeightG: m73,
                micron45uWeightG: m45,
                totalHashWeightG: totalHashWeightG > 0 ? totalHashWeightG : (sourceBatch.totalYieldG ?? 0),
                processDate: new Date((args.processDate as string) ?? new Date().toISOString()),
                productType: (args.productType as RosinProductType) ?? 'FULL_PRESS',
                status: 'PRESSING',
            },
        })

        return JSON.stringify({
            success: true,
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            strain: batch.strain,
            totalHashWeightG: batch.totalHashWeightG,
        })
    },

    // ── 7. List Rosin Batches ───────────────────────────────────────────
    async list_rosin_batches(orgId, args) {
        const where: Record<string, unknown> = { orgId }
        if (args.strain) where.strain = { contains: args.strain as string, mode: 'insensitive' }
        if (args.status) where.status = args.status

        const batches = await db.rosinBatch.findMany({
            where,
            orderBy: { processDate: 'desc' },
            take: (args.limit as number) ?? 10,
            select: {
                id: true,
                batchNumber: true,
                strain: true,
                status: true,
                processDate: true,
                productType: true,
                totalHashWeightG: true,
                rosinYieldWeightG: true,
                rosinYieldPct: true,
                companyProcessedFor: true,
            },
        })

        return JSON.stringify({ batches, count: batches.length })
    },

    // ── 8. Get Rosin Batch ──────────────────────────────────────────────
    async get_rosin_batch(orgId, args) {
        const batch = await db.rosinBatch.findFirst({
            where: { id: args.batchId as string, orgId },
            include: {
                sourceHashBatch: {
                    select: { batchNumber: true, strain: true, totalYieldG: true },
                },
            },
        })

        if (!batch) return JSON.stringify({ error: 'Rosin batch not found' })
        return JSON.stringify(batch)
    },

    // ── 9. Get Freeze Dryer Status ──────────────────────────────────────
    async get_freeze_dryer_status(orgId, args) {
        const where: Record<string, unknown> = { orgId }
        if (args.freezeDryerId) where.id = args.freezeDryerId

        const dryers = await db.freezeDryer.findMany({
            where,
            select: {
                id: true,
                name: true,
                callsign: true,
                isOnline: true,
                currentPhase: true,
                currentTempF: true,
                currentPressureMt: true,
                batchStartedAt: true,
                batchProgress: true,
                lastSeenAt: true,
            },
        })

        return JSON.stringify({ dryers, count: dryers.length })
    },

    // ── 10. Get Fleet Overview ──────────────────────────────────────────
    async get_fleet_overview(orgId) {
        const [
            hashBatchCount,
            activeHashBatches,
            rosinBatchCount,
            activeRosinBatches,
            freezeDryers,
            recentMaintenance,
        ] = await Promise.all([
            db.hashBatch.count({ where: { orgId } }),
            db.hashBatch.count({ where: { orgId, status: { in: ['WASHING', 'DRYING'] } } }),
            db.rosinBatch.count({ where: { orgId } }),
            db.rosinBatch.count({ where: { orgId, status: { in: ['PRESSING', 'POST_PROCESSING', 'DECARB'] } } }),
            db.freezeDryer.findMany({
                where: { orgId },
                select: { name: true, callsign: true, isOnline: true, currentPhase: true },
            }),
            db.haEquipmentMaintenanceLog.findMany({
                where: { orgId },
                orderBy: { date: 'desc' },
                take: 3,
                select: { category: true, description: true, date: true },
            }),
        ])

        return JSON.stringify({
            hashBatches: { total: hashBatchCount, active: activeHashBatches },
            rosinBatches: { total: rosinBatchCount, active: activeRosinBatches },
            freezeDryers,
            recentMaintenance,
        })
    },

    // ── 11. Log Maintenance ─────────────────────────────────────────────
    async log_maintenance(orgId, args) {
        const log = await db.haEquipmentMaintenanceLog.create({
            data: {
                orgId,
                category: args.category as HaMaintenanceCategory,
                equipmentId: (args.equipmentId as string) ?? '',
                equipmentType: 'freeze_dryer',
                equipmentName: (args.equipmentId as string) ?? 'General',
                description: args.task as string,
                performedBy: (args.performedBy as string) ?? 'AI Assistant',
                date: new Date(),
            },
        })

        return JSON.stringify({
            success: true,
            logId: log.id,
            category: log.category,
            task: log.description,
        })
    },

    // ── 12. Get Yield Analytics ─────────────────────────────────────────
    async get_yield_analytics(orgId, args) {
        const where: Record<string, unknown> = { orgId, status: 'COMPLETE' }
        if (args.strain) where.strain = { contains: args.strain as string, mode: 'insensitive' }
        if (args.dateFrom || args.dateTo) {
            where.washDate = {}
            if (args.dateFrom) (where.washDate as Record<string, unknown>).gte = new Date(args.dateFrom as string)
            if (args.dateTo) (where.washDate as Record<string, unknown>).lte = new Date(args.dateTo as string)
        }

        const batches = await db.hashBatch.findMany({
            where,
            select: {
                strain: true,
                yieldPct: true,
                totalYieldG: true,
                rawMaterialWeightG: true,
                qualityTier: true,
                washDate: true,
            },
            orderBy: { washDate: 'desc' },
        })

        if (batches.length === 0) {
            return JSON.stringify({ message: 'No completed batches found matching criteria', count: 0 })
        }

        const yieldPcts = batches.map(b => b.yieldPct).filter((p): p is number => p != null)
        const avgYield = yieldPcts.length > 0 ? yieldPcts.reduce((a, b) => a + b, 0) / yieldPcts.length : 0
        const maxYield = Math.max(...yieldPcts, 0)
        const minYield = Math.min(...yieldPcts, 100)

        const totalInputG = batches.reduce((sum, b) => sum + (b.rawMaterialWeightG ?? 0), 0)
        const totalOutputG = batches.reduce((sum, b) => sum + (b.totalYieldG ?? 0), 0)

        const tierCounts = { TIER_1: 0, TIER_2: 0, TIER_3: 0 }
        for (const b of batches) {
            if (b.qualityTier && b.qualityTier in tierCounts) {
                tierCounts[b.qualityTier as keyof typeof tierCounts]++
            }
        }

        return JSON.stringify({
            batchCount: batches.length,
            avgYieldPct: Math.round(avgYield * 100) / 100,
            maxYieldPct: Math.round(maxYield * 100) / 100,
            minYieldPct: Math.round(minYield * 100) / 100,
            totalInputG: Math.round(totalInputG),
            totalOutputG: Math.round(totalOutputG),
            tierDistribution: tierCounts,
        })
    },

    // ── 13. Get Strain Performance ──────────────────────────────────────
    async get_strain_performance(orgId, args) {
        const limit = (args.limit as number) ?? 10

        const batches = await db.hashBatch.findMany({
            where: { orgId, status: 'COMPLETE' },
            select: {
                strain: true,
                yieldPct: true,
                totalYieldG: true,
                rawMaterialWeightG: true,
                qualityTier: true,
            },
        })

        // Group by strain
        const strainMap: Record<string, {
            batchCount: number
            yields: number[]
            totalInput: number
            totalOutput: number
            tier1: number
        }> = {}

        for (const b of batches) {
            const key = b.strain.toLowerCase()
            if (!strainMap[key]) {
                strainMap[key] = { batchCount: 0, yields: [], totalInput: 0, totalOutput: 0, tier1: 0 }
            }
            strainMap[key].batchCount++
            if (b.yieldPct != null) strainMap[key].yields.push(b.yieldPct)
            strainMap[key].totalInput += b.rawMaterialWeightG ?? 0
            strainMap[key].totalOutput += b.totalYieldG ?? 0
            if (b.qualityTier === 'TIER_1') strainMap[key].tier1++
        }

        const rankings = Object.entries(strainMap)
            .map(([strain, data]) => ({
                strain,
                batchCount: data.batchCount,
                avgYieldPct: data.yields.length > 0
                    ? Math.round((data.yields.reduce((a, b) => a + b, 0) / data.yields.length) * 100) / 100
                    : 0,
                bestYieldPct: Math.max(...data.yields, 0),
                totalInputG: Math.round(data.totalInput),
                totalOutputG: Math.round(data.totalOutput),
                tier1Count: data.tier1,
            }))
            .sort((a, b) => b.avgYieldPct - a.avgYieldPct)
            .slice(0, limit)

        return JSON.stringify({ rankings, strainCount: Object.keys(strainMap).length })
    },

    // ── 14. Process Weight Image ────────────────────────────────────────
    async process_weight_image(_orgId, args) {
        const imageBase64 = args.imageBase64 as string
        if (!imageBase64) return JSON.stringify({ error: 'No image provided' })

        const prompt = `You are reading a digital scale display. Extract the weight value shown on the scale.
Return ONLY a JSON object with these fields:
- weight: the numeric weight value (as a number)
- unit: the unit shown (g, kg, lb, oz)
- confidence: your confidence level (high, medium, low)

Example: {"weight": 2847.3, "unit": "g", "confidence": "high"}`

        const result = await geminiVision(imageBase64, prompt)

        try {
            const parsed = JSON.parse(result)
            return JSON.stringify(parsed)
        } catch {
            return JSON.stringify({ rawText: result, error: 'Could not parse structured weight data' })
        }
    },
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════

export async function executeTool(
    orgId: string,
    toolName: string,
    args: Record<string, unknown>,
): Promise<string> {
    const handler = handlers[toolName]
    if (!handler) {
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }

    try {
        return await handler(orgId, args)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Tool execution failed'
        return JSON.stringify({ error: message })
    }
}
