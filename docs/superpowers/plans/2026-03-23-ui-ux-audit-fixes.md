# UI/UX Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all P0-P2 UI/UX issues identified in the full Hash Agent audit — active nav state, color consistency, dead buttons, missing feedback patterns, loading states, and interaction polish.

**Architecture:** Incremental fixes to existing components. No new pages or routes. Adds shared UI primitives (Toast, Skeleton) that the app already has Radix dependencies for. Each task is self-contained and independently deployable.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS 3.4, Radix UI primitives (@radix-ui/react-toast already installed), Lucide React icons, React Hook Form + Zod.

**Scope boundary:** This plan covers UI polish and consistency fixes only. Larger features (onboarding wizard, pagination, search/filter, keyboard shortcuts, command palette) each need their own brainstorming + planning cycle.

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `components/ui/Toast.tsx` | Toast notification primitive wrapping `@radix-ui/react-toast` (already installed) |
| `components/ui/Toaster.tsx` | Toast viewport + provider that mounts in root layout |
| `lib/hooks/useToast.ts` | Hook for imperatively showing toasts from any component |
| `components/ui/Skeleton.tsx` | Reusable skeleton loading primitives (line, card, circle) |
| `components/shared/NavLink.tsx` | Client component for sidebar/mobile nav links with active state via `usePathname()` |

### Modified Files
| File | Change |
|------|--------|
| `app/(dashboard)/layout.tsx` | Extract NavLink to client component import, remove Cmd+K badge |
| `components/shared/MobileNav.tsx` | Use new NavLink component for active state |
| `components/rosin/RosinCard.tsx` | Replace Tailwind color literals with design token classes |
| `app/(dashboard)/rosin/page.tsx` | Convert from client-side fetch to server component |
| `app/(dashboard)/batches/[id]/page.tsx` | Disable dead buttons with tooltip |
| `components/batches/BubbleHashWizard.tsx` | Add toast on success, add beforeunload guard |
| `components/rosin/RosinWizard.tsx` | Add toast on success, add beforeunload guard |
| `components/batches/steps/StartingMaterialStep.tsx` | Add "(optional)" labels to optional fields (required asterisks already present) |
| `components/batches/steps/InitialProcessingStep.tsx` | Add required/optional field indicators |
| `components/batches/steps/OutputStep.tsx` | Add required/optional field indicators |
| `app/(auth)/login/page.tsx` | Add Forgot Password link |
| `app/layout.tsx` | Mount Toaster provider |
| `app/(dashboard)/analytics/page.tsx` | Replace spinner with skeleton |
| `app/(dashboard)/compliance/page.tsx` | Replace spinner with skeleton, fix tab overflow on mobile |
| `app/globals.css` | Add stagger animation utility class |
| `app/(dashboard)/batches/page.tsx` | Apply stagger animation to card grid |
| `app/(dashboard)/rosin/page.tsx` | Apply stagger animation to card grid |

---

## Task 1: Create NavLink Client Component with Active State

**Why:** Users can't tell which page they're on — sidebar has no active state indicator. This is the #1 navigation UX issue.

**Files:**
- Create: `components/shared/NavLink.tsx`
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/shared/MobileNav.tsx`

- [ ] **Step 1: Create the NavLink client component**

```tsx
// components/shared/NavLink.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavLinkProps {
    href: string
    icon: string
    children: React.ReactNode
}

export function NavLink({ href, icon, children }: NavLinkProps) {
    const pathname = usePathname()
    // Match exact for /dashboard, prefix for everything else
    const isActive = href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(href)

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group',
                isActive
                    ? 'bg-primary/10 text-white'
                    : 'text-muted hover:text-white hover:bg-white/5'
            )}
        >
            <span
                className={cn(
                    'material-symbols-outlined text-[20px] transition-colors',
                    isActive
                        ? 'text-primary'
                        : 'text-muted/70 group-hover:text-white'
                )}
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 400 : 300}, 'opsz' 20` }}
            >
                {icon}
            </span>
            {children}
        </Link>
    )
}
```

