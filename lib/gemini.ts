/**
 * Hash Agent — Gemini Service Layer
 * Wrapper for Google Gemini 2.5 Flash with chat + vision support
 */
import {
    GoogleGenerativeAI,
    type Content,
    type Part,
    type Tool,
} from '@google/generative-ai'

// ── Constants ──────────────────────────────────────────────────────────────
export const MODEL_ID = 'gemini-2.5-flash' as const

// Pricing per 1M tokens
const INPUT_COST_PER_MILLION = 0.30
const OUTPUT_COST_PER_MILLION = 2.50

// ── Initialize SDK ─────────────────────────────────────────────────────────
function getClient() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        throw new Error('GEMINI_API_KEY not configured. Add your key to .env.local')
    }
    return new GoogleGenerativeAI(apiKey)
}

// ── Cost Calculation ───────────────────────────────────────────────────────
export function calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * INPUT_COST_PER_MILLION + outputTokens * OUTPUT_COST_PER_MILLION) / 1_000_000
}

// ── Chat Message Type ──────────────────────────────────────────────────────
export interface ChatMessage {
    role: 'user' | 'model'
    parts: Part[]
}

// ── Core: Chat with Function Calling ───────────────────────────────────────
export async function geminiChat(
    messages: ChatMessage[],
    systemPrompt: string,
    tools?: Tool[],
): Promise<{
    text: string
    functionCalls: Array<{ name: string; args: Record<string, unknown> }>
    inputTokens: number
    outputTokens: number
}> {
    try {
        const ai = getClient()
        const model = ai.getGenerativeModel({
            model: MODEL_ID,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096,
            },
            ...(tools ? { tools } : {}),
        })

        // Use generateContent with full contents array
        // (startChat's validateChatHistory rejects functionResponse parts under role:'user')
        const response = await model.generateContent({
            contents: messages as Content[],
        })
        const result = response.response
        const usage = result.usageMetadata

        // Extract function calls
        const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = []
        for (const candidate of result.candidates ?? []) {
            for (const part of candidate.content?.parts ?? []) {
                if (part.functionCall) {
                    functionCalls.push({
                        name: part.functionCall.name,
                        args: (part.functionCall.args as Record<string, unknown>) ?? {},
                    })
                }
            }
        }

        return {
            text: result.text() ?? '',
            functionCalls,
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown Gemini error'
        return {
            text: `I encountered an error: ${message}. Please try again.`,
            functionCalls: [],
            inputTokens: 0,
            outputTokens: 0,
        }
    }
}

// ── Core: Vision (Image Analysis / OCR) ────────────────────────────────────
export async function geminiVision(
    imageBase64: string,
    prompt: string,
): Promise<string> {
    try {
        const ai = getClient()
        const model = ai.getGenerativeModel({
            model: MODEL_ID,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024,
            },
        })

        const imagePart: Part = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            },
        }
        const textPart: Part = { text: prompt }

        const response = await model.generateContent([textPart, imagePart])
        return response.response.text() ?? ''
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Vision processing failed'
        return `Error reading image: ${message}`
    }
}
