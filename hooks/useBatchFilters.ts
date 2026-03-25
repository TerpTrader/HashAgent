'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export type BatchFilterState = {
    search: string
    status: string
    dateFrom: string
    dateTo: string
    sort: 'desc' | 'asc'
    page: number
}

const DEFAULTS: BatchFilterState = {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sort: 'desc',
    page: 0,
}

export function useBatchFilters() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const filters: BatchFilterState = useMemo(() => ({
        search: searchParams.get('q') ?? '',
        status: searchParams.get('status') ?? '',
        dateFrom: searchParams.get('from') ?? '',
        dateTo: searchParams.get('to') ?? '',
        sort: (searchParams.get('sort') as 'asc' | 'desc') ?? 'desc',
        page: parseInt(searchParams.get('page') ?? '0'),
    }), [searchParams])

    const setFilter = useCallback((key: keyof BatchFilterState, value: string | number) => {
        const params = new URLSearchParams(searchParams.toString())

        // Map filter keys to URL param names
        const paramMap: Record<keyof BatchFilterState, string> = {
            search: 'q',
            status: 'status',
            dateFrom: 'from',
            dateTo: 'to',
            sort: 'sort',
            page: 'page',
        }

        const paramName = paramMap[key]
        const strValue = String(value)

        if (strValue === '' || strValue === String(DEFAULTS[key])) {
            params.delete(paramName)
        } else {
            params.set(paramName, strValue)
        }

        // Reset page when changing other filters
        if (key !== 'page') {
            params.delete('page')
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [searchParams, router, pathname])

    const resetFilters = useCallback(() => {
        router.push(pathname, { scroll: false })
    }, [router, pathname])

    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        if (filters.search) params.set('search', filters.search)
        if (filters.status) params.set('status', filters.status)
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.set('dateTo', filters.dateTo)
        params.set('sort', filters.sort)
        params.set('limit', '24')
        params.set('offset', String(filters.page * 24))
        return params.toString()
    }, [filters])

    const hasActiveFilters = filters.search !== '' || filters.status !== '' || filters.dateFrom !== '' || filters.dateTo !== ''

    return { filters, setFilter, resetFilters, queryString, hasActiveFilters }
}
