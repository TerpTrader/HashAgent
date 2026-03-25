'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownMessageProps = {
    content: string
}

/**
 * Shared markdown renderer for AI responses.
 * Dark-themed prose with GFM support (tables, strikethrough, task lists).
 * Used by both HashAgentPopup and the full-page HashAgentChat.
 */
export function MarkdownMessage({ content }: MarkdownMessageProps) {
    return (
        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-white/5 [&_pre]:rounded-lg [&_pre]:p-3 [&_table]:text-xs [&_blockquote]:border-primary/30 [&_blockquote]:text-muted [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_hr]:border-white/10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
