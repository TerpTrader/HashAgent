import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

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
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-sidebar lg:fixed lg:inset-y-0 border-r border-white/5 bg-surface">
                {/* Logo */}
                <div className="flex items-center h-topbar px-6 border-b border-white/5">
                    <span className="text-lg font-semibold text-white">
                        Hash Agent
                    </span>
                    <span className="ml-2 text-xs font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded">
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
                        <NavLink href="/ai" icon="smart_toy">AI Assistant</NavLink>
                        <NavLink href="/analytics" icon="analytics">Analytics</NavLink>
                        <NavLink href="/compliance" icon="verified">Compliance</NavLink>
                    </NavSection>

                    <NavSection title="Admin">
                        <NavLink href="/settings" icon="settings">Settings</NavLink>
                    </NavSection>
                </nav>

                {/* User info */}
                <div className="border-t border-white/5 px-4 py-3">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-muted truncate">{orgName} &middot; {role}</p>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 lg:pl-sidebar">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center h-topbar px-6 border-b border-white/5 bg-background/80 backdrop-blur-md">
                    <div className="flex-1" />
                    {/* Cmd+K shortcut hint */}
                    <kbd className="hidden sm:inline-flex items-center gap-1 text-xs text-muted border border-white/10 rounded px-2 py-1">
                        <span className="text-[10px]">⌘</span>K
                    </kbd>
                </header>

                {/* Page content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

// ─── Helper components ────────────────────────────────────────────────────

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                {title}
            </p>
            {children}
        </div>
    )
}

function NavLink({
    href,
    icon,
    children,
}: {
    href: string
    icon: string
    children: React.ReactNode
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                {icon}
            </span>
            {children}
        </a>
    )
}
