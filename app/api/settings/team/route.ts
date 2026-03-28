import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { inviteTeamMemberSchema, removeTeamMemberSchema } from '@/lib/validations/settings'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/settings/team — List all org members
// ═══════════════════════════════════════════════════════════════════════════
export async function GET() {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const members = await db.orgMember.findMany({
            where: { orgId: session.orgId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { user: { createdAt: 'asc' } },
        })

        return NextResponse.json({ data: members })
    } catch (error) {
        console.error('Failed to fetch team members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch team members' },
            { status: 500 }
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/settings/team — Add a member to the org (OWNER/ADMIN only)
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Only owners and admins can add team members' },
            { status: 403 }
        )
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = inviteTeamMemberSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { email, role } = parsed.data

    try {
        // Find user by email
        const user = await db.user.findUnique({
            where: { email },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. They must register first.' },
                { status: 404 }
            )
        }

        // Check if already a member
        const existing = await db.orgMember.findUnique({
            where: { orgId_userId: { orgId: session.orgId, userId: user.id } },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'This user is already a member of your organization' },
                { status: 409 }
            )
        }

        const member = await db.orgMember.create({
            data: {
                orgId: session.orgId,
                userId: user.id,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        })

        return NextResponse.json({ data: member }, { status: 201 })
    } catch (error) {
        console.error('Failed to add team member:', error)
        return NextResponse.json(
            { error: 'Failed to add team member' },
            { status: 500 }
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/settings/team — Remove a member from the org (OWNER/ADMIN only)
// ═══════════════════════════════════════════════════════════════════════════
export async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Only owners and admins can remove team members' },
            { status: 403 }
        )
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = removeTeamMemberSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { memberId } = parsed.data

    try {
        // Fetch the member to check constraints
        const member = await db.orgMember.findUnique({
            where: { id: memberId },
            select: { userId: true, role: true, orgId: true },
        })

        if (!member || member.orgId !== session.orgId) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Cannot remove yourself
        if (member.userId === session.user.id) {
            return NextResponse.json(
                { error: 'You cannot remove yourself from the organization' },
                { status: 400 }
            )
        }

        // Cannot remove the last OWNER
        if (member.role === 'OWNER') {
            const ownerCount = await db.orgMember.count({
                where: { orgId: session.orgId, role: 'OWNER' },
            })
            if (ownerCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot remove the last owner. Transfer ownership first.' },
                    { status: 400 }
                )
            }
        }

        await db.orgMember.delete({ where: { id: memberId } })

        return NextResponse.json({ data: { success: true } })
    } catch (error) {
        console.error('Failed to remove team member:', error)
        return NextResponse.json(
            { error: 'Failed to remove team member' },
            { status: 500 }
        )
    }
}
