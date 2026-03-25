import { auth } from '@/lib/auth'

/**
 * Platform admin guard — uses an allowlist of email addresses
 * defined in the ADMIN_EMAILS environment variable (comma-separated).
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

export function isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Server-side guard: returns the session if the caller is a platform admin,
 * or null if unauthenticated / not an admin.
 */
export async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.email) return null
    if (!isAdminEmail(session.user.email)) return null
    return session
}
