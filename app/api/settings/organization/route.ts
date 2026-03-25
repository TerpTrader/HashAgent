import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateOrganizationSchema } from '@/lib/validations/settings'

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/settings/organization — Update organization name (OWNER only)
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'OWNER') {
        return NextResponse.json(
            { error: 'Only the organization owner can update this' },
            { status: 403 }
        )
    }

    const body = await req.json()
    const parsed = updateOrganizationSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const org = await db.organization.update({
        where: { id: session.orgId },
        data: { name: parsed.data.name },
        select: { name: true },
    })

    return NextResponse.json({ data: org })
}