- [ ] **Step 2: Update dashboard layout to use NavLink**

In `app/(dashboard)/layout.tsx`:
- Remove the inline `NavLink` function (lines 111-134)
- Add import: `import { NavLink } from '@/components/shared/NavLink'`
- Replace all `<a href=` with `<Link href=` in the sidebar for non-nav links (logo)
- Remove the non-functional Cmd+K badge (lines 83-86) — replace with `<div className="hidden lg:block flex-1" />`

The nav section already uses `<NavLink>` JSX — just the import source changes.

- [ ] **Step 3: Update MobileNav to use NavLink**

In `components/shared/MobileNav.tsx`:
- Add import: `import { NavLink } from '@/components/shared/NavLink'`
- Replace all inline `<a>` nav links with `<NavLink href="..." icon="...">` components
- The mobile drawer should close on navigation — add `onClick={() => setOpen(false)}` wrapper or pass `onNavigate` prop

- [ ] **Step 4: Verify active state works**

Run: `npm run dev` (or `pnpm dev`)
Navigate to each page and confirm:
- Sidebar highlights the correct link with teal background + filled icon
- Mobile drawer shows the same active state
- `/dashboard` only highlights Dashboard, not all pages
- `/batches/new` highlights "Bubble Hash" (prefix match)

- [ ] **Step 5: Commit**

```bash
git add components/shared/NavLink.tsx app/(dashboard)/layout.tsx components/shared/MobileNav.tsx
git commit -m "feat: add active nav state + remove non-functional Cmd+K badge"
```

---

## Task 2: Create Toast Notification System

**Why:** No success feedback after batch creation — user is silently redirected. No toast system exists despite `@radix-ui/react-toast` being installed.

**Files:**
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/Toaster.tsx`
- Create: `lib/hooks/useToast.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create the toast hook with store**

```ts
// lib/hooks/useToast.ts
import { useState, useCallback, useEffect } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'

export interface Toast {
    id: string
    title: string
    description?: string
    variant: ToastVariant
}

// Simple module-level store so any component can add toasts
let listeners: Array<(toast: Toast) => void> = []

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
    const t: Toast = { id: Date.now().toString(), title, description, variant }
    listeners.forEach((fn) => fn(t))
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((t: Toast) => {
        setToasts((prev) => [...prev, t])
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // Subscribe on mount, cleanup on unmount
    useEffect(() => {
        listeners.push(addToast)
        return () => {
            listeners = listeners.filter((fn) => fn !== addToast)
        }
    }, [addToast])

    return { toasts, dismissToast }
}
```

- [ ] **Step 2: Create the Toast UI component**

```tsx
// components/ui/Toast.tsx
'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { ToastVariant } from '@/lib/hooks/useToast'

const VARIANT_STYLES: Record<ToastVariant, string> = {
    default: 'border-white/10 bg-surface-elevated',
    success: 'border-hash-complete/20 bg-hash-complete/10',
    error: 'border-accent-error/20 bg-accent-error/10',
}

export function ToastItem({
    title,
    description,
    variant = 'default',
    onClose,
}: {
    title: string
    description?: string
    variant?: ToastVariant
    onClose: () => void
}) {
    return (
        <ToastPrimitive.Root
            className={cn(
                'rounded-xl border px-4 py-3 shadow-panel animate-slide-up',
                VARIANT_STYLES[variant]
            )}
            onOpenChange={(open) => { if (!open) onClose() }}
            duration={4000}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <ToastPrimitive.Title className="text-sm font-medium text-white">
                        {title}
                    </ToastPrimitive.Title>
                    {description && (
                        <ToastPrimitive.Description className="mt-1 text-xs text-muted">
                            {description}
                        </ToastPrimitive.Description>
                    )}
                </div>
                <ToastPrimitive.Close className="text-muted hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                </ToastPrimitive.Close>
            </div>
        </ToastPrimitive.Root>
    )
}
```

- [ ] **Step 3: Create the Toaster viewport component**

