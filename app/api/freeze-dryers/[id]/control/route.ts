import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { canControlEquipment } from '@/lib/rbac'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/freeze-dryers/[id]/control — Send command to a freeze dryer
// Commands: start_batch, stop_batch, add_time, acknowledge_error
// ═══════════════════════════════════════════════════════════════════════════

const commandSchema = z.object({
    command: z.enum(['start_batch', 'stop_batch', 'add_time', 'acknowledge_error']),
    batchName: z.string().optional(),
    minutes: z.number().min(1).max(480).optional(),
})

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RBAC: check equipment control permission
    if (!canControlEquipment(session.role as 'OWNER' | 'ADMIN' | 'GROWER' | 'VIEWER' | null)) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = commandSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid command', details: parsed.error.flatten() }, { status: 400 })
    }

    // Verify ownership
    const dryer = await db.freezeDryer.findFirst({
        where: { id: params.id, orgId: session.orgId },
    })
    if (!dryer) {
        return NextResponse.json({ error: 'Freeze dryer not found' }, { status: 404 })
    }

    if (!dryer.isOnline) {
        return NextResponse.json({ error: 'Freeze dryer is offline' }, { status: 409 })
    }

    const { command, batchName, minutes } = parsed.data

    // TODO_CAPTURE: Implement actual MQTT publish after Fiddler capture
    // For now, log the command and update state optimistically
    switch (command) {
        case 'start_batch':
            await db.freezeDryer.update({
                where: { id: params.id },
                data: {
                    currentPhase: 'FREEZING',
                    batchStartedAt: new Date(),
                    batchProgress: 0,
                },
            })
            break

        case 'stop_batch':
            await db.freezeDryer.update({
                where: { id: params.id },
                data: {
                    currentPhase: 'IDLE',
                    batchStartedAt: null,
                    batchProgress: null,
                },
            })
            break

        case 'add_time':
            // No state change needed — the machine handles this
            break

        case 'acknowledge_error':
            // Clear error alerts for this machine
            await db.haAlert.updateMany({
                where: {
                    freezeDryerId: params.id,
                    category: 'ERROR',
                    status: 'ACTIVE',
                },
                data: {
                    status: 'ACKNOWLEDGED',
                    acknowledgedAt: new Date(),
                    acknowledgedBy: session.user?.id ?? 'unknown',
                },
            })
            break
    }

    // Log the command for audit trail
    await db.haEquipmentMaintenanceLog.create({
        data: {
            orgId: session.orgId,
            category: 'FREEZE_DRYER',
            equipmentId: params.id,
            equipmentType: 'freeze_dryer',
            equipmentName: dryer.name,
            date: new Date(),
            description: `Remote command: ${command}${batchName ? ` (${batchName})` : ''}${minutes ? ` (+${minutes}min)` : ''}`,
            performedBy: session.user?.name ?? session.user?.email ?? 'Unknown',
        },
    })

    return NextResponse.json({
        data: {
            success: true,
            command,
            note: 'Command logged. MQTT publish pending Fiddler capture confirmation.',
        },
    })
}
