import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updatePasswordSchema } from '@/lib/validations/settings'
import bcrypt from 'bcryptjs'

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/settings/password — Change current user's password
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updatePasswordSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { currentPassword, newPassword } = parsed.data

    // Fetch current hashed password
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { hashedPassword: true },
    })

    if (!user?.hashedPassword) {
        return NextResponse.json(
            { error: 'No password set for this account' },
            { status: 400 }
        )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.hashedPassword)
    if (!isValid) {
        return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
        )
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.user.update({
        where: { id: session.user.id },
        data: { hashedPassword },
    })

    return NextResponse.json({ data: { success: true } })
}
