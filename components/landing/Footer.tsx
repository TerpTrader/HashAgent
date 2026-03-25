import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

const columns = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'AI Assistant', href: '#features' },
            { label: 'Equipment', href: '#features' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Terms', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Compliance', href: '/compliance' },
        ],
    },
]

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] py-12 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand column */}
                    <div className="col-span-2 sm:col-span-1">
                        <Logo size="sm" href="/" />
                        <p className="text-xs text-[#9ca3af] mt-3 max-w-[200px] leading-relaxed">
                            AI-powered hash lab management for solventless concentrate manufacturers.
                        </p>
                    </div>

                    {/* Nav columns */}
                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                                {col.title}
                            </h4>
                            <ul className="space-y-2">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-xs text-[#9ca3af] hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#9ca3af]/60">
                        &copy; 2026 Hash Agent. A TerpAgent product.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Social placeholders */}
                        <span className="text-xs text-[#9ca3af]/40 hover:text-[#9ca3af] transition-colors cursor-pointer">
                            Twitter
                        </span>
                        <span className="text-xs text-[#9ca3af]/40 hover:text-[#9ca3af] transition-colors cursor-pointer">
                            Discord
                        </span>
                        <span className="text-xs text-[#9ca3af]/40 hover:text-[#9ca3af] transition-colors cursor-pointer">
                            GitHub
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
