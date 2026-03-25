'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full"
        >
            <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
                logout
            </span>
            Sign out
        </button>
    )
}
