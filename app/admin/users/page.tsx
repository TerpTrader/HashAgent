'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ExportButton } from '@/components/admin/ExportButton'

const ALL_PLANS = ['HOME', 'PRO', 'COMMERCIAL', 'ENTERPRISE'] as const

type TierInfo = { name: string; enabled: boolean }

const PLAN_COLORS: Record<string, string> = {
    HOME: '#6b7280',
    PRO: '#14b8a6',
    COMMERCIAL: '#f59e0b',
    ENTERPRISE: '#a78bfa',
}

type Membership = {
    role: string
    org: { id: string; name: string; plan: string }
}

type UserRow = {
    id: string
    name: string | null
    email: string
    emailVerified: string | null
    lastLoginAt: string | null
    createdAt: string
    memberships: Membership[]
}

type UsersResponse = {
    data: {
        users: UserRow[]
        total: number
        page: number
        limit: number
    }
}

const SORTABLE_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Joined' },
    { key: 'lastLoginAt', label: 'Last Login' },
] as const

const LIMIT = 25

// Inline plan-change dropdown that appears on click
function PlanBadge({ plan, orgId, onChanged, enabledTiers }: { plan: string; orgId: string; onChanged: () => void; enabledTiers: string[] }) {
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    async function changePlan(newPlan: string) {
        if (newPlan === plan) { setOpen(false); return }
        setSaving(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orgId, plan: newPlan }),
            })
            if (!res.ok) throw new Error('Failed')
            onChanged()
        } catch {
            alert('Failed to update plan')
        } finally {
            setSaving(false)
            setOpen(false)
        }
    }

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={() => setOpen(!open)}
                disabled={saving}
                className="inline-block text-xs font-medium px-2 py-0.5 rounded cursor-pointer hover:ring-1 hover:ring-white/20 transition-all"
                style={{
                    backgroundColor: `${PLAN_COLORS[plan] ?? '#6b7280'}20`,
                    color: PLAN_COLORS[plan] ?? '#6b7280',
                }}
                title="Click to change plan"
            >
                {saving ? '...' : plan}
            </button>
            {open && (
                <div className="absolute z-50 mt-1 left-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                    {ALL_PLANS.map((p) => {
                        const isEnabled = enabledTiers.includes(p)
                        const isCurrent = p === plan
                        return (
                            <button
                                key={p}
                                onClick={() => isEnabled ? changePlan(p) : undefined}
                                disabled={!isEnabled && !isCurrent}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                                    !isEnabled && !isCurrent
                                        ? 'opacity-30 cursor-not-allowed'
                                        : 'hover:bg-white/[0.06] cursor-pointer'
                                } ${isCurrent ? 'text-white font-semibold' : 'text-muted'}`}
                            >
                                <span
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ backgroundColor: PLAN_COLORS[p] }}
                                />
                                {p}
                                {isCurrent && <span className="ml-auto text-[10px] text-muted">current</span>}
                                {!isEnabled && !isCurrent && <span className="ml-auto text-[10px] text-red-400">disabled</span>}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function AdminUsersPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('createdAt')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

    // Debounce search input
    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        // Simple debounce via timeout
        const id = setTimeout(() => {
            setDebouncedSearch(value)
            setPage(1)
        }, 300)
        return () => clearTimeout(id)
    }, [])

    const queryClient = useQueryClient()

    // Fetch enabled tiers
    const { data: tiersData } = useQuery<{ data: { tiers: TierInfo[] } }>({
        queryKey: ['admin-tiers'],
        queryFn: async () => {
            const res = await fetch('/api/admin/tiers')
            if (!res.ok) throw new Error('Failed to fetch tiers')
            return res.json()
        },
    })

    const enabledTiers = (tiersData?.data.tiers ?? ALL_PLANS.map(t => ({ name: t, enabled: true })))
        .filter((t) => t.enabled)
        .map((t) => t.name)

    const allTierInfo = tiersData?.data.tiers ?? ALL_PLANS.map(t => ({ name: t, enabled: true }))

    async function toggleTier(tier: string, enabled: boolean) {
        await fetch('/api/admin/tiers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier, enabled }),
        })
        queryClient.invalidateQueries({ queryKey: ['admin-tiers'] })
    }

    const { data, isLoading } = useQuery<UsersResponse>({
        queryKey: ['admin-users', page, debouncedSearch, sortBy, sortDir],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
                sortBy,
                sortDir,
            })
            if (debouncedSearch) params.set('search', debouncedSearch)
            const res = await fetch(`/api/admin/users?${params}`)
            if (!res.ok) throw new Error('Failed to fetch users')
            return res.json()
        },
    })

    const users = data?.data.users ?? []
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

    // Flatten user data for CSV export
    const exportData = users.map((u) => {
        const membership = u.memberships[0]
        return {
            Name: u.name ?? '',
            Email: u.email,
            Verified: u.emailVerified ? 'Yes' : 'No',
            Organization: membership?.org?.name ?? '',
            Plan: membership?.org?.plan ?? '',
            Role: membership?.role ?? '',
            'Last Login': u.lastLoginAt ? format(new Date(u.lastLoginAt), 'yyyy-MM-dd HH:mm') : 'Never',
            Joined: format(new Date(u.createdAt), 'yyyy-MM-dd'),
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-sm text-muted mt-1">
                        {total.toLocaleString()} registered {total === 1 ? 'user' : 'users'}
                    </p>
                </div>
                <ExportButton data={exportData} filename="hash-agent-users" />
            </div>

            {/* Tier Toggles */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">Plan Tiers</h3>
                    <span className="text-[10px] text-muted uppercase tracking-wider">Global availability</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {allTierInfo.map((tier) => (
                        <button
                            key={tier.name}
                            onClick={() => toggleTier(tier.name, !tier.enabled)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                tier.enabled
                                    ? 'border-white/20 bg-white/[0.04] text-white'
                                    : 'border-white/[0.06] bg-transparent text-muted opacity-50'
                            }`}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: tier.enabled ? PLAN_COLORS[tier.name] : '#4b5563' }}
                            />
                            {tier.name}
                            <span
                                className={`ml-1 w-8 h-4 rounded-full relative transition-colors ${
                                    tier.enabled ? 'bg-primary' : 'bg-white/10'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                                        tier.enabled ? 'left-[18px]' : 'left-0.5'
                                    }`}
                                />
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or email..."
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
                                    Verified
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Plan
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Role
                                </th>
                                <th className="text-left text-xs text-muted uppercase tracking-wider px-4 py-3">
                                    Orgs
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/[0.06]">
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const membership = user.memberships[0]
                                    const plan = membership?.org?.plan ?? 'HOME'
                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-white">
                                                {user.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                                                {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                                                {user.lastLoginAt
                                                    ? formatDistanceToNow(new Date(user.lastLoginAt), {
                                                          addSuffix: true,
                                                      })
                                                    : 'Never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block w-2 h-2 rounded-full ${
                                                        user.emailVerified
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {membership?.org?.id ? (
                                                    <PlanBadge
                                                        plan={plan}
                                                        orgId={membership.org.id}
                                                        enabledTiers={enabledTiers}
                                                        onChanged={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {membership?.role ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted">
                                                {user.memberships.length}
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
