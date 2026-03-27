import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { HashBatchList } from '@/components/batches/HashBatchList'

export const metadata = {
    title: 'Bubble Hash Batches',
}

export default async function BatchesPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    return <HashBatchList />
}
