export function DashboardMockup() {
    const bars = [
        { label: 'GMO', height: '72%', opacity: 1 },
        { label: 'Papaya', height: '58%', opacity: 0.8 },
        { label: 'Zkittlez', height: '65%', opacity: 0.9 },
        { label: 'Runtz', height: '48%', opacity: 0.7 },
        { label: 'GelT', height: '52%', opacity: 0.75 },
    ]

    return (
        <div className="mockup-frame animate-float">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
                </div>
                <span className="text-[10px] font-mono text-[#9ca3af]/60 ml-2">
                    Hash Agent — Dashboard
                </span>
            </div>

            {/* Content area */}
            <div className="p-4 space-y-3">
                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5">
                        <div className="text-[9px] font-mono text-[#9ca3af]/70 uppercase tracking-wider">Active Batches</div>
                        <div className="text-[18px] font-bold text-white mt-0.5 font-mono">12</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5">
                        <div className="text-[9px] font-mono text-[#9ca3af]/70 uppercase tracking-wider">Avg Yield</div>
                        <div className="text-[18px] font-bold text-primary mt-0.5 font-mono">4.2%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5">
                        <div className="text-[9px] font-mono text-[#9ca3af]/70 uppercase tracking-wider">Equipment</div>
                        <div className="text-[18px] font-bold text-white mt-0.5 font-mono">8/8</div>
                    </div>
                </div>

                {/* Mini bar chart */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                    <div className="text-[9px] font-mono text-[#9ca3af]/60 uppercase tracking-wider mb-3">
                        Yield by Strain
                    </div>
                    <div className="flex items-end gap-2 h-[60px]">
                        {bars.map((bar) => (
                            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full rounded-t-sm"
                                    style={{
                                        height: bar.height,
                                        backgroundColor: `rgba(20, 184, 166, ${bar.opacity})`,
                                    }}
                                />
                                <span className="text-[7px] font-mono text-[#9ca3af]/50">{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent batch row */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-hash-drying animate-pulse" />
                        <span className="text-[10px] font-mono text-white">GMO #47</span>
                        <span className="text-[10px] font-mono text-[#9ca3af]/60">— 2,847g</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-hash-drying">Drying</span>
                        <span className="text-[10px] text-amber-400">★★★★★</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
