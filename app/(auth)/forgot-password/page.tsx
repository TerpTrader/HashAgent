import Link from 'next/link'

export const metadata = { title: 'Reset Password' }

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8 text-center">
                <div>
                    <Link href="/" className="text-2xl font-semibold text-white">
                        Hash Agent
                    </Link>
                    <p className="text-sm text-muted mt-2">Reset your password</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-card p-6">
                    <p className="text-sm text-muted">
                        Password reset is coming soon. For now, contact your admin to reset your password.
                    </p>
                </div>
                <p className="text-xs text-muted">
                    <Link href="/login" className="text-primary hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
