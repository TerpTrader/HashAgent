import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    // @auth/prisma-adapter and next-auth depend on different @auth/core versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(db) as any,
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data

                const user = await db.user.findUnique({
                    where: { email },
                    include: {
                        memberships: {
                            include: {
                                org: { select: { id: true, name: true, plan: true } },
                            },
                            take: 1,
                        },
                    },
                })

                if (!user?.hashedPassword) return null

                const isValid = await bcrypt.compare(password, user.hashedPassword)
                if (!isValid) return null

                // Track last login (fire-and-forget)
                db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {})

                const membership = user.memberships[0]

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: !!user.emailVerified,
                    orgId: membership?.orgId ?? null,
                    orgName: membership?.org.name ?? null,
                    role: membership?.role ?? null,
                    plan: membership?.org.plan ?? null,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.emailVerified = !!user.emailVerified
                token.orgId = user.orgId
                token.orgName = user.orgName
                token.role = user.role
                token.plan = user.plan
            }

            // Refresh plan from DB on every token refresh
            if (token.orgId && typeof token.orgId === 'string') {
                try {
                    const org = await db.organization.findUnique({
                        where: { id: token.orgId },
                        select: { plan: true },
                    })
                    if (org) {
                        token.plan = org.plan
                    }
                } catch {
                    // Fall back to cached token value
                }
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.emailVerified = token.emailVerified ?? false
                session.orgId = token.orgId ?? null
                session.orgName = token.orgName ?? null
                session.role = token.role ?? null
                session.plan = token.plan ?? null
            }
            return session
        },
    },
})
