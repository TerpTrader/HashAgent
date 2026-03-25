import { type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { ScrollReveal } from '@/components/landing/ScrollReveal'

type ProductShowcaseProps = {
    sectionNumber: string
    subtitle: string
    title: string
    description: string
    features: string[]
    mockupContent: ReactNode
    reversed?: boolean
}

export function ProductShowcase({
    sectionNumber,
    subtitle,
    title,
    description,
    features,
    mockupContent,
    reversed = false,
}: ProductShowcaseProps) {
    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Giant section number */}
                    <span className="absolute -top-8 left-0 text-[80px] sm:text-[100px] font-bold leading-none text-white/[0.03] pointer-events-none select-none">
                        {sectionNumber}
                    </span>

                    {/* Text column */}
                    <ScrollReveal className={reversed ? 'lg:order-2' : ''}>
                        <div className="space-y-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                                {subtitle}
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                {title}
                            </h2>
                            <p className="text-base text-[#9ca3af] leading-relaxed max-w-md">
                                {description}
                            </p>
                            <ul className="space-y-2.5 pt-2">
                                {features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-[#9ca3af]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Mockup column */}
                    <ScrollReveal delay={0.1} className={reversed ? 'lg:order-1' : ''}>
                        <div className="glass-card p-1">
                            {mockupContent}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}

/* ─── Showcase Mockup: Batch Intelligence ─────────────────────── */
export function BatchMockup() {
    const microns = [
        { grade: '160\u03bc', weight: '18.4g', pct: '0.6%', quality: 3, width: '14%' },
        { grade: '120\u03bc', weight: '31.2g', pct: '1.0%', quality: 4, width: '24%' },
        { grade: '90\u03bc', weight: '42.8g', pct: '1.3%', quality: 5, width: '33%' },
        { grade: '73\u03bc', weight: '58.1g', pct: '1.8%', quality: 6, width: '45%' },
        { grade: '45\u03bc', weight: '22.6g', pct: '0.7%', quality: 4, width: '17%' },
        { grade: '25\u03bc', weight: '9.3g', pct: '0.3%', quality: 2, width: '7%' },
    ]

    return (
        <div className="mockup-frame">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
                </div>
                <span className="text-[10px] font-mono text-[#9ca3af]/60 ml-2">
                    Batch GMO #47 — Micron Breakdown
                </span>
            </div>
            <div className="p-4 space-y-2">
                {/* Summary header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-[11px] font-medium text-white">GMO #47</div>
                        <div className="text-[9px] font-mono text-[#9ca3af]/60">3,200g fresh frozen &middot; 6 wash passes</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[14px] font-bold font-mono text-primary">5.7%</div>
                        <div className="text-[8px] font-mono text-[#9ca3af]/50 uppercase">Total Yield</div>
                    </div>
                </div>

                {/* Micron rows */}
                {microns.map((m) => (
                    <div key={m.grade} className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[#9ca3af]/70 w-8 text-right">{m.grade}</span>
                        <div className="flex-1 h-3 bg-white/[0.03] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary/80 rounded-full"
                                style={{ width: m.width }}
                            />
                        </div>
                        <span className="text-[9px] font-mono text-white/70 w-10 text-right">{m.weight}</span>
                        <span className="text-[9px] font-mono text-primary/70 w-8 text-right">{m.pct}</span>
                        <span className="text-[8px] text-amber-400">
                            {'★'.repeat(m.quality)}
                            <span className="text-white/10">{'★'.repeat(6 - m.quality)}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── Showcase Mockup: Equipment Monitoring ────────────────────── */
export function EquipmentMockup() {
    const gauges = [
        { label: 'Shelf Temp', value: '-42\u00b0F', status: 'nominal', pct: 35 },
        { label: 'Vacuum', value: '0.12 mBar', status: 'nominal', pct: 88 },
        { label: 'Condenser', value: '-85\u00b0F', status: 'nominal', pct: 22 },
    ]

    return (
        <div className="mockup-frame">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
                </div>
                <span className="text-[10px] font-mono text-[#9ca3af]/60 ml-2">
                    Freeze Dryer #3 — Live Telemetry
                </span>
            </div>
            <div className="p-4 space-y-4">
                {/* Status header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-machine-running animate-pulse" />
                        <span className="text-[11px] font-medium text-white">Harvest Right Pro</span>
                    </div>
                    <div className="text-[9px] font-mono text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                        CYCLE 3 OF 4
                    </div>
                </div>

                {/* Time remaining */}
                <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-[#9ca3af]/60 uppercase tracking-wider">Cycle Progress</span>
                        <span className="text-[10px] font-mono text-white/70">18h 42m remaining</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/70 rounded-full" style={{ width: '62%' }} />
                    </div>
                </div>

                {/* Gauges */}
                <div className="grid grid-cols-3 gap-2">
                    {gauges.map((g) => (
                        <div key={g.label} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
                            <div className="text-[8px] font-mono text-[#9ca3af]/50 uppercase tracking-wider">{g.label}</div>
                            <div className="text-[14px] font-bold font-mono text-white mt-1">{g.value}</div>
                            {/* Mini gauge arc */}
                            <div className="relative mx-auto mt-2 w-10 h-5 overflow-hidden">
                                <div className="absolute inset-0 border-2 border-white/[0.06] rounded-t-full" />
                                <div
                                    className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-primary origin-bottom rounded-full"
                                    style={{
                                        transform: `translateX(-50%) rotate(${(g.pct / 100) * 180 - 90}deg)`,
                                    }}
                                />
                            </div>
                            <div className="text-[7px] font-mono text-emerald-400/70 mt-1 uppercase">{g.status}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
