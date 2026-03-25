import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = {
    title: 'Admin | Hash Agent',
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    if (!session.user.email || !isAdminEmail(session.user.email)) {
        redirect('/dashboard')
    }

    return (
        <AdminShell
            userName={session.user.name ?? 'Admin'}
            userEmail={session.user.email}
        >
            {children}
        </AdminShell>
    )
}
