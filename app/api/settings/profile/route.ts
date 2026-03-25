import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateProfileSchema } from '@/lib/validations/settings'

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/settings/profile — Update current user's profile
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const user = await db.user.update({
        where: { id: session.user.id },
        data: { name: parsed.data.name },
        select: { name: true },
    })

    return NextResponse.json({ data: user })
}
