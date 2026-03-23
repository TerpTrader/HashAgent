import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    orgName: z.string().min(1, 'Organization name is required'),
})

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.errors[0].message },
            { status: 400 },
        )
    }

    const { name, email, password, orgName } = parsed.data

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 409 },
        )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user + org + membership in a transaction
    const result = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                hashedPassword,
                emailVerified: new Date(), // Skip email verification for now
            },
        })

        const org = await tx.organization.create({
            data: { name: orgName, plan: 'HOME' },
        })

        await tx.orgMember.create({
            data: {
                userId: user.id,
                orgId: org.id,
                role: 'OWNER',
            },
        })

        return { userId: user.id, orgId: org.id }
    })

    return NextResponse.json({ data: result }, { status: 201 })
}
