'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavLinkProps {
    href: string
    icon: string
    children: React.ReactNode
}

export function NavLink({ href, icon, children }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(href)

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group',
                isActive
                    ? 'bg-primary/10 text-white'
                    : 'text-muted hover:text-white hover:bg-white/5'
            )}
        >
            <span
                className={cn(
                    'material-symbols-outlined text-[20px] transition-colors',
                    isActive
                        ? 'text-primary'
                        : 'text-muted/70 group-hover:text-white'
                )}
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 400 : 300}, 'opsz' 20` }}
            >
                {icon}
            </span>
            {children}
        </Link>
    )
}
