import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/admin/check — Check if current user is a platform admin
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: isAdminEmail(session.user.email) })
}
