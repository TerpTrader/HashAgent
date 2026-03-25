'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Send, Camera, Loader2 } from 'lucide-react'
import { MarkdownMessage } from './MarkdownMessage'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    imagePreview?: string
}

interface HashAgentChatProps {
    suggestedPrompts?: string[]
}

export function HashAgentChat({ suggestedPrompts }: HashAgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [pendingImage, setPendingImage] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    async function sendMessage(text: string, imageBase64?: string | null) {
        if (!text.trim() && !imageBase64) return
        if (isLoading) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            imagePreview: imagePreview ?? undefined,
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setPendingImage(null)
        setImagePreview(null)
        setIsLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    sessionId,
                    imageBase64: imageBase64 ?? undefined,
                }),
            })

            const json = await res.json()

            if (json.sessionId && !sessionId) {
                setSessionId(json.sessionId)
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: json.message ?? json.error ?? 'No response',
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: 'Network error. Please check your connection and try again.',
                },
            ])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input, pendingImage)
        }
    }

    function handleCameraClick() {
        fileInputRef.current?.click()
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            const dataUrl = reader.result as string
            setImagePreview(dataUrl)
            setPendingImage(dataUrl.split(',')[1])
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    function handleSuggestedPrompt(prompt: string) {
        sendMessage(prompt)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-white/5 bg-surface-card">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <span className="material-symbols-outlined text-3xl text-primary">smart_toy</span>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-white">Hash Agent AI</h3>
                        <p className="mt-1 text-sm text-muted text-center max-w-md">
                            Your intelligent lab assistant. Ask me to log washes, check yields,
                            monitor freeze dryers, or analyze strain performance.
                        </p>

                        {/* Suggested Prompts */}
                        {suggestedPrompts && suggestedPrompts.length > 0 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedPrompt(prompt)}
                                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-white/20 hover:text-white"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex animate-fade-in',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[80%] rounded-xl px-4 py-3 text-sm',
                                msg.role === 'user'
                                    ? 'bg-primary/10 text-white'
                                    : 'bg-surface-card border border-white/5 text-white'
                            )}
                        >
                            {msg.imagePreview && (
                                <div className="mb-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={msg.imagePreview}
                                        alt="Scale photo"
                                        className="max-h-32 rounded-lg border border-white/10"
                                    />
                                </div>
                            )}

                            {msg.role === 'assistant' ? (
                                <MarkdownMessage content={msg.content} />
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-surface-card px-4 py-3 text-sm text-muted">
                            <div className="flex gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                            </div>
                            <span className="text-xs">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="border-t border-white/5 px-4 py-2">
                    <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                        />
                        <button
                            onClick={() => { setPendingImage(null); setImagePreview(null) }}
                            className="text-xs text-muted hover:text-white transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-white/5 p-4">
                <div className="flex items-end gap-2">
                    {/* Camera button */}
                    <button
                        type="button"
                        onClick={handleCameraClick}
                        disabled={isLoading}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <Camera className="h-4 w-4" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Text input */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Hash Agent anything..."
                        rows={1}
                        disabled={isLoading}
                        className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        style={{ maxHeight: '120px' }}
                        onInput={e => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = 'auto'
                            target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                        }}
                    />

                    {/* Send button */}
                    <button
                        type="button"
                        onClick={() => sendMessage(input, pendingImage)}
                        disabled={isLoading || (!input.trim() && !pendingImage)}
                        className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                            input.trim() || pendingImage
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : 'bg-white/5 text-muted/40 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-muted/40">
                    Shift+Enter for new line &middot; Hash Agent may make mistakes
                </p>
            </div>
        </div>
    )
}
