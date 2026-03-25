import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/admin/users — List all users with pagination, search, sort
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_SORT_FIELDS = ['name', 'email', 'createdAt', 'lastLoginAt'] as const
type SortField = (typeof ALLOWED_SORT_FIELDS)[number]

export async function GET(req: NextRequest) {
    const session = await requireAdmin()
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
    const search = searchParams.get('search')?.trim() || undefined
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as SortField
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'

    // Validate sort field
    const validSort = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'

    const where: Record<string, unknown> = {}

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    }

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
        db.user.findMany({
            where,
            orderBy: { [validSort]: sortDir },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                lastLoginAt: true,
                createdAt: true,
                memberships: {
                    include: {
                        org: { select: { id: true, name: true, plan: true } },
                    },
                },
            },
        }),
        db.user.count({ where }),
    ])

    return NextResponse.json({
        data: {
            users,
            total,
            page,
            limit,
        },
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/admin/users — Create a VIP account (User + Org + OrgMember)
// ═══════════════════════════════════════════════════════════════════════════

const createVipSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    orgName: z.string().min(1, 'Organization name is required'),
    plan: z.enum(['HOME', 'PRO', 'COMMERCIAL', 'ENTERPRISE']),
})

export async function POST(req: NextRequest) {
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

    const parsed = createVipSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { name, email, password, orgName, plan } = parsed.data

    // Check for existing user
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user + org + membership in a transaction
    const result = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                hashedPassword,
                emailVerified: new Date(),
                mustChangePassword: true,
            },
        })

        const org = await tx.organization.create({
            data: { name: orgName, plan },
        })

        await tx.orgMember.create({
            data: {
                orgId: org.id,
                userId: user.id,
                role: 'OWNER',
            },
        })

        return { user, org }
    })

    return NextResponse.json(
        {
            data: {
                user: { id: result.user.id, name: result.user.name, email: result.user.email },
                org: { id: result.org.id, name: result.org.name, plan: result.org.plan },
                tempPassword: password,
            },
        },
        { status: 201 }
    )
}
