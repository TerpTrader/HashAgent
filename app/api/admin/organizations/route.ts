import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/admin/organizations — List all orgs with pagination & search
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_SORT_FIELDS = ['name', 'createdAt', 'plan'] as const
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

    const validSort = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'

    const where: Record<string, unknown> = {}

    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    const skip = (page - 1) * limit

    try {
        const [organizations, total] = await Promise.all([
            db.organization.findMany({
                where,
                orderBy: { [validSort]: sortDir },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    plan: true,
                    createdAt: true,
                    _count: {
                        select: {
                            members: true,
                            hashBatches: true,
                            rosinBatches: true,
                            pressedBatches: true,
                        },
                    },
                },
            }),
            db.organization.count({ where }),
        ])

        return NextResponse.json({
            data: {
                organizations,
                total,
                page,
                limit,
            },
        })
    } catch (error) {
        console.error('Failed to fetch organizations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        )
    }
}
