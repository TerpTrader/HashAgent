import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export const metadata = {
    title: 'Settings',
}

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id || !session?.orgId) redirect('/login')

    // Fetch user + org data in parallel for the settings page
    const [user, org] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                lastLoginAt: true,
            },
        }),
        db.organization.findUnique({
            where: { id: session.orgId },
            select: {
                name: true,
                plan: true,
                _count: { select: { members: true } },
            },
        }),
    ])

    if (!user || !org) redirect('/login')

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Settings</h1>
                <p className="mt-1 text-sm text-muted">
                    Manage your account, organization, and preferences
                </p>
            </div>

            {/* Tabs */}
            <SettingsTabs
                user={{
                    id: user.id,
                    name: user.name ?? '',
                    email: user.email,
                    createdAt: user.createdAt.toISOString(),
                    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
                }}
                org={{
                    name: org.name,
                    plan: org.plan,
                    memberCount: org._count.members,
                }}
                role={session.role ?? 'VIEWER'}
            />
        </div>
    )
}
