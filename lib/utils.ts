import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════════════════════════════
// HASH AGENT — UNIT CONVERSIONS
// ═══════════════════════════════════════════════════════════════════════════

const LBS_TO_KG = 0.453592
const KG_TO_G = 1000

export function lbsToGrams(lbs: number): number {
    return lbs * LBS_TO_KG * KG_TO_G
}

export function gramsToLbs(grams: number): number {
    return grams / (LBS_TO_KG * KG_TO_G)
}

export function lbsToKg(lbs: number): number {
    return lbs * LBS_TO_KG
}

// ═══════════════════════════════════════════════════════════════════════════
// YIELD CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateYieldPct(outputGrams: number, inputGrams: number): number {
    if (inputGrams <= 0) return 0
    return (outputGrams / inputGrams) * 100
}

export function calculateTotalMicronYield(yields: {
    yield160u?: number | null
    yield120u?: number | null
    yield90u?: number | null
    yield73u?: number | null
    yield45u?: number | null
    yield25u?: number | null
}): number {
    return (
        (yields.yield160u ?? 0) +
        (yields.yield120u ?? 0) +
        (yields.yield90u ?? 0) +
        (yields.yield73u ?? 0) +
        (yields.yield45u ?? 0) +
        (yields.yield25u ?? 0)
    )
}

export function calculateRosinChipEstimate(hashWeightG: number, bagSizeG: number = 30): number {
    // Estimate number of rosin bags: hash weight / ~25-35g per bag
    if (bagSizeG <= 0) return 0
    return hashWeightG / bagSizeG
}

export function calculateRosinChipWasteG(chipCount: number, chipWeightG: number = 5.83): number {
    // Each rosin "chip" weighs approximately 5.83g
    return chipCount * chipWeightG
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH NUMBER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export function generateHashBatchNumber(sequence: number): string {
    return `BMR-${String(sequence).padStart(3, '0')}-BH`
}

export function generateRosinBatchNumber(sequence: number): string {
    return `BMR-${String(sequence).padStart(3, '0')}-R`
}

export function generatePressedBatchNumber(sequence: number): string {
    return `MBR-PH-${String(sequence).padStart(3, '0')}`
}

export function generateCleaningLogNumber(sequence: number): string {
    return `CL-${String(sequence)}`
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH ID GENERATION (e.g. HHC-WTR-BH-210227)
// ═══════════════════════════════════════════════════════════════════════════

export function generateBatchId(
    prefix: string,
    strainAbbrev: string,
    type: 'BH' | 'R' | 'PH',
    date: Date
): string {
    const dateStr = [
        String(date.getFullYear()).slice(-2),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('')
    return `${prefix}-${strainAbbrev}-${type}-${dateStr}`
}

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY TIER SUGGESTION
// Based on micron distribution analysis from the uploaded batch records
// ═══════════════════════════════════════════════════════════════════════════

export function suggestQualityTier(yields: {
    yield160u?: number | null
    yield120u?: number | null
    yield90u?: number | null
    yield73u?: number | null
    yield45u?: number | null
}): 'TIER_1' | 'TIER_2' | 'TIER_3' {
    const total = calculateTotalMicronYield(yields)
    if (total <= 0) return 'TIER_3'

    const premium = (yields.yield90u ?? 0) + (yields.yield73u ?? 0)
    const premiumRatio = premium / total

    // Tier 1: >60% in 73u + 90u (full melt territory)
    if (premiumRatio > 0.6) return 'TIER_1'
    // Tier 2: >35% in 73u + 90u
    if (premiumRatio > 0.35) return 'TIER_2'
    // Tier 3: everything else
    return 'TIER_3'
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════════════════════════════════════

export function formatWeight(grams: number | null | undefined, decimals: number = 1): string {
    if (grams == null) return '—'
    return `${grams.toFixed(decimals)}g`
}

export function formatPercent(pct: number | null | undefined, decimals: number = 2): string {
    if (pct == null) return '—'
    return `${pct.toFixed(decimals)}%`
}

export function formatTemp(tempF: number | null | undefined): string {
    if (tempF == null) return '—'
    return `${tempF.toFixed(1)}°F`
}

export function formatPressure(mTorr: number | null | undefined): string {
    if (mTorr == null) return '—'
    return `${Math.round(mTorr)} mTorr`
}