```tsx
// components/ui/Toaster.tsx
'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { useToast } from '@/lib/hooks/useToast'
import { ToastItem } from '@/components/ui/Toast'

export function Toaster() {
    const { toasts, dismissToast } = useToast()

    return (
        <ToastPrimitive.Provider swipeDirection="right">
            {toasts.map((t) => (
                <ToastItem
                    key={t.id}
                    title={t.title}
                    description={t.description}
                    variant={t.variant}
                    onClose={() => dismissToast(t.id)}
                />
            ))}
            <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" />
        </ToastPrimitive.Provider>
    )
}
```

- [ ] **Step 4: Mount Toaster in root layout**

In `app/layout.tsx`, add inside the `<body>` tag, after `{children}`:

```tsx
import { Toaster } from '@/components/ui/Toaster'

// Inside the body:
{children}
<Toaster />
```

- [ ] **Step 5: Verify toast renders**

Temporarily add a test toast call in any client component:
```ts
import { toast } from '@/lib/hooks/useToast'
toast({ title: 'Test', description: 'It works', variant: 'success' })
```
Confirm it appears bottom-right, slides up, auto-dismisses after 4s, and can be manually closed.

- [ ] **Step 6: Commit**

```bash
git add components/ui/Toast.tsx components/ui/Toaster.tsx lib/hooks/useToast.ts app/layout.tsx
git commit -m "feat: add toast notification system using Radix Toast"
```

---

## Task 3: Fix RosinCard Color Token Inconsistency

**Why:** RosinCard uses raw Tailwind colors (`emerald-400`, `amber-400`, `orange-400`) instead of the app's design tokens (`hash-complete`, `accent-warning`, etc.). Creates visual inconsistency.

**Files:**
- Modify: `components/rosin/RosinCard.tsx`

- [ ] **Step 1: Replace STATUS_STYLES with design tokens**

In `components/rosin/RosinCard.tsx`, replace lines 18-24:

Old:
```tsx
const STATUS_STYLES: Record<RosinBatchStatus, { label: string; className: string }> = {
    PRESSING: { label: 'Pressing', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    POST_PROCESSING: { label: 'Post Processing', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    DECARB: { label: 'Decarb', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    COMPLETE: { label: 'Complete', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ARCHIVED: { label: 'Archived', className: 'bg-white/5 text-muted border-white/10' },
}
```

New:
```tsx
const STATUS_STYLES: Record<RosinBatchStatus, { label: string; className: string }> = {
    PRESSING: { label: 'Pressing', className: 'bg-hash-pressing/10 text-hash-pressing border-hash-pressing/20' },
    POST_PROCESSING: { label: 'Post Processing', className: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' },
    DECARB: { label: 'Decarb', className: 'bg-hash-decarb/10 text-hash-decarb border-hash-decarb/20' },
    COMPLETE: { label: 'Complete', className: 'bg-hash-complete/10 text-hash-complete border-hash-complete/20' },
    ARCHIVED: { label: 'Archived', className: 'bg-white/5 text-muted border-white/10' },
}
```

- [ ] **Step 2: Replace getYieldColor with design tokens**

Old (lines 34-38):
```tsx
function getYieldColor(pct: number | null): string {
    if (pct == null) return 'text-muted'
    if (pct >= 70) return 'text-emerald-400'
    if (pct >= 50) return 'text-amber-400'
    return 'text-red-400'
}
```

New:
```tsx
function getYieldColor(pct: number | null): string {
    if (pct == null) return 'text-muted'
    if (pct >= 70) return 'text-hash-complete'
    if (pct >= 50) return 'text-accent-warning'
    return 'text-accent-error'
}
```

- [ ] **Step 3: Verify colors render correctly**

Run dev server, navigate to `/rosin`. Confirm:
- PRESSING badge is amber (not blue — matches hash-pressing token)
- COMPLETE badge is green (same hue as hash batches)
- Yield colors match: green for ≥70%, amber for ≥50%, red for <50%

- [ ] **Step 4: Commit**

```bash
git add components/rosin/RosinCard.tsx
git commit -m "fix: use design token colors in RosinCard for consistency"
```

