import { Logo } from '@/components/shared/Logo'

const messages = [
    {
        role: 'user' as const,
        text: "Log today's GMO wash — 3,200g fresh frozen",
    },
    {
        role: 'ai' as const,
        text: 'Created batch GMO #48. \u2713 3,200g fresh frozen logged. Ready to enter micron yields when freeze drying is complete.',
    },
    {
        role: 'user' as const,
        text: "What's my average yield on GMO?",
    },
    {
        role: 'ai' as const,
        text: 'Your GMO average across 12 washes: 4.3% total yield. 73\u03bc grade averages 1.8% \u2014 your strongest micron.',
    },
]

export function ChatMockup() {
    return (
        <div className="mockup-frame">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
                <Logo size="sm" showText={false} />
                <span className="text-[11px] font-medium text-white">Hash Agent</span>
                <span className="flex items-center gap-1 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-[#9ca3af]/70">Online</span>
                </span>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-2.5">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-3 py-2 text-[11px] leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-teal-600/20 border border-teal-500/20 rounded-2xl rounded-br-md text-white/90'
                                    : 'bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-bl-md text-[#9ca3af]'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input area */}
            <div className="px-3 pb-3">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                    <span className="text-[10px] text-[#9ca3af]/40 flex-1">Ask Hash Agent...</span>
                    <span className="text-[10px] text-primary/50">&#8593;</span>
                </div>
            </div>
        </div>
    )
}
