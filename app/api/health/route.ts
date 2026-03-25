import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    const checks: Record<string, string> = {
        DATABASE_URL: process.env.DATABASE_URL
            ? (() => {
                try {
                    const u = new URL(process.env.DATABASE_URL)
                    return `user=${u.username} host=${u.hostname} port=${u.port} db=${u.pathname}`
                } catch { return 'SET but unparseable' }
            })()
            : 'MISSING',
        DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? 'NOT SET',
    }

    try {
        const result = await db.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`
        checks.db_connection = 'OK — ' + String(result[0]?.now)

        const userCount = await db.user.count()
        checks.user_count = String(userCount)
    } catch (err) {
        checks.db_connection = 'FAILED: ' + (err instanceof Error ? err.message : String(err))
    }

    return NextResponse.json(checks)
}
