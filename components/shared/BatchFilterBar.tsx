'use client'

import { useRef, useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BatchFilterState } from '@/hooks/useBatchFilters'

type StatusOption = { value: string; label: string }

type BatchFilterBarProps = {
    filters: BatchFilterState
    onFilterChange: (key: keyof BatchFilterState, value: string | number) => void
    onReset: () => void
    statusOptions: StatusOption[]
    totalCount?: number
    hasActiveFilters: boolean
}

export function BatchFilterBar({
    filters,
    onFilterChange,
    onReset,
    statusOptions,
    totalCount,
    hasActiveFilters,
}: BatchFilterBarProps) {
    const [localSearch, setLocalSearch] = useState(filters.search)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Sync local search with URL on external changes
    useEffect(() => {
        setLocalSearch(filters.search)
    }, [filters.search])

    function handleSearchChange(value: string) {
        setLocalSearch(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            onFilterChange('search', value)
        }, 300)
    }

    return (
        <div className="space-y-3">
            {/* Main filter row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by strain, batch #, farm source..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {localSearch && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white appearance-none cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-surface"
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Sort toggle */}
                <button
                    onClick={() => onFilterChange('sort', filters.sort === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {filters.sort === 'desc' ? 'Newest' : 'Oldest'}
                </button>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-xs text-muted">
                    <SlidersHorizontal className="h-3 w-3" />
                    {totalCount != null && (
                        <span>{totalCount} result{totalCount !== 1 ? 's' : ''}</span>
                    )}
                    <button
                        onClick={onReset}
                        className="text-primary hover:text-primary-light transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    )
}
