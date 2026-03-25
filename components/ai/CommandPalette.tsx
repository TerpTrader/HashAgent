'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import {
    Zap,
    Send,
    ArrowRight,
    Beaker,
    Thermometer,
    Flame,
    BarChart3,
    Wrench,
    X,
    Camera,
} from 'lucide-react'
import { useAICommand } from './AICommandContext'

const QUICK_ACTIONS = [
    { label: 'Start a new wash', icon: Beaker },
    { label: 'Check freeze dryer status', icon: Thermometer },
    { label: 'Log rosin press results', icon: Flame },
    { label: 'Analyze strain yields', icon: BarChart3 },
    { label: 'Log equipment maintenance', icon: Wrench },
]

type ChatImageData = {
    base64: string
    mimeType: string
    preview: string
}

export function CommandPalette() {
    const { isOpen, close, initialQuery, pageContext } = useAICommand()
    const [query, setQuery] = useState('')
    const [chatImage, setChatImage] = useState<ChatImageData | null>(null)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    // Pre-fill with initialQuery when opened with context
    useEffect(() => {
        if (isOpen && initialQuery) {
            setQuery(initialQuery)
        }
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen, initialQuery])

    // Clear query and image on close
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setChatImage(null)
        }
    }, [isOpen])

    function navigateToAI(message?: string) {
        // Store image in sessionStorage for the AI page to pick up
        if (chatImage) {
            try {
                sessionStorage.setItem('hashagent-cmdpal-image', JSON.stringify(chatImage))
            } catch {
                // Storage full — skip image transfer
            }
        }
        const params = new URLSearchParams()
        if (message?.trim()) params.set('q', message.trim())
        if (pageContext) params.set('ctx', pageContext)
        if (chatImage) params.set('hasImage', '1')
        const qs = params.toString()
        router.push(`/ai${qs ? `?${qs}` : ''}`)
        close()
    }

    function handleSubmit() {
        navigateToAI(query)
    }

    function handleChipClick(label: string) {
        navigateToAI(label)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && (query.trim() || chatImage)) {
            e.preventDefault()
            handleSubmit()
        }
    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string
            const base64 = dataUrl.split(',')[1]
            setChatImage({ base64, mimeType: file.type, preview: dataUrl })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) close() }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content
                    className="fixed top-[15%] left-4 right-4 mx-auto max-w-lg z-50 animate-scale-in outline-none lg:left-[calc(240px+1rem)] lg:right-4"
                    onOpenAutoFocus={e => e.preventDefault()}
                    aria-describedby={undefined}
                >
                    <Dialog.Title className="sr-only">Hash Agent AI</Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Quick-launch AI assistant for your hash lab
                    </Dialog.Description>
                    <div className="bg-surface border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
                            <div className="w-7 h-7 rounded-lg bg-primary/[0.13] border border-primary/[0.20] flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-white flex-1">Hash Agent AI</span>
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5">
                                <span>&#8984;</span>K
                            </kbd>
                            <Dialog.Close asChild>
                                <button className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-white hover:bg-white/[0.06] transition-colors bg-transparent border-none cursor-pointer">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {/* Search input */}
                        <div className="p-4 pb-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="rounded-xl bg-surface-card border border-white/[0.1] px-3 py-3 text-muted hover:text-primary hover:border-primary/30 transition-all cursor-pointer shrink-0"
                                    title="Attach image"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={chatImage ? 'Ask about this image...' : 'Ask Hash Agent anything...'}
                                    className="flex-1 bg-surface-card border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>
                            {chatImage && (
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <div className="relative inline-block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={chatImage.preview} alt="Attached" className="w-12 h-12 rounded-lg object-cover border border-white/[0.1]" />
                                        <button
                                            onClick={() => setChatImage(null)}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent-error flex items-center justify-center border-none cursor-pointer hover:bg-red-400"
                                        >
                                            <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-muted">Image attached</span>
                                </div>
                            )}
                            {pageContext && (
                                <p className="text-[10px] text-muted/60 mt-1.5 px-1">
                                    Context: {pageContext}
                                </p>
                            )}
                        </div>

                        {/* Quick actions */}
                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                            {QUICK_ACTIONS.map(action => {
                                const Icon = action.icon
                                return (
                                    <button
                                        key={action.label}
                                        onClick={() => handleChipClick(action.label)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-muted border border-white/[0.08] hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer whitespace-nowrap"
                                    >
                                        <Icon className="w-3 h-3" />
                                        {action.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-white/[0.08] flex items-center justify-between">
                            <button
                                onClick={() => navigateToAI()}
                                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                            >
                                Open full AI Assistant
                                <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!query.trim() && !chatImage}
                                className="flex items-center gap-1.5 rounded-lg bg-primary text-background text-xs font-bold px-4 py-2 shadow-glow hover:shadow-glow-lg hover:bg-primary-light transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none border-none cursor-pointer"
                            >
                                <Send className="w-3 h-3" />
                                Send
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
