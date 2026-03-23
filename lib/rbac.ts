// ═══════════════════════════════════════════════════════════════════════════
// HASH AGENT — ROLE-BASED ACCESS CONTROL
// Two-dimensional: OrgRole × Plan
// ═══════════════════════════════════════════════════════════════════════════

type OrgRole = 'OWNER' | 'ADMIN' | 'GROWER' | 'VIEWER'

// Note: In the Hash Agent UI, GROWER role is displayed as "Processor"
// but the underlying enum remains GROWER for shared-auth compatibility

// ─── Role-based permissions ───────────────────────────────────────────────

const WRITE_ROLES: OrgRole[] = ['OWNER', 'ADMIN', 'GROWER']
const ADMIN_ROLES: OrgRole[] = ['OWNER', 'ADMIN']

export function canCreateBatch(role: OrgRole | null): boolean {
    return role != null && WRITE_ROLES.includes(role)
}

export function canEditBatch(role: OrgRole | null): boolean {
    return role != null && WRITE_ROLES.includes(role)
}

export function canDeleteBatch(role: OrgRole | null): boolean {
    return role != null && ADMIN_ROLES.includes(role)
}

export function canApproveBatch(role: OrgRole | null): boolean {
    return role != null && ADMIN_ROLES.includes(role)
}

export function canControlEquipment(role: OrgRole | null): boolean {
    // Processors (GROWER) can control freeze dryers during batch cycles
    return role != null && WRITE_ROLES.includes(role)
}

export function canManageEquipment(role: OrgRole | null): boolean {
    // Only admins can add/remove/configure equipment
    return role != null && ADMIN_ROLES.includes(role)
}

export function canLogMaintenance(role: OrgRole | null): boolean {
    return role != null && WRITE_ROLES.includes(role)
}

export function canExportCompliance(role: OrgRole | null): boolean {
    return role != null && ADMIN_ROLES.includes(role)
}

export function canManageTeam(role: OrgRole | null): boolean {
    return role != null && ADMIN_ROLES.includes(role)
}

export function canManageOrgSettings(role: OrgRole | null): boolean {
    return role === 'OWNER'
}

export function canManageBilling(role: OrgRole | null): boolean {
    return role === 'OWNER'
}

export function canUseAI(role: OrgRole | null): boolean {
    // Everyone except viewer can use the AI assistant
    return role != null && role !== 'VIEWER'
}

export function canViewAnalytics(role: OrgRole | null): boolean {
    // All authenticated roles can view analytics
    return role != null
}

// ─── Composite permission builder ─────────────────────────────────────────

export function getPermissions(role: OrgRole | null) {
    return {
        createBatch: canCreateBatch(role),
        editBatch: canEditBatch(role),
        deleteBatch: canDeleteBatch(role),
        approveBatch: canApproveBatch(role),
        controlEquipment: canControlEquipment(role),
        manageEquipment: canManageEquipment(role),
        logMaintenance: canLogMaintenance(role),
        exportCompliance: canExportCompliance(role),
        manageTeam: canManageTeam(role),
        manageOrgSettings: canManageOrgSettings(role),
        manageBilling: canManageBilling(role),
        useAI: canUseAI(role),
        viewAnalytics: canViewAnalytics(role),
    }
}
