import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { z } from 'zod'

const TIER_SETTINGS_KEY = 'enabled_tiers'
const ALL_TIERS = ['HOME', 'PRO', 'COMMERCIAL', 'ENTERPRISE'] as const

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/admin/tiers — Get enabled tiers
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
    const session = await requireAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const setting = await db.haAdminSetting.findUnique({
        where: { key: TIER_SETTINGS_KEY },
    })

    // Default: all tiers enabled
    const enabledTiers = setting
        ? (JSON.parse(setting.value) as string[])
        : [...ALL_TIERS]

    return NextResponse.json({
        data: {
            tiers: ALL_TIERS.map((tier) => ({
                name: tier,
                enabled: enabledTiers.includes(tier),
            })),
        },
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/admin/tiers — Toggle a tier on/off
// ═══════════════════════════════════════════════════════════════════════════

const patchSchema = z.object({
    tier: z.enum(ALL_TIERS),
    enabled: z.boolean(),
})

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { tier, enabled } = parsed.data

    // Get current setting
    const existing = await db.haAdminSetting.findUnique({
        where: { key: TIER_SETTINGS_KEY },
    })

    let enabledTiers: string[] = existing
        ? (JSON.parse(existing.value) as string[])
        : [...ALL_TIERS]

    if (enabled && !enabledTiers.includes(tier)) {
        enabledTiers.push(tier)
    } else if (!enabled) {
        // Prevent disabling all tiers — at least one must remain
        const remaining = enabledTiers.filter((t) => t !== tier)
        if (remaining.length === 0) {
            return NextResponse.json(
                { error: 'Cannot disable all tiers. At least one must remain enabled.' },
                { status: 400 }
            )
        }
        enabledTiers = remaining
    }

    await db.haAdminSetting.upsert({
        where: { key: TIER_SETTINGS_KEY },
        create: { key: TIER_SETTINGS_KEY, value: JSON.stringify(enabledTiers) },
        update: { value: JSON.stringify(enabledTiers) },
    })

    return NextResponse.json({
        data: {
            tiers: ALL_TIERS.map((t) => ({
                name: t,
                enabled: enabledTiers.includes(t),
            })),
        },
    })
}
