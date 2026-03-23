import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// ROSIN BATCH — WIZARD STEP VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

// Step 1: Source Hash Selection
export const sourceSelectionSchema = z.object({
    sourceHashBatchId: z.string().min(1, 'Select a source hash batch'),
    strain: z.string().min(1),
    micron120uWeightG: z.number().min(0).default(0),
    micron90uWeightG: z.number().min(0).default(0),
    micron73uWeightG: z.number().min(0).default(0),
    micron45uWeightG: z.number().min(0).default(0),
    totalHashWeightG: z.number().positive('Total hash weight must be > 0'),
})

// Step 2: Press Setup
export const pressSetupSchema = z.object({
    pressId: z.string().optional(),
    productType: z.enum(['FULL_PRESS', 'BADDER', 'VAPE', 'LIVE_ROSIN', 'COLD_CURE']).default('FULL_PRESS'),
    equipmentUsed: z.object({
        press: z.string().optional(),
        postProcess: z.string().optional(),
    }).optional(),
})

// Step 3: Processing
export const rosinProcessingSchema = z.object({
    processDate: z.string().min(1, 'Process date is required'),
    rosinYieldWeightG: z.number().min(0, 'Yield weight must be >= 0').optional(),
    consistency: z.string().optional(),
})

// Step 4: Post Processing
export const postProcessingSchema = z.object({
    decarb: z.boolean().default(false),
    decarbWeightG: z.number().min(0).optional(),
    decarbLossG: z.number().min(0).optional(),
    rosinChipUid: z.string().optional(),
    rosinChipEstimateG: z.number().min(0).optional(),
    bagWeightG: z.number().min(0).optional(),
})

// Step 5: Output & Signoff
export const rosinOutputSchema = z.object({
    productName: z.string().optional(),
    batchNumber: z.string().min(1, 'Batch number is required'),
    rosinProductUid: z.string().optional(),
    metrcBatchNumber: z.string().optional(),
    companyProcessedFor: z.string().optional(),
    rosinProcessedBy: z.string().optional(),
    decarbProcessedBy: z.string().optional(),
    qcVerifiedBy: z.string().optional(),
    cleaningLogRef: z.string().optional(),
})

// Full schema
export const createRosinBatchSchema = sourceSelectionSchema
    .merge(pressSetupSchema)
    .merge(rosinProcessingSchema)
    .merge(postProcessingSchema)
    .merge(rosinOutputSchema)

export type SourceSelectionInput = z.infer<typeof sourceSelectionSchema>
export type PressSetupInput = z.infer<typeof pressSetupSchema>
export type RosinProcessingInput = z.infer<typeof rosinProcessingSchema>
export type PostProcessingInput = z.infer<typeof postProcessingSchema>
export type RosinOutputInput = z.infer<typeof rosinOutputSchema>
export type CreateRosinBatchInput = z.infer<typeof createRosinBatchSchema>
