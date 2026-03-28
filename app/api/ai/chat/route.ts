import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { geminiChat, geminiVision, calculateCost, type ChatMessage } from '@/lib/gemini'
import { toolDeclarations, executeTool } from '@/lib/ai-tools'
import { type Tool } from '@google/generative-ai'

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Hash Agent — an AI assistant for solventless concentrate manufacturing.
You are the primary interface for managing a hash lab. Users run their entire operation through you.

Your expertise:
- Bubble hash: ice water extraction, micron grades (160μ, 120μ, 90μ, 73μ, 45μ, 25μ), yield optimization
- Rosin: temperature, pressure, bag size, yield %, decarb processing
- Freeze drying: Harvest Right machines, vacuum pressure (mTorr), shelf temperature, drying endpoints
- Equipment maintenance: freeze dryer care, water filtration, pump maintenance
- METRC compliance: UID tracking, batch traceability, California regulations
- Quality grading: 1-6 star system, tier classification based on micron distribution

When users want to log data, use your tools to create/update records directly.
When users upload scale photos, use process_weight_image to read the weight.
Always confirm values before writing: "I see 2,847g on the scale. Is that correct?"
Use cultivation vocabulary: strain not product, wash not process, micron not filter size.
Be concise. Hash makers are busy. Don't over-explain unless asked.`

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/ai/chat
// ═══════════════════════════════════════════════════════════════════════════

const MAX_TOOL_LOOPS = 5

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.orgId || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = session.orgId
    const userId = session.user.id

    let body: { message: string; sessionId?: string; imageBase64?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { message, imageBase64 } = body
    if (!message?.trim() && !imageBase64) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // ── Session Management ──────────────────────────────────────────────
    let sessionId = body.sessionId

    try {
        if (!sessionId) {
            const aiSession = await db.haAiSession.create({
                data: { orgId, userId },
            })
            sessionId = aiSession.id
        } else {
            // Verify session belongs to this org
            const existing = await db.haAiSession.findFirst({
                where: { id: sessionId, orgId },
            })
            if (!existing) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 })
            }
        }
    } catch (err) {
        console.error('Failed to manage AI session:', err)
        return NextResponse.json({ error: 'Failed to manage AI session' }, { status: 500 })
    }

    // ── Save User Message ───────────────────────────────────────────────
    try {
        await db.haAiMessage.create({
            data: {
                sessionId,
                role: 'user',
                content: message ?? '',
                imageUrl: imageBase64 ? 'inline-base64' : undefined,
            },
        })
    } catch (err) {
        console.error('Failed to save user message:', err)
        return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 })
    }

    // ── Build Message History ───────────────────────────────────────────
    let recentMessages
    try {
        recentMessages = await db.haAiMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            take: 20,
        })
    } catch (err) {
        console.error('Failed to fetch message history:', err)
        return NextResponse.json({ error: 'Failed to fetch message history' }, { status: 500 })
    }

    // Convert to Gemini format
    const geminiMessages: ChatMessage[] = recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: msg.role === 'user' && msg.imageUrl === 'inline-base64' && imageBase64 && msg === recentMessages[recentMessages.length - 1]
            ? [
                { text: msg.content || 'What weight does this scale show?' },
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            ]
            : [{ text: msg.content }],
    }))

    // ── Gemini Tools ────────────────────────────────────────────────────
    const tools: Tool[] = [{
        functionDeclarations: toolDeclarations,
    }]

    // ── Call Gemini with Tool Loop ──────────────────────────────────────
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let finalText = ''
    let currentMessages = [...geminiMessages]

    try {
        for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
            const result = await geminiChat(currentMessages, SYSTEM_PROMPT, tools)
            totalInputTokens += result.inputTokens
            totalOutputTokens += result.outputTokens

            if (result.functionCalls.length === 0) {
                // No more tool calls — we have the final response
                finalText = result.text
                break
            }

            // Execute tool calls
            const toolResults: Array<{ name: string; result: string }> = []
            for (const call of result.functionCalls) {
                const toolResult = await executeTool(orgId, call.name, call.args)
                toolResults.push({ name: call.name, result: toolResult })
            }

            // Append model's function call message
            currentMessages.push({
                role: 'model',
                parts: result.functionCalls.map(call => ({
                    functionCall: { name: call.name, args: call.args },
                })),
            })

            // Append function results
            currentMessages.push({
                role: 'user',
                parts: toolResults.map(tr => ({
                    functionResponse: {
                        name: tr.name,
                        response: { result: tr.result },
                    },
                })),
            })

            // If this is the last loop, set whatever text we have
            if (loop === MAX_TOOL_LOOPS - 1) {
                finalText = result.text || 'I completed the operations. Let me know if you need anything else.'
            }
        }
    } catch (err) {
        console.error('Failed during AI chat loop:', err)
        return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 })
    }

    // ── Save Assistant Message ──────────────────────────────────────────
    const cost = calculateCost(totalInputTokens, totalOutputTokens)

    try {
        await db.haAiMessage.create({
            data: {
                sessionId,
                role: 'assistant',
                content: finalText,
                tokenCount: totalInputTokens + totalOutputTokens,
                costUsd: cost,
            },
        })

        // Update session totals
        await db.haAiSession.update({
            where: { id: sessionId },
            data: {
                totalTokenCount: { increment: totalInputTokens + totalOutputTokens },
                totalCostUsd: { increment: cost },
            },
        })
    } catch (err) {
        console.error('Failed to save assistant message:', err)
        // Don't fail the request — the user already got a response from AI
    }

    return NextResponse.json({
        message: finalText,
        sessionId,
    })
}
