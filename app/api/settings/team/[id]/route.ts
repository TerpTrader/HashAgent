import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateTeamMemberRoleSchema } from '@/lib/validations/settings'

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/settings/team/[id] — Update a team member's role (OWNER/ADMIN only)
// ═══════════════════════════════════════════════════════════════════════════
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Only owners and admins can change roles' },
            { status: 403 }
        )
    }

    const { id } = await params

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateTeamMemberRoleSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    try {
        // Fetch the member to check constraints
        const member = await db.orgMember.findUnique({
            where: { id },
            select: { userId: true, role: true, orgId: true },
        })

        if (!member || member.orgId !== session.orgId) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Cannot change own role
        if (member.userId === session.user.id) {
            return NextResponse.json(
                { error: 'You cannot change your own role' },
                { status: 400 }
            )
        }

        // If demoting an OWNER, ensure at least one OWNER remains
        if (member.role === 'OWNER' && parsed.data.role !== 'OWNER') {
            const ownerCount = await db.orgMember.count({
                where: { orgId: session.orgId, role: 'OWNER' },
            })
            if (ownerCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot demote the last owner. Transfer ownership first.' },
                    { status: 400 }
                )
            }
        }

        const updated = await db.orgMember.update({
            where: { id },
            data: { role: parsed.data.role },
            select: { role: true },
        })

        return NextResponse.json({ data: updated })
    } catch (error) {
        console.error('Failed to update team member role:', error)
        return NextResponse.json(
            { error: 'Failed to update team member role' },
            { status: 500 }
        )
    }
}
