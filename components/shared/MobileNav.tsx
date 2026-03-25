'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { NavLink } from '@/components/shared/NavLink'

type Props = {
    userName: string
    orgName: string
    role: string
    plan: string
}

const NAV_ITEMS = [
    { section: 'Operations', items: [
        { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { href: '/batches', icon: 'science', label: 'Bubble Hash' },
        { href: '/rosin', icon: 'local_fire_department', label: 'Rosin' },
        { href: '/pressed', icon: 'compress', label: 'Pressed Hash' },
    ]},
    { section: 'Equipment', items: [
        { href: '/freeze-dryers', icon: 'ac_unit', label: 'Freeze Dryers' },
        { href: '/equipment', icon: 'build', label: 'Equipment' },
        { href: '/maintenance', icon: 'engineering', label: 'Maintenance' },
        { href: '/cleaning', icon: 'cleaning_services', label: 'Cleaning Logs' },
    ]},
    { section: 'Intelligence', items: [
        // AI Assistant moved to bottom tab bar and sidebar glow button
        { href: '/analytics', icon: 'analytics', label: 'Analytics' },
        { href: '/compliance', icon: 'verified', label: 'Compliance' },
    ]},
    { section: 'Account', items: [
        { href: '/settings', icon: 'settings', label: 'Settings' },
    ]},
]

export function MobileNav({ userName, orgName, role, plan }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Hamburger button — only shows on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden -ml-1 mr-3 p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Open navigation"
            >
                <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                    menu
                </span>
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-white/5 transform transition-transform duration-200 ease-out lg:hidden ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white">Hash Agent</span>
                        <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded">
                            {plan}
                        </span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                            close
                        </span>
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-3">
                    {NAV_ITEMS.map((section) => (
                        <div key={section.section} className="space-y-0.5">
                            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted/50">
                                {section.section}
                            </p>
                            {section.items.map((item) => (
                                <div key={item.href} onClick={() => setOpen(false)}>
                                    <NavLink href={item.href} icon={item.icon}>
                                        {item.label}
                                    </NavLink>
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User info + Sign out */}
                <div className="border-t border-white/5 px-4 py-3 space-y-3">
                    <div>
                        <p className="text-sm font-medium text-white truncate">{userName}</p>
                        <p className="text-xs text-muted truncate">{orgName} &middot; {role}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                            logout
                        </span>
                        Sign out
                    </button>
                </div>
            </div>
        </>
    )
}
