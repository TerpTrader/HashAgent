import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RosinBatchList } from '@/components/rosin/RosinBatchList'

export const metadata = {
    title: 'Rosin Batches',
}

export default async function RosinListPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    return <RosinBatchList />
}
