'use client'

import { useRef, useState } from 'react'
import { Camera, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CameraCaptureProps {
    onCapture: (file: File) => void
    label?: string
    disabled?: boolean
}

export function CameraCapture({ onCapture, label = 'Capture', disabled = false }: CameraCaptureProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)

    function handleClick() {
        if (disabled) return
        inputRef.current?.click()
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        onCapture(file)

        // Reset input so the same file can be re-selected
        e.target.value = ''
    }

    function handleRetake() {
        setPreview(null)
        inputRef.current?.click()
    }

    return (
        <div className="flex items-center gap-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
                className="hidden"
                aria-label={label}
            />

            {preview ? (
                <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Captured"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRetake}
                        disabled={disabled}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                            'bg-white/5 text-muted hover:bg-white/10 hover:text-white',
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Retake
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled}
                    className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        'bg-white/5 text-muted hover:bg-white/10 hover:text-white',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <Camera className="h-3.5 w-3.5" />
                    {label}
                </button>
            )}
        </div>
    )
}
