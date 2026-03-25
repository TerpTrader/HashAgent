'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    Beaker,
    Settings,
    Menu,
} from 'lucide-react'
import { useAICommand } from '@/components/ai/AICommandContext'

type MobileTabBarProps = {
    onOpenMenu?: () => void
}

/**
 * Fixed bottom tab bar for mobile. Center button opens Hash Agent AI popup.
 * Mirrors TerpAgent's MobileTabBar pattern with Hash Agent domain tabs.
 */
export function MobileTabBar({ onOpenMenu }: MobileTabBarProps) {
    const pathname = usePathname()
    const { openPopup } = useAICommand()

    function isActive(href: string) {
        return href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname === href || pathname.startsWith(href + '/')
    }

    function TabLink({ href, label, Icon }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }) {
        const active = isActive(href)
        return (
            <Link href={href} className="flex flex-col items-center gap-1 py-2 px-3 no-underline relative flex-1">
                {active && <span className="absolute -top-px left-1/2 -translate-x-1/2 w-7 h-0.5 bg-primary rounded-b" />}
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted'}`} />
                <span className={`text-[9px] font-semibold tracking-wide ${active ? 'text-primary' : 'text-muted/70'}`}>{label}</span>
            </Link>
        )
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-white/[0.06] h-16 bg-background/95 backdrop-blur-md items-center justify-around pb-safe">
            <TabLink href="/dashboard" label="Dashboard" Icon={LayoutDashboard} />
            <TabLink href="/batches" label="Batches" Icon={Beaker} />

            {/* Hash Agent AI — center floating button with logo glow */}
            <button
                onClick={openPopup}
                className="flex flex-col items-center gap-0.5 relative flex-1 bg-transparent border-none cursor-pointer py-1 px-2"
            >
                <div
                    className="flex items-center justify-center"
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(20,184,166,0.6)) drop-shadow(0 0 20px rgba(20,184,166,0.25))',
                    }}
                >
                    <Image
                        src="/logo.png"
                        alt="Hash Agent AI"
                        width={30}
                        height={30}
                        className="flex-shrink-0"
                    />
                </div>
                <span
                    className="text-[9px] font-semibold tracking-wide text-primary whitespace-nowrap"
                    style={{ textShadow: '0 0 8px rgba(20,184,166,0.5)' }}
                >
                    Hash Agent AI
                </span>
            </button>

            <TabLink href="/equipment" label="Equipment" Icon={Settings} />

            {/* Menu button */}
            <button
                onClick={onOpenMenu}
                className="flex flex-col items-center gap-1 py-2 px-3 relative flex-1 bg-transparent border-none cursor-pointer"
            >
                <Menu className="w-5 h-5 text-muted" />
                <span className="text-[9px] font-semibold tracking-wide text-muted/70">Menu</span>
            </button>
        </nav>
    )
}
