import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-shimmer rounded-lg bg-white/5 bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]',
                className
            )}
        />
    )
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-white/5 bg-surface-card p-5 space-y-3', className)}>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-8 w-1/2 mt-4" />
        </div>
    )
}

export function SkeletonKpi({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-white/5 bg-surface-card p-4 space-y-2', className)}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
        </div>
    )
}
