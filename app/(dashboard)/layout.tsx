import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { MobileNav } from '@/components/shared/MobileNav'
import { MobileTabBar } from '@/components/shared/MobileTabBar'
import { DashboardProviders } from '@/components/ai/DashboardProviders'
import { AINavButton } from '@/components/ai/AINavButton'
import { NavLink } from '@/components/shared/NavLink'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const orgName = session.orgName ?? 'Hash Agent'
    const plan = session.plan ?? 'HOME'
    const userName = session.user.name ?? session.user.email ?? 'User'
    const role = session.role ?? 'VIEWER'

    return (
        <DashboardProviders>
            <div className="flex min-h-screen bg-background">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-sidebar lg:fixed lg:inset-y-0 border-r border-white/5 bg-surface">
                    {/* Logo */}
                    <div className="flex items-center h-topbar px-5 border-b border-white/5">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-white">Hash Agent</span>
                        </Link>
                        <span className="ml-auto text-xs font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                            {plan}
                        </span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        <NavSection title="Operations">
                            <NavLink href="/dashboard" icon="dashboard">Dashboard</NavLink>
                            <NavLink href="/batches" icon="science">Bubble Hash</NavLink>
                            <NavLink href="/rosin" icon="local_fire_department">Rosin</NavLink>
                            <NavLink href="/pressed" icon="compress">Pressed Hash</NavLink>
                        </NavSection>

                        <NavSection title="Equipment">
                            <NavLink href="/freeze-dryers" icon="ac_unit">Freeze Dryers</NavLink>
                            <NavLink href="/equipment" icon="build">Equipment</NavLink>
                            <NavLink href="/maintenance" icon="engineering">Maintenance</NavLink>
                            <NavLink href="/cleaning" icon="cleaning_services">Cleaning Logs</NavLink>
                        </NavSection>

                        <NavSection title="Intelligence">
                            {/* Teal-glowing AI button — opens popup instead of navigating */}
                            <AINavButton />
                            <NavLink href="/analytics" icon="analytics">Analytics</NavLink>
                            <NavLink href="/compliance" icon="verified">Compliance</NavLink>
                        </NavSection>
                    </nav>

                    {/* User info */}
                    <div className="border-t border-white/5 px-4 py-3">
                        <p className="text-sm font-medium text-white truncate">{userName}</p>
                        <p className="text-xs text-muted truncate">{orgName} &middot; {role}</p>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 lg:pl-sidebar min-w-0">
                    {/* Top bar */}
                    <header className="sticky top-0 z-30 flex items-center h-topbar px-4 lg:px-6 border-b border-white/5 bg-background/80 backdrop-blur-md">
                        {/* Mobile menu button */}
                        <MobileNav
                            userName={userName}
                            orgName={orgName}
                            role={role}
                            plan={plan}
                        />

                        {/* Desktop: logo area is in sidebar, so just spacer */}
                        <div className="flex-1 lg:hidden">
                            <span className="text-base font-semibold text-white">Hash Agent</span>
                        </div>
                        <div className="hidden lg:block flex-1" />
                    </header>

                    {/* Page content — extra bottom padding on mobile for tab bar */}
                    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
                        {children}
                    </div>
                </main>

                {/* Mobile bottom tab bar */}
                <MobileTabBar />
            </div>
        </DashboardProviders>
    )
}

// ─── Helper components ────────────────────────────────────────────────────

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted/50">
                {title}
            </p>
            {children}
        </div>
    )
}