---

## Task 4: Convert Rosin Page to Server Component

**Why:** Rosin list page uses client-side `useEffect` fetch causing a loading spinner, while the identical Batches list page uses server-side data. Inconsistent and slower UX.

**Files:**
- Modify: `app/(dashboard)/rosin/page.tsx`

- [ ] **Step 1: Rewrite as server component**

Replace the entire file with a server component matching the batches page pattern:

```tsx
// app/(dashboard)/rosin/page.tsx
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { RosinCard } from '@/components/rosin/RosinCard'

export const metadata = {
    title: 'Rosin Batches',
}

export default async function RosinListPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    const batches = await db.rosinBatch.findMany({
        where: { orgId: session.orgId },
        orderBy: { processDate: 'desc' },
        take: 50,
    })

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Rosin Batches</h1>
                    <p className="mt-1 text-sm text-muted">
                        {batches.length} batch{batches.length !== 1 ? 'es' : ''} recorded
                    </p>
                </div>
                <Link
                    href="/rosin/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" />
                    New Press
                </Link>
            </div>

            {/* Content */}
            {batches.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {batches.map((batch) => (
                        <RosinCard
                            key={batch.id}
                            id={batch.id}
                            strain={batch.strain}
                            batchNumber={batch.batchNumber}
                            processDate={batch.processDate.toISOString()}
                            productType={batch.productType as any}
                            rosinYieldWeightG={batch.rosinYieldWeightG}
                            rosinYieldPct={batch.rosinYieldPct}
                            status={batch.status as any}
                            companyProcessedFor={batch.companyProcessedFor}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <span className="material-symbols-outlined text-3xl text-primary">local_fire_department</span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">No rosin batches yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Press your first rosin batch from completed bubble hash.
                    </p>
                    <Link
                        href="/rosin/new"
                        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        New Press
                    </Link>
                </div>
            )}
        </div>
    )
}
```

- [ ] **Step 2: Verify page loads without spinner**

Navigate to `/rosin` — should render immediately like `/batches` with no loading spinner. Empty state should also work correctly.

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/rosin/page.tsx
git commit -m "perf: convert rosin list to server component matching batches pattern"
```

---

## Task 5: Handle Dead Buttons on Batch Detail

**Why:** "Export PDF" and "Archive" buttons on batch detail have no click handlers. Dead buttons erode user trust.

**Files:**
- Modify: `app/(dashboard)/batches/[id]/page.tsx`

- [ ] **Step 1: Read the batch detail page to find the exact button markup**

Read `app/(dashboard)/batches/[id]/page.tsx` and locate the Export PDF and Archive buttons — they should be in the header area near the Edit button.

- [ ] **Step 2: Disable Export PDF with tooltip, remove Archive or add coming-soon state**

For the Export PDF button — add `disabled`, `cursor-not-allowed`, `opacity-50`, and a `title` attribute:
```tsx
<button
    disabled
    title="PDF export coming soon"
    className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-muted cursor-not-allowed opacity-50"
>
    {/* icon */} Export PDF
</button>
```

For the Archive button — same treatment:
```tsx
<button
    disabled
    title="Archive coming soon"
    className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-muted cursor-not-allowed opacity-50"
>
    {/* icon */} Archive
</button>
```

- [ ] **Step 3: Verify buttons show disabled state and tooltip on hover**

Navigate to any batch detail page. Confirm:
- Export PDF button is visually disabled (dimmed)
- Hovering shows "PDF export coming soon" tooltip
- Archive button is visually disabled
- Neither button triggers any action on click

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/batches/[id]/page.tsx"
git commit -m "fix: disable non-functional Export PDF and Archive buttons with tooltips"
```

---

## Task 6: Create Skeleton Loading Components

**Why:** All loading states use spinners. The UI/UX protocol says "use skeleton screens, not spinners, for content areas."

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Modify: `app/(dashboard)/analytics/page.tsx`
- Modify: `app/(dashboard)/compliance/page.tsx`

- [ ] **Step 1: Create reusable Skeleton primitives**

