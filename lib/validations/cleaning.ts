import { z } from 'zod'

export const cleaningEntrySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    date: z.string().min(1, 'Date is required'),
    equipmentName: z.string().min(1, 'Equipment is required'),
    cleaned: z.boolean().default(false),
    cleanedBy: z.string().optional(),
    verifiedBy: z.string().optional(),
    notes: z.string().optional(),
})

export const createCleaningLogSchema = z.object({
    weekOf: z.string().min(1, 'Week start date is required'),
    entries: z.array(cleaningEntrySchema).optional(),
})

export type CleaningEntryInput = z.infer<typeof cleaningEntrySchema>
export type CreateCleaningLogInput = z.infer<typeof createCleaningLogSchema>
