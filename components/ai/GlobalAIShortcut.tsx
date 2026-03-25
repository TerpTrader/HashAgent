'use client'

import { useEffect } from 'react'
import { useAICommand } from './AICommandContext'

export function GlobalAIShortcut() {
    const { toggle } = useAICommand()

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                toggle()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [toggle])

    return null
}
