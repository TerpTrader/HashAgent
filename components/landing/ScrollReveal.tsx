'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type ScrollRevealProps = {
    children: ReactNode
    className?: string
    delay?: number
    staggerChildren?: boolean
}

export function ScrollReveal({ children, className = '', delay = 0, staggerChildren = false }: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Small delay to let the page render before checking visibility
        const timer = setTimeout(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        el.classList.add('revealed')
                        observer.unobserve(el)
                    }
                },
                { threshold: 0.1, rootMargin: '50px 0px -20px 0px' }
            )

            observer.observe(el)
            return () => observer.disconnect()
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${staggerChildren ? 'reveal-children' : ''} ${className}`}
            style={{ transitionDelay: `${delay}s` }}
        >
            {children}
        </div>
    )
}
