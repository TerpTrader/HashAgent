'use client'

import { Download } from 'lucide-react'

type ExportButtonProps = {
    /** Array of objects to export — keys become CSV headers */
    data: Record<string, unknown>[]
    filename: string
}

function escapeCSVField(value: unknown): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Wrap in quotes if the value contains commas, quotes, or newlines
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

export function ExportButton({ data, filename }: ExportButtonProps) {
    function handleExport() {
        if (data.length === 0) return

        const headers = Object.keys(data[0])
        const csvRows = [
            headers.join(','),
            ...data.map((row) => headers.map((h) => escapeCSVField(row[h])).join(',')),
        ]
        const csvString = csvRows.join('\n')

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted hover:text-white border border-white/10 rounded-lg hover:bg-white/[0.03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
    )
}
