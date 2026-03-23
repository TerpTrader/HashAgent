import { z } from 'zod'

export const createPressedBatchSchema = z.object({
    sourceHashBatchId: z.string().min(1, 'Select a source hash batch'),
    strain: z.string().optional(),
    batchNumber: z.string().min(1, 'Batch number is required'),
    pressDate: z.string().min(1, 'Press date is required'),
    micronsUsed: z.string().optional(),
    inputWeightG: z.number().positive('Input weight must be > 0'),
    finalWeightG: z.number().min(0).optional(),
    notes: z.string().optional(),
    metrcUid: z.string().optional(),
    processedBy: z.string().optional(),
    verifiedBy: z.string().optional(),
})

export type CreatePressedBatchInput = z.infer<typeof createPressedBatchSchema>
