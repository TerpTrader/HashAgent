import { HashAgentChat } from '@/components/ai/HashAgentChat'

const SUGGESTED_PROMPTS = [
    'Start a new wash',
    'Check freeze dryer status',
    'Show my best yielding strains',
    'Log rosin press results',
]

export default function AIPage() {
    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h1 className="text-2xl font-semibold text-white">Hash Agent AI</h1>
                <p className="mt-1 text-sm text-muted">
                    Your intelligent assistant for managing the hash lab.
                </p>
            </div>

            <HashAgentChat suggestedPrompts={SUGGESTED_PROMPTS} />
        </div>
    )
}
