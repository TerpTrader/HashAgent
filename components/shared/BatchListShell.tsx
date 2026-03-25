'use client'

import { useEffect, useState, Suspense } from 'react'
import { useBatchFilters } from '@/hooks/useBatchFilters'
import { BatchFilterBar } from './BatchFilterBar'
import { Loader2, Plus, Search } from 'lucide-react'

type StatusOption = { value: string; label: string }

type BatchListShellProps = {
    apiPath: string
    statusOptions: StatusOption[]
    newBatchHref: string
    newBatchLabel: string
    emptyIcon: React.ReactNode
    emptyTitle: string
    emptyDescription: string
    renderCard: (item: any, index: number) => React.ReactNode
}

function BatchListInner({
    apiPath,
    statusOptions,
    newBatchHref,
    newBatchLabel,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    renderCard,
}: BatchListShellProps) {
    const { filters, setFilter, resetFilters, queryString, hasActiveFilters } = useBatchFilters()
    const [data, setData] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        fetch(`${apiPath}?${queryString}`)
            .then(res => res.json())
            .then(json => {
                if (!cancelled) {
                    setData(json.data ?? [])
                    setTotal(json.total ?? json.data?.length ?? 0)
                    setLoading(false)
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [apiPath, queryString])

    const pageSize = 24
    const totalPages = Math.ceil(total / pageSize)
    const currentPage = filters.page

    return (
        <div>
            {/* Filter bar */}
            <div className="mb-6">
                <BatchFilterBar
                    filters={filters}
                    onFilterChange={setFilter}
                    onReset={resetFilters}
                    statusOptions={statusOptions}
                    totalCount={hasActiveFilters ? total : undefined}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted" />
                    <span className="ml-2 text-sm text-muted">Loading...</span>
                </div>
            )}

            {/* Results */}
            {!loading && data.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.map((item, index) => (
                            <div key={item.id} className="stagger-fade-in" style={{ '--stagger-index': index } as React.CSSProperties}>
                                {renderCard(item, index)}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                onClick={() => setFilter('page', currentPage - 1)}
                                disabled={currentPage === 0}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setFilter('page', currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty state — no results from filter */}
            {!loading && data.length === 0 && hasActiveFilters && (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                        <Search className="h-7 w-7 text-muted/50" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No matches</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        No batches match your current filters. Try adjusting your search or clearing filters.
                    </p>
                    <button
                        onClick={resetFilters}
                        className="mt-4 text-sm text-primary hover:text-primary-light transition-colors"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Empty state — no records at all */}
            {!loading && data.length === 0 && !hasActiveFilters && (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        {emptyIcon}
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">{emptyTitle}</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">{emptyDescription}</p>
                    <a
                        href={newBatchHref}
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        {newBatchLabel}
                    </a>
                </div>
            )}
        </div>
    )
}

export function BatchListShell(props: BatchListShellProps) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
        }>
            <BatchListInner {...props} />
        </Suspense>
    )
}