```tsx
// components/ui/Skeleton.tsx
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
```

- [ ] **Step 2: Replace spinner in analytics page**

In `app/(dashboard)/analytics/page.tsx`, replace the loading spinner block with skeleton content:

Replace:
```tsx
{loading && (
    <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
)}
```

With:
```tsx
{loading && (
    <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-64" />
        </div>
    </div>
)}
```

Add import: `import { SkeletonKpi, SkeletonCard } from '@/components/ui/Skeleton'`

- [ ] **Step 3: Replace spinner in compliance page**

In `app/(dashboard)/compliance/page.tsx`, replace lines 93-97:

Replace:
```tsx
{loading && (
    <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
)}
```

With:
```tsx
{loading && (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <SkeletonCard className="h-44" />
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
    </div>
)}
```

Add imports: `import { Skeleton, SkeletonKpi, SkeletonCard } from '@/components/ui/Skeleton'`
Remove unused `Loader2` import if no longer needed.

- [ ] **Step 4: Verify skeletons render with shimmer animation**

Run dev server. Navigate to analytics and compliance. During the loading phase, confirm:
- Shimmer animation plays (background slides left to right)
- Skeleton layout matches the actual content layout
- No layout shift when real data loads in

- [ ] **Step 5: Commit**

```bash
git add components/ui/Skeleton.tsx "app/(dashboard)/analytics/page.tsx" "app/(dashboard)/compliance/page.tsx"
git commit -m "feat: add skeleton loading states for analytics and compliance pages"
```

---

## Task 7: Add Toast on Wizard Submit Success

**Why:** After creating a batch, the user is silently redirected to the detail page with no success confirmation.

**Files:**
- Modify: `components/batches/BubbleHashWizard.tsx`
- Modify: `components/rosin/RosinWizard.tsx`

- [ ] **Step 1: Add success toast to BubbleHashWizard**

In `components/batches/BubbleHashWizard.tsx`, add import:
```tsx
import { toast } from '@/lib/hooks/useToast'
```

In the `handleSubmit` function, after `const { data } = await res.json()` and before `router.push(...)`:
```tsx
toast({
    title: 'Batch created',
    description: `${step0Form.getValues().strain} batch logged successfully.`,
    variant: 'success',
})
```

- [ ] **Step 2: Add success toast to RosinWizard**

In `components/rosin/RosinWizard.tsx`, add the same import and add a toast before the redirect. The first form in RosinWizard is `sourceForm`:
```tsx
toast({
    title: 'Rosin batch created',
    description: `${sourceForm.getValues().strain} press logged successfully.`,
    variant: 'success',
})
```

- [ ] **Step 3: Verify toast shows briefly before redirect**

Create a test batch. After submission, confirm:
- Green success toast appears briefly (may flash before redirect — this is acceptable)
- The toast persists on the detail page if navigation is fast enough
- No errors in console

- [ ] **Step 4: Commit**

```bash
git add components/batches/BubbleHashWizard.tsx components/rosin/RosinWizard.tsx
git commit -m "feat: show success toast on batch and rosin wizard submission"
```

---

## Task 8: Add Unsaved Changes Warning to Wizards

**Why:** Users can navigate away from a 5-step wizard and lose all data silently.

**Files:**
- Modify: `components/batches/BubbleHashWizard.tsx`
- Modify: `components/rosin/RosinWizard.tsx`

- [ ] **Step 1: Add beforeunload guard to BubbleHashWizard**

In `components/batches/BubbleHashWizard.tsx`, add a `useEffect` after the existing state declarations:

```tsx
import { useEffect } from 'react'

// Add after useState declarations:
const isDirty = step0Form.formState.isDirty || step1Form.formState.isDirty ||
    step2Form.formState.isDirty || step3Form.formState.isDirty || step4Form.formState.isDirty

useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```

- [ ] **Step 2: Add same guard to RosinWizard**

In `components/rosin/RosinWizard.tsx`, add `useEffect` to the existing react import and add the guard. The form instances are named `sourceForm`, `pressForm`, `processingForm`, `postProcessForm`, `outputForm`:

