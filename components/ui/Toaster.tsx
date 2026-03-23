'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { useToast } from '@/lib/hooks/useToast'
import { ToastItem } from '@/components/ui/Toast'

export function Toaster() {
    const { toasts, dismissToast } = useToast()

    return (
        <ToastPrimitive.Provider swipeDirection="right">
            {toasts.map((t) => (
                <ToastItem
                    key={t.id}
                    title={t.title}
                    description={t.description}
                    variant={t.variant}
                    onClose={() => dismissToast(t.id)}
                />
            ))}
            <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" />
        </ToastPrimitive.Provider>
    )
}
