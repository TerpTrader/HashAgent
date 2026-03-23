import type { DefaultSession, DefaultUser } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: DefaultSession['user'] & {
            id: string
            emailVerified: boolean
            orgId: string | null
            orgName: string | null
            role: string | null
            plan: string | null
        }
        orgId: string | null
        orgName: string | null
        role: string | null
        plan: string | null
        emailVerified: boolean
    }

    interface User extends DefaultUser {
        emailVerified: boolean
        orgId: string | null
        orgName: string | null
        role: string | null
        plan: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        emailVerified?: boolean
        orgId?: string | null
        orgName?: string | null
        role?: string | null
        plan?: string | null
    }
}