```tsx
const isDirty = sourceForm.formState.isDirty || pressForm.formState.isDirty ||
    processingForm.formState.isDirty || postProcessForm.formState.isDirty || outputForm.formState.isDirty

useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```

- [ ] **Step 3: Verify browser warns on navigation away**

Start filling out a batch wizard. Before completing:
- Close the tab — browser should show "Leave site?" warning
- Navigate away via sidebar — browser should show warning
- After submission, warning should NOT show (forms are no longer dirty)

- [ ] **Step 4: Commit**

```bash
git add components/batches/BubbleHashWizard.tsx components/rosin/RosinWizard.tsx
git commit -m "feat: warn before navigating away from dirty wizard forms"
```

---

## Task 9: Add Required/Optional Field Indicators to Wizard Steps

**Why:** No visual distinction between required and optional fields in most steps. Users don't know what they must fill in. Note: `StartingMaterialStep` already has red asterisks on required fields — this task adds "(optional)" labels to its optional fields and extends the pattern to other steps.

**Files:**
- Modify: `components/batches/steps/StartingMaterialStep.tsx` (add "(optional)" labels only — asterisks already exist)
- Modify: `components/batches/steps/InitialProcessingStep.tsx`
- Modify: `components/batches/steps/OutputStep.tsx`

**Note:** DryingStep is excluded — all its fields are optional (micron yields default to 0), so no indicators needed.

- [ ] **Step 1: Identify required vs optional fields from Zod schemas**

From `lib/validations/batch.ts`:
- **Step 0 (Starting Material)**: Required: strain, materialState, materialGrade (asterisks already present). Optional: farmSource, metrcSourceUid, licenseKey, cleaningLogRef.
- **Step 1 (Processing)**: Required: washDate, rawMaterialWeightG. Optional: wetWasteWeightG, expectedYieldPct, equipmentUsed.
- **Step 2 (Drying)**: All optional — no changes needed.
- **Step 3 (Output)**: Required: batchNumber. Optional: productName, metrcProductUid, qualityTier, manufacturingDate.

- [ ] **Step 2: Add "(optional)" labels to StartingMaterialStep optional fields**

In `components/batches/steps/StartingMaterialStep.tsx`, the required asterisks are already in place. Add "(optional)" to the optional field labels (`farmSource`, `metrcSourceUid`, `licenseKey`, `cleaningLogRef`):

```tsx
<label htmlFor="farmSource" className="block text-xs font-medium text-muted mb-1.5">
    Farm Source <span className="text-muted/50 font-normal">(optional)</span>
</label>
```

- [ ] **Step 3: Add required asterisks and optional labels to InitialProcessingStep**

Asterisk on `washDate` and `rawMaterialWeightG` labels:
```tsx
<label className="block text-xs font-medium text-muted mb-1.5">
    Wash Date <span className="text-accent-error">*</span>
</label>
```

"(optional)" on `wetWasteWeightG` and `expectedYieldPct`.

- [ ] **Step 4: Add required asterisk and optional labels to OutputStep**

Asterisk on `batchNumber` label only. "(optional)" on `productName`, `metrcProductUid`, `manufacturingDate`.

- [ ] **Step 5: Verify indicators render correctly**

Navigate to `/batches/new`. Confirm across all steps:
- Required fields show red asterisk
- Optional fields show "(optional)" in muted text
- Visual hierarchy is clear — asterisks don't dominate

- [ ] **Step 6: Commit**

```bash
git add components/batches/steps/StartingMaterialStep.tsx components/batches/steps/InitialProcessingStep.tsx components/batches/steps/OutputStep.tsx
git commit -m "feat: add required/optional field indicators to wizard steps"
```

---

## Task 10: Add Forgot Password Link and Stub Page

**Why:** Login page has no "Forgot Password" link. Middleware already allows `/forgot-password` as a public route, but no page exists for it yet.

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Create a stub forgot-password page**

