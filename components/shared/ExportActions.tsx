'use client'

import { useState } from 'react'
import { FileDown, Printer, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ExportActionsProps = {
    pdfUrl: string
    filename: string
}

export function ExportActions({ pdfUrl, filename }: ExportActionsProps) {
    const [downloading, setDownloading] = useState(false)

    async function handleDownload() {
        setDownloading(true)
        try {
            const res = await fetch(pdfUrl)
            if (!res.ok) throw new Error('PDF generation failed')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('PDF download failed:', err)
        } finally {
            setDownloading(false)
        }
    }

    function handlePrint() {
        // Open PDF in new tab for printing
        window.open(pdfUrl, '_blank')
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                    'flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10',
                    downloading && 'opacity-50 cursor-wait'
                )}
            >
                {downloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <FileDown className="h-3.5 w-3.5" />
                )}
                Export PDF
            </button>
            <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
                <Printer className="h-3.5 w-3.5" />
                Print
            </button>
        </div>
    )
}
