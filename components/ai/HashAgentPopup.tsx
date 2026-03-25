'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Camera, Paperclip, Loader2, Sparkles } from 'lucide-react'
import { MarkdownMessage } from './MarkdownMessage'
import { useAICommand } from './AICommandContext'

type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isError?: boolean
    imagePreview?: string
}

type ChatImageData = {
    base64: string
    mimeType: string
    preview: string
}

const SUGGESTIONS = [
    'Start a new wash',
    'Check freeze dryer status',
    'Show my best yields',
    'Log rosin press',
    'Schedule maintenance',
    'Analyze a strain',
]

export function HashAgentPopup() {
    const { popupOpen, closePopup, pageContext, setPageContext } = useAICommand()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [chatImage, setChatImage] = useState<ChatImageData | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Restore session on mount
    useEffect(() => {
        const saved = localStorage.getItem('hashagent-ai-popup-session')
        if (saved) setSessionId(saved)
    }, [])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input when popup opens
    useEffect(() => {
        if (popupOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [popupOpen])

    const handleImageSelect = useCallback((file: File) => {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string
            const base64 = dataUrl.split(',')[1]
            setChatImage({ base64, mimeType: file.type, preview: dataUrl })
        }
        reader.readAsDataURL(file)
    }, [])

    const handleSend = useCallback(async () => {
        const text = input.trim()
        if (!text && !chatImage) return

        // Prepend page context to the first message if available
        let messageToSend = text || '(image attached)'
        if (pageContext) {
            messageToSend = `[Context: ${pageContext}]\n\n${messageToSend}`
            // Clear context after first use so it doesn't repeat
            setPageContext(null)
        }

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text || '(image attached)',
            timestamp: new Date(),
            imagePreview: chatImage?.preview,
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        const imageToSend = chatImage
        setChatImage(null)
        setIsLoading(true)

        try {
            const reqBody: Record<string, unknown> = {
                message: messageToSend,
            }
            if (sessionId) reqBody.sessionId = sessionId
            if (imageToSend) {
                reqBody.imageBase64 = imageToSend.base64
            }

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Request failed' }))
                throw new Error(errData.message || errData.error || `Error ${res.status}`)
            }

            const data = await res.json()

            if (data.sessionId) {
                setSessionId(data.sessionId)
                localStorage.setItem('hashagent-ai-popup-session', data.sessionId)
            }

            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.message || 'Done!',
                timestamp: new Date(),
            }])
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date(),
                isError: true,
            }])
        } finally {
            setIsLoading(false)
        }
    }, [input, chatImage, sessionId, pageContext, setPageContext])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!popupOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePopup} />

            {/* Chat Panel */}
            <div className="relative w-full md:max-w-lg md:mx-4 h-[85vh] md:h-[70vh] md:rounded-2xl rounded-t-2xl bg-surface border border-white/[0.08] flex flex-col shadow-[0_0_40px_rgba(20,184,166,0.15)] overflow-hidden animate-slide-up md:animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface-card">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Hash Agent AI</h3>
                            <p className="text-[10px] text-muted">Your AI lab assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={closePopup}
                        className="p-2 rounded-lg hover:bg-white/[0.06] text-muted hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                            <Sparkles className="w-10 h-10 text-primary/40" />
                            <div>
                                <p className="text-sm text-white/70 font-medium mb-1">Ask me anything about your lab</p>
                                <p className="text-xs text-muted/60">Log washes, check yields, analyze strains, manage equipment</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-xs">
                                {SUGGESTIONS.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => { setInput(suggestion); inputRef.current?.focus() }}
                                        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                msg.role === 'user'
                                    ? 'bg-primary/20 text-white rounded-br-md'
                                    : msg.isError
                                        ? 'bg-accent-error/10 text-red-300 border border-accent-error/20 rounded-bl-md'
                                        : 'bg-white/[0.04] text-white/90 border border-white/[0.06] rounded-bl-md'
                            }`}>
                                {msg.imagePreview && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={msg.imagePreview}
                                        alt="Attached"
                                        className="rounded-lg mb-2 max-h-40 w-auto"
                                    />
                                )}
                                {msg.role === 'assistant' && !msg.isError ? (
                                    <MarkdownMessage content={msg.content} />
                                ) : (
                                    <p className="whitespace-pre-wrap m-0 leading-relaxed">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Page context indicator */}
                {pageContext && (
                    <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-2">
                        <span className="text-[10px] text-primary/60 flex-1 truncate">
                            Context: {pageContext}
                        </span>
                        <button
                            onClick={() => setPageContext(null)}
                            className="p-0.5 rounded hover:bg-white/10 text-muted/40 bg-transparent border-none cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Image preview */}
                {chatImage && (
                    <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={chatImage.preview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                        <span className="text-xs text-muted flex-1">Image attached</span>
                        <button
                            onClick={() => setChatImage(null)}
                            className="p-1 rounded hover:bg-white/10 text-muted bg-transparent border-none cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Input area */}
                <div className="px-3 py-3 border-t border-white/[0.06] bg-surface-card">
                    <div className="flex items-end gap-2">
                        {/* Camera button */}
                        <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="p-2.5 rounded-xl hover:bg-white/[0.06] text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer shrink-0"
                            title="Take a photo"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                        {/* Attachment button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl hover:bg-white/[0.06] text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer shrink-0"
                            title="Attach an image"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        {/* Hidden file inputs */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleImageSelect(f)
                                e.target.value = ''
                            }}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleImageSelect(f)
                                e.target.value = ''
                            }}
                        />

                        {/* Text input */}
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your lab..."
                            rows={1}
                            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted/50 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                            style={{ maxHeight: '100px' }}
                            onInput={e => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = Math.min(target.scrollHeight, 100) + 'px'
                            }}
                        />

                        {/* Send button */}
                        <button
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && !chatImage)}
                            className="p-2.5 rounded-xl bg-primary text-background font-bold transition-all cursor-pointer border-none shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/80 shadow-glow hover:shadow-glow-lg disabled:shadow-none"
                            title="Send message"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-muted/40">
                        Shift+Enter for new line &middot; Hash Agent may make mistakes
                    </p>
                </div>
            </div>
        </div>
    )
}
