import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, SprayCan } from 'lucide-react'
import { CleaningLogCard } from '@/components/cleaning/CleaningLogCard'

export const metadata = {
    title: 'Cleaning Logs',
}

export default async function CleaningLogsPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const logs = await db.haCleaningLog.findMany({
        where: { orgId: session.orgId },
        orderBy: { weekOf: 'desc' },
        include: {
            entries: {
                select: { id: true, cleaned: true },
            },
        },
        take: 50,
    })

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Cleaning Logs</h1>
                    <p className="mt-1 text-sm text-muted">
                        {logs.length} log{logs.length !== 1 ? 's' : ''} recorded
                    </p>
                </div>

                <Link
                    href="/cleaning/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Log
                </Link>
            </div>

            {/* Log Grid or Empty State */}
            {logs.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {logs.map((log) => {
                        const entryCount = log.entries.length
                        const completedCount = log.entries.filter((e) => e.cleaned).length

                        return (
                            <CleaningLogCard
                                key={log.id}
                                id={log.id}
                                logNumber={log.logNumber}
                                weekOf={log.weekOf.toISOString()}
                                entryCount={entryCount}
                                completedCount={completedCount}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <SprayCan className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No cleaning logs yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Track weekly equipment cleaning. Create a log to start recording
                        cleaning verification for your wash and press equipment.
                    </p>
                    <Link
                        href="/cleaning/new"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        Create First Log
                    </Link>
                </div>
            )}
        </div>
    )
}
