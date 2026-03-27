import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PressedBatchList } from '@/components/pressed/PressedBatchList'

export const metadata = {
    title: 'Pressed Hash',
}

export default async function PressedPage() {
    const session = await auth()
    if (!session?.orgId) redirect('/login')

    return <PressedBatchList />
}
