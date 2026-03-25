'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
        e.preventDefault()
        setMobileOpen(false)
        const target = document.querySelector(href)
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06]'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                {/* Left: Logo */}
                <Logo size="md" href="/" />

                {/* Center: Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleAnchorClick(e, link.href)}
                            className="text-sm text-[#9ca3af] hover:text-white transition-colors duration-200"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right: Auth actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm text-[#9ca3af] hover:text-white transition-colors duration-200"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-5 py-2 rounded-lg transition-all duration-200 hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-[#9ca3af] hover:text-white transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="dropdown-enter md:hidden absolute top-16 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06]">
                    <div className="px-6 py-4 flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleAnchorClick(e, link.href)}
                                className="text-sm text-[#9ca3af] hover:text-white transition-colors py-2"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="border-t border-white/[0.06] my-1" />
                        <Link
                            href="/login"
                            className="text-sm text-[#9ca3af] hover:text-white transition-colors py-2"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-medium text-center text-white bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-lg transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
