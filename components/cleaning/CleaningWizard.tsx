'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createCleaningLogSchema, type CreateCleaningLogInput } from '@/lib/validations/cleaning'
import {
    WASH_EQUIPMENT,
    PRESS_EQUIPMENT,
    FREEZE_DRYER_PRESETS,
} from '@/types'

// ─── Build flat equipment list from domain constants ────────────────────────
const EQUIPMENT_OPTIONS: string[] = [
    ...WASH_EQUIPMENT.tank,
    ...WASH_EQUIPMENT.catchment,
    ...PRESS_EQUIPMENT,
    ...FREEZE_DRYER_PRESETS.map((fd) => `${fd.name} (${fd.callsign})`),
    ...WASH_EQUIPMENT.waterTransfer,
]

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

// Monday = 1 ... Sunday = 0 in JS Date, but we store 0=Mon for the weekly grid
function getDateForDay(weekOf: string, dayIndex: number): string {
    const base = new Date(weekOf)
    const d = new Date(base)
    d.setDate(d.getDate() + dayIndex)
    return d.toISOString().split('T')[0]
}

function dayOfWeekFromIndex(dayIndex: number): number {
    // dayIndex 0 = Monday, map to JS day: Mon=1, Tue=2, ..., Sun=0
    return dayIndex === 6 ? 0 : dayIndex + 1
}

export function CleaningWizard() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<CreateCleaningLogInput>({
        resolver: zodResolver(createCleaningLogSchema),
        defaultValues: {
            weekOf: '',
            entries: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'entries',
    })

    const weekOf = form.watch('weekOf')

    // Auto-generate 7 daily entries when weekOf changes
    function handleWeekOfChange(dateStr: string) {
        form.setValue('weekOf', dateStr)

        if (!dateStr) return

        // Clear existing entries and generate one per day with the first equipment
        const newEntries = DAY_NAMES.map((_, i) => ({
            dayOfWeek: dayOfWeekFromIndex(i),
            date: getDateForDay(dateStr, i),
            equipmentName: EQUIPMENT_OPTIONS[0],
            cleaned: false,
            cleanedBy: '',
            verifiedBy: '',
            notes: '',
        }))

        form.setValue('entries', newEntries)
    }

    function handleAddRow() {
        if (!weekOf) return
        append({
            dayOfWeek: 1,
            date: getDateForDay(weekOf, 0),
            equipmentName: EQUIPMENT_OPTIONS[0],
            cleaned: false,
            cleanedBy: '',
            verifiedBy: '',
            notes: '',
        })
    }

    async function onSubmit(data: CreateCleaningLogInput) {
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/cleaning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.error ?? 'Failed to create cleaning log')
                setIsSubmitting(false)
                return
            }

            router.push('/cleaning')
        } catch {
            setError('Network error. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/cleaning"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-surface-card transition-colors hover:border-white/10"
                >
                    <ArrowLeft className="h-4 w-4 text-muted" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-white">New Cleaning Log</h1>
                    <p className="mt-0.5 text-sm text-muted">
                        Log equipment cleaning for the week.
                    </p>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mt-4 animate-fade-in rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                {/* Week Of picker */}
                <div className="rounded-xl border border-white/5 bg-surface-card p-5">
                    <label className="block text-sm font-medium text-white">
                        Week Of (Monday)
                    </label>
                    <p className="mt-0.5 text-xs text-muted">
                        Select the Monday that starts this cleaning week. 7 daily entries will be generated automatically.
                    </p>
                    <input
                        type="date"
                        className="mt-2 w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        value={weekOf}
                        onChange={(e) => handleWeekOfChange(e.target.value)}
                    />
                    {form.formState.errors.weekOf && (
                        <p className="mt-1 text-xs text-red-400">{form.formState.errors.weekOf.message}</p>
                    )}
                </div>

                {/* Entries table */}
                {fields.length > 0 && (
                    <div className="rounded-xl border border-white/5 bg-surface-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Day</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Equipment</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted">Cleaned</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Cleaned By</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Verified By</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Notes</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {fields.map((field, index) => {
                                        const entryDate = form.watch(`entries.${index}.date`)
                                        const dayName = entryDate
                                            ? new Date(entryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
                                            : '—'

                                        return (
                                            <tr key={field.id} className="hover:bg-white/[0.02] transition-colors">
                                                {/* Day name (readonly) */}
                                                <td className="px-4 py-2.5">
                                                    <span className="text-sm text-white font-medium">{dayName}</span>
                                                </td>

                                                {/* Date (readonly) */}
                                                <td className="px-4 py-2.5">
                                                    <span className="text-sm font-mono text-muted">
                                                        {entryDate
                                                            ? new Date(entryDate + 'T12:00:00').toLocaleDateString('en-US', {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '—'}
                                                    </span>
                                                </td>

                                                {/* Equipment dropdown */}
                                                <td className="px-4 py-2.5">
                                                    <select
                                                        {...form.register(`entries.${index}.equipmentName`)}
                                                        className="w-full min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                    >
                                                        {EQUIPMENT_OPTIONS.map((eq) => (
                                                            <option key={eq} value={eq} className="bg-surface-card text-white">
                                                                {eq}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* Cleaned checkbox */}
                                                <td className="px-4 py-2.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        {...form.register(`entries.${index}.cleaned`)}
                                                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary accent-primary focus:ring-primary"
                                                    />
                                                </td>

                                                {/* Cleaned By */}
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        {...form.register(`entries.${index}.cleanedBy`)}
                                                        className="w-full min-w-[100px] rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </td>

                                                {/* Verified By */}
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        {...form.register(`entries.${index}.verifiedBy`)}
                                                        className="w-full min-w-[100px] rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </td>

                                                {/* Notes */}
                                                <td className="px-4 py-2.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Optional"
                                                        {...form.register(`entries.${index}.notes`)}
                                                        className="w-full min-w-[100px] rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </td>

                                                {/* Remove */}
                                                <td className="px-4 py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Row button */}
                        <div className="border-t border-white/5 px-4 py-3">
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-white"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Row
                            </button>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/cleaning"
                        className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-white"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || fields.length === 0}
                        className={cn(
                            'flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark',
                            (isSubmitting || fields.length === 0) && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create Cleaning Log'}
                    </button>
                </div>
            </form>
        </div>
    )
}