```tsx
// app/(auth)/forgot-password/page.tsx
import Link from 'next/link'

export const metadata = { title: 'Reset Password' }

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8 text-center">
                <div>
                    <Link href="/" className="text-2xl font-semibold text-white">
                        Hash Agent
                    </Link>
                    <p className="text-sm text-muted mt-2">Reset your password</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <p className="text-sm text-muted">
                        Password reset is coming soon. For now, contact your admin to reset your password.
                    </p>
                </div>
                <p className="text-xs text-muted">
                    <Link href="/login" className="text-primary hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Add forgot password link to login page**

In `app/(auth)/login/page.tsx`, after the password `</div>` (line 93) and before the submit button (line 95), add:

```tsx
<div className="flex justify-end">
    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
        Forgot password?
    </Link>
</div>
```

`Link` is already imported from `next/link` (line 5).

- [ ] **Step 3: Verify link appears and navigates**

Navigate to `/login`. Confirm:
- "Forgot password?" link appears right-aligned below password field
- Link navigates to `/forgot-password` and shows the stub page (not a 404)
- Stub page has a "Back to sign in" link that returns to login

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/forgot-password/page.tsx"
git commit -m "feat: add forgot password link and stub page"
```

---

## Task 11: Add List Stagger Animation

**Why:** All card grids animate in simultaneously. Staggered reveal feels more polished and helps the eye track content.

**Files:**
- Modify: `app/globals.css`
- Modify: `app/(dashboard)/batches/page.tsx`
- Modify: `app/(dashboard)/rosin/page.tsx`

- [ ] **Step 1: Add stagger CSS utility to globals.css**

In `app/globals.css`, add after the existing `@tailwind utilities;` line:

```css
@layer utilities {
    .stagger-fade-in {
        animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: calc(var(--stagger-index, 0) * 50ms);
    }
}
```

This reuses the existing `fadeIn` keyframe from `tailwind.config.ts`.

- [ ] **Step 2: Apply stagger to batch card grid**

In `app/(dashboard)/batches/page.tsx`, update the card rendering to pass the stagger index:

```tsx
{batches.map((batch, index) => (
    <div key={batch.id} className="stagger-fade-in" style={{ '--stagger-index': index } as React.CSSProperties}>
        <BatchCard
            id={batch.id}
            strain={batch.strain}
            // ... rest of props
        />
    </div>
))}
```

- [ ] **Step 3: Apply stagger to rosin card grid**

Same pattern in the new server-component `app/(dashboard)/rosin/page.tsx`:

```tsx
{batches.map((batch, index) => (
    <div key={batch.id} className="stagger-fade-in" style={{ '--stagger-index': index } as React.CSSProperties}>
        <RosinCard ... />
    </div>
))}
```

- [ ] **Step 4: Verify stagger animation**

Navigate to `/batches` and `/rosin` with data present. Confirm:
- Cards appear one by one with a subtle cascade
- First card appears immediately, each subsequent card delayed by ~50ms
- Animation feels natural, not slow or choppy

- [ ] **Step 5: Commit**

```bash
git add app/globals.css "app/(dashboard)/batches/page.tsx" "app/(dashboard)/rosin/page.tsx"
git commit -m "feat: add staggered fade-in animation to card grids"
```

---

## Task 12: Fix Compliance Tab Overflow on Mobile

**Why:** 5 compliance tabs with long labels ("Incomplete Sign-offs", "Missing Product UIDs") overflow on mobile with no visual scroll indicator.

**Files:**
- Modify: `app/(dashboard)/compliance/page.tsx`

- [ ] **Step 1: Add scroll fade indicators and abbreviated labels**

In `app/(dashboard)/compliance/page.tsx`, the tab container is at line 139. Wrap it in a container with scroll fade:

```tsx
{/* Tabs */}
<div className="relative">
    {/* Fade overlay on right edge to indicate scrollability */}
    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden z-10" />
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-px scrollbar-none">
        {TABS.map((tab) => {
            // ... existing tab rendering
        })}
    </div>
</div>
```

Also add to `globals.css`:
```css
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
```

- [ ] **Step 2: Verify on mobile viewport**

