'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Building2,
    BarChart3,
    Shield,
    ArrowLeft,
    Menu,
    X,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

type AdminShellProps = {
    userName: string
    userEmail: string
    children: React.ReactNode
}

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Users', icon: Users, exact: false },
    { href: '/admin/users/create', label: 'Create VIP', icon: UserPlus, exact: true },
    { href: '/admin/organizations', label: 'Organizations', icon: Building2, exact: false },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, exact: false },
] as const

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
    })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
    if (typeof window === 'undefined') return makeQueryClient()
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
}

export function AdminShell({ userName, userEmail, children }: AdminShellProps) {
    const pathname = usePathname()
    const queryClient = getQueryClient()
    const [mobileOpen, setMobileOpen] = useState(false)

    function isActive(href: string, exact?: boolean) {
        if (exact) return pathname === href
        return pathname === href || pathname.startsWith(href + '/')
    }

    const sidebar = (
        <>
            {/* Logo + badge */}
            <div className="flex items-center gap-2 px-5 h-14 border-b border-white/[0.06]">
                <Logo size="sm" />
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    <Shield className="w-3 h-3" />
                    Admin
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact)
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-white/[0.06] text-white'
                                    : 'text-[#9ca3af] hover:text-white hover:bg-white/[0.03]'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom: user info + back */}
            <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
                <div>
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-muted truncate">{userEmail}</p>
                </div>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to App
                </Link>
            </div>
        </>
    )

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen bg-[#050505]">
                {/* Desktop sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-[#111111] border-r border-white/[0.06]">
                    {sidebar}
                </aside>

                {/* Mobile sidebar overlay */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside className="relative flex flex-col w-56 h-full bg-[#111111] border-r border-white/[0.06]">
                            {sidebar}
                        </aside>
                    </div>
                )}

                {/* Main content */}
                <div className="flex-1 lg:pl-56 min-w-0">
                    {/* Mobile top bar */}
                    <header className="sticky top-0 z-30 flex items-center h-14 px-4 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-md lg:hidden">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="ml-3 text-sm font-semibold text-white">Platform Admin</span>
                    </header>

                    <main className="p-4 lg:p-6">{children}</main>
                </div>
            </div>
        </QueryClientProvider>
    )
}
