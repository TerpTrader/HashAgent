import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// BUBBLE HASH BATCH — WIZARD STEP VALIDATION SCHEMAS
// Each step in the 5-step BubbleHashWizard validates independently
// ═══════════════════════════════════════════════════════════════════════════

// Step 1: Starting Material
export const startingMaterialSchema = z.object({
    strain: z.string().min(1, 'Strain is required'),
    farmSource: z.string().optional(),
    materialState: z.enum(['DRIED', 'FRESH_FROZEN'], {
        required_error: 'Select material state',
    }),
    materialGrade: z.enum(['SMALLS', 'BUDS', 'TRIM', 'WHOLE_PLANT', 'LARF'], {
        required_error: 'Select material grade',
    }),
    metrcSourceUid: z.string().optional(),
    licenseKey: z.string().optional(),
    cleaningLogRef: z.string().optional(),
})

// Step 2: Initial Processing
export const initialProcessingSchema = z.object({
    washDate: z.string().min(1, 'Wash date is required'),
    rawMaterialWeightG: z.number().positive('Weight must be greater than 0'),
    wetWasteWeightG: z.number().min(0).optional(),
    expectedYieldPct: z.number().min(0).max(100).optional(),
    equipmentUsed: z.object({
        tank: z.string().optional(),
        catchment: z.string().optional(),
        hoses: z.boolean().optional(),
        pumps: z.boolean().optional(),
        freezeDryers: z.array(z.string()).optional(),
    }).optional(),
})

// Step 3: Post Processing (Drying)
export const dryingSchema = z.object({
    freezeDryerId: z.string().optional(),
    dryingDate: z.string().optional(),
    shelfLimitF: z.number().optional(),
    freezeTimeHrs: z.number().min(0).optional(),
    dryingTimeHrs: z.number().min(0).optional(),
    yield160u: z.number().min(0).optional().default(0),
    yield120u: z.number().min(0).optional().default(0),
    yield90u: z.number().min(0).optional().default(0),
    yield73u: z.number().min(0).optional().default(0),
    yield45u: z.number().min(0).optional().default(0),
    yield25u: z.number().min(0).optional().default(0),
})

// Step 4: Output
export const outputSchema = z.object({
    productName: z.string().optional(),
    batchNumber: z.string().min(1, 'Batch number is required'),
    metrcProductUid: z.string().optional(),
    qualityTier: z.enum(['TIER_1', 'TIER_2', 'TIER_3']).optional(),
    manufacturingDate: z.string().optional(),
})

// Step 5: Allocation
export const allocationSchema = z.object({
    allocQa: z.number().min(0).default(0),
    allocPackaged: z.number().min(0).default(0),
    allocPressed: z.number().min(0).default(0),
    allocPreRoll: z.number().min(0).default(0),
    allocWhiteLabel: z.number().min(0).default(0),
    allocRosin: z.number().min(0).default(0),
    allocLossG: z.number().min(0).default(0),
    allocationNotes: z.string().optional(),
})

// Full batch schema (for API validation)
export const createHashBatchSchema = startingMaterialSchema
    .merge(initialProcessingSchema)
    .merge(dryingSchema)
    .merge(outputSchema)
    .merge(allocationSchema)
    .extend({
        processedBy: z.string().optional(),
        verifiedBy: z.string().optional(),
    })

export type StartingMaterialInput = z.infer<typeof startingMaterialSchema>
export type InitialProcessingInput = z.infer<typeof initialProcessingSchema>
export type DryingInput = z.infer<typeof dryingSchema>
export type OutputInput = z.infer<typeof outputSchema>
export type AllocationInput = z.infer<typeof allocationSchema>
export type CreateHashBatchInput = z.infer<typeof createHashBatchSchema>
