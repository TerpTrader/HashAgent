'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ComplianceCard } from '@/components/compliance/ComplianceCard'
import type { ComplianceReport, ComplianceIssueType } from '@/lib/metrc-utils'
import { ShieldCheck, Loader2, AlertTriangle, FileWarning, UserX, TestTube } from 'lucide-react'

type TabKey = 'all' | ComplianceIssueType

const TABS: Array<{ key: TabKey; label: string; icon: typeof AlertTriangle }> = [
    { key: 'all', label: 'All Issues', icon: AlertTriangle },
    { key: 'missing_source_uid', label: 'Missing UIDs', icon: FileWarning },
    { key: 'missing_product_uid', label: 'Missing Product UIDs', icon: FileWarning },
    { key: 'incomplete_signoff', label: 'Incomplete Sign-offs', icon: UserX },
    { key: 'missing_qa_allocation', label: 'Missing QA', icon: TestTube },
]

function ScoreRing({ score }: { score: number }) {
    const radius = 52
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (score / 100) * circumference
    const color = score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : '#ef4444'

    return (
        <div className="relative flex items-center justify-center">
            <svg width={128} height={128} className="-rotate-90">
                <circle
                    cx={64}
                    cy={64}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={8}
                />
                <circle
                    cx={64}
                    cy={64}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-3xl font-bold font-mono text-white">{score.toFixed(0)}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider">Score</p>
            </div>
        </div>
    )
}

export default function CompliancePage() {
    const [report, setReport] = useState<ComplianceReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabKey>('all')

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch('/api/compliance/reports')
                if (!res.ok) throw new Error('Failed to fetch compliance report')
                const json = await res.json()
                setReport(json.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load report')
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [])

    const filteredIssues = report?.issues.filter((issue) =>
        activeTab === 'all' ? true : issue.type === activeTab
    ) ?? []

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Compliance</h1>
                <p className="mt-1 text-sm text-muted">
                    METRC traceability and batch compliance gap analysis
                </p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-accent-error/30 bg-accent-error/5 px-4 py-3">
                    <p className="text-sm text-accent-error">{error}</p>
                </div>
            )}

            {report && !loading && (
                <>
                    {/* Score + Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Score ring */}
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-surface-card p-6">
                            <ScoreRing score={report.score} />
                            <p className="mt-3 text-xs text-muted">
                                {report.totalBatches} batch{report.totalBatches !== 1 ? 'es' : ''} analyzed
                            </p>
                        </div>

                        {/* Summary cards */}
                        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Missing UIDs', count: report.summary.missingUids, color: 'text-accent-error', bg: 'bg-accent-error/10' },
                                { label: 'Incomplete Sign-offs', count: report.summary.incompleteSignoffs, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
                                { label: 'Missing QA', count: report.summary.missingQa, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
                                { label: 'Total Issues', count: report.totalIssues, color: report.totalIssues === 0 ? 'text-hash-complete' : 'text-accent-error', bg: report.totalIssues === 0 ? 'bg-hash-complete/10' : 'bg-accent-error/10' },
                            ].map((card) => (
                                <div
                                    key={card.label}
                                    className="rounded-xl border border-white/5 bg-surface-card p-4"
                                >
                                    <p className="text-xs text-muted">{card.label}</p>
                                    <p className={cn('mt-1 text-2xl font-bold font-mono', card.color)}>
                                        {card.count}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-px">
                        {TABS.map((tab) => {
                            const count = tab.key === 'all'
                                ? report.totalIssues
                                : report.issues.filter((i) => i.type === tab.key).length
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        'flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors border-b-2',
                                        activeTab === tab.key
                                            ? 'border-primary text-white'
                                            : 'border-transparent text-muted hover:text-white'
                                    )}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Issue List */}
                    {filteredIssues.length > 0 ? (
                        <div className="space-y-2">
                            {filteredIssues.map((issue, i) => (
                                <ComplianceCard key={`${issue.batchId}-${issue.type}-${i}`} issue={issue} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hash-complete/10">
                                <ShieldCheck className="h-8 w-8 text-hash-complete" />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-white">
                                {activeTab === 'all' ? 'All batches compliant' : 'No issues in this category'}
                            </h2>
                            <p className="mt-1 max-w-sm text-sm text-muted">
                                {activeTab === 'all'
                                    ? 'All tracked batches have complete METRC traceability, QA allocations, and sign-offs.'
                                    : 'Switch to another category or check "All Issues" for the full picture.'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
