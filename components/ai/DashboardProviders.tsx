'use client'

import type { ReactNode } from 'react'
import { AICommandProvider } from './AICommandContext'
import { GlobalAIShortcut } from './GlobalAIShortcut'
import { CommandPalette } from './CommandPalette'
import { HashAgentPopup } from './HashAgentPopup'

/**
 * Wraps the dashboard layout with AI providers and global UI.
 * Mounts Cmd+K shortcut listener, command palette, and chat popup
 * so they're available on every dashboard page.
 */
export function DashboardProviders({ children }: { children: ReactNode }) {
    return (
        <AICommandProvider>
            {children}
            <GlobalAIShortcut />
            <CommandPalette />
            <HashAgentPopup />
        </AICommandProvider>
    )
}
