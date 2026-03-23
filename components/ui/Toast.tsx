'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { ToastVariant } from '@/lib/hooks/useToast'

const VARIANT_STYLES: Record<ToastVariant, string> = {
    default: 'border-white/10 bg-surface-elevated',
    success: 'border-hash-complete/20 bg-hash-complete/10',
    error: 'border-accent-error/20 bg-accent-error/10',
}

export function ToastItem({
    title,
    description,
    variant = 'default',
    onClose,
}: {
    title: string
    description?: string
    variant?: ToastVariant
    onClose: () => void
}) {
    return (
        <ToastPrimitive.Root
            className={cn(
                'rounded-xl border px-4 py-3 shadow-panel animate-slide-up',
                VARIANT_STYLES[variant]
            )}
            onOpenChange={(open) => { if (!open) onClose() }}
            duration={4000}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <ToastPrimitive.Title className="text-sm font-medium text-white">
                        {title}
                    </ToastPrimitive.Title>
                    {description && (
                        <ToastPrimitive.Description className="mt-1 text-xs text-muted">
                            {description}
                        </ToastPrimitive.Description>
                    )}
                </div>
                <ToastPrimitive.Close className="text-muted hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                </ToastPrimitive.Close>
            </div>
        </ToastPrimitive.Root>
    )
}
