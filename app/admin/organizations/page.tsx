'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ExportButton } from '@/components/admin/ExportButton'

const PLAN_COLORS: Record<string, string> = {
    HOME: '#6b7280',
    PRO: '#14b8a6',
    COMMERCIAL: '#f59e0b',
    ENTERPRISE: '#a78bfa',
}

type OrgRow = {
    id: string
    name: string
    plan: string
    createdAt: string
    _count: {
        members: number
        hashBatches: number
        rosinBatches: number
        pressedBatches: number
    }
}

type OrgsResponse = {
    data: {
        organizations: OrgRow[]
        total: number
        page: number
        limit: number
    }
}

const SORTABLE_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'plan', label: 'Plan' },
    { key: 'createdAt', label: 'Created' },
] as const

const LIMIT = 25

export default function AdminOrganizationsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('createdAt')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        const id = setTimeout(() => {
            setDebouncedSearch(value)
            setPage(1)
        }, 300)
        return () => clearTimeout(id)
    }, [])

    const { data, isLoading } = useQuery<OrgsResponse>({
        queryKey: ['admin-organizations', page, debouncedSearch, sortBy, sortDir],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
                sortBy,
                sortDir,
            })
            if (debouncedSearch) params.set('search', debouncedSearch)
            const res = await fetch(`/api/admin/organizations?${params}`)
            if (!res.ok) throw new Error('Failed to fetch organizations')
            return res.json()
        },
    })

    const orgs = data?.data.organizations ?? []
    const total = data?.data.total ?? 0
    const totalPages = Math.ceil(total / LIMIT)

    function handleSort(column: string) {
        if (sortBy === column) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(column)
            setSortDir('desc')
        }
        setPage(1)
    }

    const exportData = orgs.map((o) => ({
        Name: o.name,
        Plan: o.plan,
        Members: o._count.members,
        'Hash Batches': o._count.hashBatches,
        'Rosin Batches': o._count.rosinBatches,
        'Pressed Batches': o._count.pressedBatches,
        Created: format(new Date(o.createdAt), 'yyyy-MM-dd'),
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Organizations</h1>
                    <p className="text-sm text-muted mt-1">
                        {total.toLocaleString()} {total === 1 ? 'organization' : 'organizations'}
                    </p>
                </div>
                <ExportButton data={exportData} filename="hash-agent-organizations" />
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by organization name..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-card border border-white/10 rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                />
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {SORTABLE_COLUMNS.map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-white transition-colors select-none"
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {label}
                                            {sortBy === key &&
                                                (sortDir === 'asc' ? (
                                                    <ChevronUp className="w-3 h-3" />
                                                ) : (
                                                    <ChevronDown className="w-3 h-3" />
                                                ))}
                                        </span>
                                    </th>
                                ))}
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Members
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Batches
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/[0.06]">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orgs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                                        No organizations found.
                                    </td>
                                </tr>
                            ) : (
                                orgs.map((org) => {
                                    const totalBatches =
                                        org._count.hashBatches +
                                        org._count.rosinBatches +
                                        org._count.pressedBatches
                                    return (
                                        <tr
                                            key={org.id}
                                            className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-white">
                                                {org.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-block text-xs font-medium px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: `${PLAN_COLORS[org.plan]}20`,
                                                        color: PLAN_COLORS[org.plan],
                                                    }}
                                                >
                                                    {org.plan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                                                {format(new Date(org.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {org._count.members}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {totalBatches}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                        <p className="text-xs text-muted">
                            Page {page} of {totalPages} ({total.toLocaleString()} total)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded border border-white/10 text-muted hover:text-white hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded border border-white/10 text-muted hover:text-white hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