Resize browser to 375px width. Confirm:
- Tabs are horizontally scrollable
- Right edge shows a subtle fade indicating more content
- Tab text doesn't wrap or get cut off
- Active tab border indicator still visible

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/compliance/page.tsx" app/globals.css
git commit -m "fix: add scroll indicator for compliance tabs on mobile"
```

---

## Task 13: Fix text-[10px] Readability Issues

**Why:** Multiple places use `text-[10px]` (custom 10px font size) which is below the readable minimum on mobile.

**Files:**
- Modify: `app/(dashboard)/layout.tsx` (plan badge)
- Modify: `components/rosin/RosinCard.tsx` (product type badge)

- [ ] **Step 1: Audit and fix instances**

The `text-[10px]` usage that should be bumped to `text-xs` (12px):

1. **Dashboard layout plan badge** (`layout.tsx:30`): `text-[10px]` → `text-xs` — plan badge in sidebar
2. **RosinCard product type badge** (`RosinCard.tsx:97`): `text-[10px]` → `text-xs` — product type label
3. **RosinCard company badge** (`RosinCard.tsx:102`): `text-[10px]` → `text-xs`

Keep `text-[10px]` where it's used for intentionally small decorative elements:
- Status badges on dashboard (these are supplementary, not primary content)
- Nav section headers (these are decorative section dividers)
- Compliance score "SCORE" label (positioned inside a large ring, intentionally small)

- [ ] **Step 2: Apply the changes**

For each file, replace `text-[10px]` with `text-xs` on the identified elements.

- [ ] **Step 3: Verify readability**

Check each modified element at mobile viewport width. Confirm text is legible without squinting.

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/layout.tsx components/rosin/RosinCard.tsx
git commit -m "fix: increase minimum text size for readability on mobile"
```

---

## Task 14: Use Next.js Link in Sidebar Navigation

**Why:** Sidebar uses raw `<a>` tags causing full page reloads. Should use Next.js `<Link>` for client-side navigation.

**Files:**
- Modify: `components/shared/NavLink.tsx` (already created in Task 1 with `<Link>`)

- [ ] **Step 1: Verify NavLink from Task 1 already uses `<Link>`**

The `NavLink` component created in Task 1 already imports and uses `next/link`. Verify the sidebar logo also uses `<Link>`:

In `app/(dashboard)/layout.tsx`, change the logo:
```tsx
// Old:
<a href="/dashboard" className="flex items-center gap-2">

// New:
<Link href="/dashboard" className="flex items-center gap-2">
```

Add `import Link from 'next/link'` at the top of the file.

- [ ] **Step 2: Verify client-side navigation**

Click between pages in the sidebar. Confirm:
- Page transitions are instant (no full reload)
- Browser URL updates correctly
- Back button works as expected

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/layout.tsx
git commit -m "fix: use Next.js Link for client-side navigation in sidebar"
```

---

## Verification Checklist

After all tasks are complete, verify the full audit passes:

- [ ] **Active nav state**: Sidebar highlights current page with teal background + filled icon
- [ ] **No dead buttons**: Export PDF and Archive are visibly disabled with tooltips
- [ ] **Color consistency**: RosinCard uses same design tokens as BatchCard
- [ ] **Server-side rendering**: Rosin page loads instantly (no spinner)
- [ ] **Toast notifications**: Batch creation shows green success toast
- [ ] **Skeleton loading**: Analytics and Compliance show shimmer skeletons during load
- [ ] **Unsaved changes**: Browser warns when leaving dirty wizard form
- [ ] **Required fields**: Wizard steps show asterisks on required fields
- [ ] **Forgot password**: Login page has forgot password link
- [ ] **Stagger animation**: Card grids cascade in
- [ ] **Mobile tabs**: Compliance tabs scroll horizontally with fade indicator
- [ ] **Text readability**: No `text-[10px]` on primary content elements
- [ ] **Client-side nav**: Sidebar uses `<Link>` — no full page reloads
- [ ] **No Cmd+K badge**: Removed from topbar (no implementation behind it)
