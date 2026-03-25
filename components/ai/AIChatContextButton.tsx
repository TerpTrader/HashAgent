'use client'

import { Sparkles } from 'lucide-react'
import { useAICommand } from './AICommandContext'

type AIChatContextButtonProps = {
    /** Context string describing the current entity (batch, run, equipment, etc.) */
    context: string
    /** Optional label override — defaults to "Ask Hash Agent" */
    label?: string
    /** Optional: compact mode for inline use in data grids */
    compact?: boolean
}

/**
 * Inline button placed on entity detail pages (batch, rosin, freeze dryer).
 * Opens the HashAgentPopup with the entity context pre-injected so Gemini
 * can give contextual answers about that specific batch/equipment/run.
 */
export function AIChatContextButton({ context, label = 'Ask Hash Agent', compact = false }: AIChatContextButtonProps) {
    const { setPageContext, openPopup } = useAICommand()

    function handleClick() {
        setPageContext(context)
        openPopup()
    }

    if (compact) {
        return (
            <button
                onClick={handleClick}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all bg-transparent cursor-pointer"
                title={label}
            >
                <Sparkles className="w-3 h-3" />
                AI
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 hover:border-primary/30 hover:shadow-glow-sm transition-all cursor-pointer"
        >
            <Sparkles className="w-3.5 h-3.5" />
            {label}
        </button>
    )
}
