import Image from 'next/image'
import Link from 'next/link'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<LogoSize, { icon: number; text: string }> = {
    sm: { icon: 24, text: 'text-sm' },
    md: { icon: 32, text: 'text-lg' },
    lg: { icon: 40, text: 'text-xl' },
    xl: { icon: 56, text: 'text-3xl' },
}

type LogoProps = {
    size?: LogoSize
    showText?: boolean
    href?: string
    className?: string
}

export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
    const { icon, text } = sizes[size]

    const content = (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <Image
                src="/logo.png"
                alt="Hash Agent"
                width={icon}
                height={icon}
                className="flex-shrink-0"
                priority
            />
            {showText && (
                <span className={`font-semibold text-white ${text}`}>
                    Hash Agent
                </span>
            )}
        </span>
    )

    if (href) {
        return (
            <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
                {content}
            </Link>
        )
    }

    return content
}
