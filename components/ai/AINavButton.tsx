'use client'

import Image from 'next/image'
import { useAICommand } from './AICommandContext'

/**
 * Teal-glowing AI button for the desktop sidebar.
 * Opens the HashAgentPopup instead of navigating to /ai.
 * Visually distinct from regular NavLinks — this is THE primary AI entry point.
 */
export function AINavButton() {
    const { openPopup } = useAICommand()

    return (
        <button
            onClick={openPopup}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg transition-all hover:bg-primary/15 hover:border-primary/30 hover:shadow-glow animate-glow-pulse cursor-pointer group"
        >
            <Image
                src="/logo.png"
                alt="Hash Agent AI"
                width={20}
                height={20}
                className="flex-shrink-0"
                style={{ filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.5))' }}
            />
            Hash Agent AI
        </button>
    )
}
