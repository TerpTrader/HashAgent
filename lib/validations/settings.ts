import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS — Zod validation schemas
// ═══════════════════════════════════════════════════════════════════════════

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
})

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long'),
})

export const updateOrganizationSchema = z.object({
    name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
})

export const inviteTeamMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'GROWER', 'VIEWER'], {
        errorMap: () => ({ message: 'Invalid role' }),
    }),
})

export const removeTeamMemberSchema = z.object({
    memberId: z.string().uuid('Invalid member ID'),
})

export const updateTeamMemberRoleSchema = z.object({
    role: z.enum(['OWNER', 'ADMIN', 'GROWER', 'VIEWER'], {
        errorMap: () => ({ message: 'Invalid role' }),
    }),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>
export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>
