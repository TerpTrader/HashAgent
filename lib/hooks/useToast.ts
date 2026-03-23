import { useState, useCallback, useEffect } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'

export interface Toast {
    id: string
    title: string
    description?: string
    variant: ToastVariant
}

let listeners: Array<(toast: Toast) => void> = []

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
    const t: Toast = { id: Date.now().toString(), title, description, variant }
    listeners.forEach((fn) => fn(t))
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((t: Toast) => {
        setToasts((prev) => [...prev, t])
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    useEffect(() => {
        listeners.push(addToast)
        return () => {
            listeners = listeners.filter((fn) => fn !== addToast)
        }
    }, [addToast])

    return { toasts, dismissToast }
}
