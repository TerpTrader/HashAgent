import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
    console.log('Seeding Hash Agent database...')

    // Create test user
    const hashedPassword = await bcrypt.hash('hashagent123', 12)
    const user = await db.user.upsert({
        where: { email: 'leo@hashagent.io' },
        update: {},
        create: {
            email: 'leo@hashagent.io',
            name: 'Leo',
            hashedPassword,
            emailVerified: new Date(),
        },
    })
    console.log('  User:', user.email)

    // Create organization
    const org = await db.organization.upsert({
        where: { id: 'seed-org-001' },
        update: {},
        create: {
            id: 'seed-org-001',
            name: 'Hash Heaven Co.',
            plan: 'PRO',
        },
    })
    console.log('  Org:', org.name)

    // Link user to org
    await db.orgMember.upsert({
        where: { orgId_userId: { orgId: org.id, userId: user.id } },
        update: {},
        create: {
            orgId: org.id,
            userId: user.id,
            role: 'OWNER',
        },
    })

    // Create freeze dryers
    const dryers = await Promise.all([
        db.freezeDryer.upsert({
            where: { id: 'fd-alpha' },
            update: {},
            create: {
                id: 'fd-alpha',
                orgId: org.id,
                name: 'HR-01',
                callsign: 'ALPHA',
                model: 'HRFD-PLrg-SS-Pharm',
                serial: 'Aug20 P-LFD 00771 PH',
                pumpModel: 'YTP550-4C16A',
                isOnline: true,
                currentPhase: 'IDLE',
            },
        }),
        db.freezeDryer.upsert({
            where: { id: 'fd-bravo' },
            update: {},
            create: {
                id: 'fd-bravo',
                orgId: org.id,
                name: 'HR-02',
                callsign: 'BRAVO',
                model: 'HRFD-PLrg-SS-Pharm',
                serial: 'Sep21 P-LFD 01105 PH',
                pumpModel: 'YTP550-4C16A',
                isOnline: false,
                currentPhase: 'IDLE',
            },
        }),
    ])
    console.log('  Freeze dryers:', dryers.length)

    // Create hash batches with realistic data
    const batches = [
        {
            id: 'hb-001',
            strain: 'GMO Cookies',
            batchNumber: 'BMR-001-BH',
            washDate: new Date('2026-03-10'),
            materialState: 'FRESH_FROZEN' as const,
            materialGrade: 'BUDS' as const,
            farmSource: 'Emerald Valley Farms',
            rawMaterialWeightG: 4536,
            rawMaterialWeightLb: 10,
            yield160u: 12.5,
            yield120u: 28.3,
            yield90u: 95.7,
            yield73u: 142.1,
            yield45u: 38.4,
            yield25u: 8.2,
            totalYieldG: 325.2,
            yieldPct: 7.17,
            qualityTier: 'TIER_1' as const,
            status: 'COMPLETE' as const,
            allocRosin: 180,
            allocPackaged: 80,
            allocQa: 10,
            allocPressed: 40,
            allocLossG: 15.2,
            processedBy: 'Leo',
            verifiedBy: 'Marcus',
        },
        {
            id: 'hb-002',
            strain: 'Papaya',
            batchNumber: 'BMR-002-BH',
            washDate: new Date('2026-03-15'),
            materialState: 'FRESH_FROZEN' as const,
            materialGrade: 'WHOLE_PLANT' as const,
            farmSource: 'Sunset Ridge',
            rawMaterialWeightG: 6804,
            rawMaterialWeightLb: 15,
            yield160u: 18.1,
            yield120u: 42.6,
            yield90u: 128.3,
            yield73u: 198.5,
            yield45u: 52.1,
            yield25u: 11.7,
            totalYieldG: 451.3,
            yieldPct: 6.63,
            qualityTier: 'TIER_1' as const,
            status: 'ALLOCATED' as const,
            allocRosin: 250,
            allocPackaged: 120,
            allocQa: 15,
            allocPressed: 50,
            allocLossG: 16.3,
            processedBy: 'Leo',
            verifiedBy: 'Marcus',
        },
        {
            id: 'hb-003',
            strain: 'Zkittlez',
            batchNumber: 'BMR-003-BH',
            washDate: new Date('2026-03-20'),
            materialState: 'FRESH_FROZEN' as const,
            materialGrade: 'SMALLS' as const,
            farmSource: 'Emerald Valley Farms',
            rawMaterialWeightG: 3402,
            rawMaterialWeightLb: 7.5,
            status: 'DRYING' as const,
            freezeDryerId: 'fd-alpha',
            processedBy: 'Leo',
        },
    ]

    for (const batch of batches) {
        await db.hashBatch.upsert({
            where: { id: batch.id },
            update: {},
            create: { orgId: org.id, ...batch },
        })
    }
    console.log('  Hash batches:', batches.length)

    // Create rosin batches
    const rosinBatches = [
        {
            id: 'rb-001',
            strain: 'GMO Cookies',
            batchNumber: 'BMR-001-R',
            sourceHashBatchId: 'hb-001',
            processDate: new Date('2026-03-14'),
            productType: 'LIVE_ROSIN' as const,
            micron90uWeightG: 60,
            micron73uWeightG: 100,
            micron45uWeightG: 20,
            totalHashWeightG: 180,
            rosinYieldWeightG: 135.2,
            rosinYieldPct: 75.1,
            consistency: 'Badder',
            status: 'COMPLETE' as const,
            rosinProcessedBy: 'Leo',
        },
        {
            id: 'rb-002',
            strain: 'Papaya',
            batchNumber: 'BMR-002-R',
            sourceHashBatchId: 'hb-002',
            processDate: new Date('2026-03-19'),
            productType: 'COLD_CURE' as const,
            micron90uWeightG: 80,
            micron73uWeightG: 130,
            micron45uWeightG: 40,
            totalHashWeightG: 250,
            rosinYieldWeightG: 192.5,
            rosinYieldPct: 77.0,
            consistency: 'Cold Cure Jam',
            status: 'COMPLETE' as const,
            rosinProcessedBy: 'Leo',
        },
    ]

    for (const batch of rosinBatches) {
        await db.rosinBatch.upsert({
            where: { id: batch.id },
            update: {},
            create: { orgId: org.id, ...batch },
        })
    }
    console.log('  Rosin batches:', rosinBatches.length)

    // Create water filtration system
    await db.waterFiltrationSystem.upsert({
        where: { id: 'wfs-001' },
        update: {},
        create: {
            id: 'wfs-001',
            orgId: org.id,
            name: '2-Stage DI System',
            model: 'HydroLogic Evolution RO',
            sedimentFilterDate: new Date('2026-02-15'),
            carbonFilterDate: new Date('2026-01-10'),
            preFilterDate: new Date('2026-03-01'),
        },
    })
    console.log('  Water filtration: 1')

    console.log('\nSeed complete!')
    console.log('Login: leo@hashagent.io / hashagent123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
