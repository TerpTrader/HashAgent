'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type AICommandContextType = {
    /** Whether the Cmd+K command palette is open */
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
    /** Whether the chat popup panel is open */
    popupOpen: boolean
    openPopup: () => void
    closePopup: () => void
    /** Pre-filled query for the command palette */
    initialQuery: string
    setInitialQuery: (q: string) => void
    /** Page context injected from entity pages (batch detail, freeze dryer, etc.) */
    pageContext: string | null
    setPageContext: (ctx: string | null) => void
}

const AICommandContext = createContext<AICommandContextType | null>(null)

export function AICommandProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [popupOpen, setPopupOpen] = useState(false)
    const [initialQuery, setInitialQuery] = useState('')
    const [pageContext, setPageContext] = useState<string | null>(null)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => {
        setIsOpen(false)
        setInitialQuery('')
    }, [])
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])

    const openPopup = useCallback(() => setPopupOpen(true), [])
    const closePopup = useCallback(() => {
        setPopupOpen(false)
        setPageContext(null)
    }, [])

    return (
        <AICommandContext.Provider
            value={{
                isOpen, open, close, toggle,
                popupOpen, openPopup, closePopup,
                initialQuery, setInitialQuery,
                pageContext, setPageContext,
            }}
        >
            {children}
        </AICommandContext.Provider>
    )
}

export function useAICommand() {
    const ctx = useContext(AICommandContext)
    if (!ctx) throw new Error('useAICommand must be used within AICommandProvider')
    return ctx
}
