import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE LOG — VALIDATION SCHEMA
// Used by both the API route and the MaintenanceWizard form steps
// ═══════════════════════════════════════════════════════════════════════════

export const createMaintenanceLogSchema = z.object({
    category: z.enum(['FREEZE_DRYER', 'WATER_FILTRATION', 'RO_SYSTEM', 'PRESS', 'WASH_TANK', 'GENERAL']),
    equipmentId: z.string().min(1, 'Select equipment'),
    equipmentType: z.string().min(1),
    equipmentName: z.string().min(1),
    date: z.string().min(1, 'Date is required'),
    description: z.string().min(1, 'Description is required'),
    actionsTaken: z.string().optional(),
    partsReplaced: z.string().optional(),
    performedBy: z.string().min(1, 'Performed by is required'),
    verifiedBy: z.string().optional(),
    nextDueDate: z.string().optional(),
    notes: z.string().optional(),
})

export type CreateMaintenanceLogInput = z.infer<typeof createMaintenanceLogSchema>
