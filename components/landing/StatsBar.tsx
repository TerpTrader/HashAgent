'use client'

import { useEffect, useRef, useState } from 'react'

type Stat = {
    value: number
    suffix: string
    prefix?: string
    label: string
}

const stats: Stat[] = [
    { value: 50, suffix: '+', label: 'Labs' },
    { value: 10000, suffix: '+', label: 'Batches Tracked' },
    { value: 99.9, suffix: '%', label: 'Uptime' },
]

function AnimatedNumber({ value, suffix, prefix, active }: Stat & { active: boolean }) {
    const [display, setDisplay] = useState(0)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        if (!active) return

        const isDecimal = value % 1 !== 0
        const duration = 1800
        const startTime = performance.now()

        function animate(now: number) {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * value

            setDisplay(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current))

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [active, value])

    const formatted =
        value >= 1000
            ? display.toLocaleString('en-US')
            : value % 1 !== 0
            ? display.toFixed(1)
            : display.toString()

    return (
        <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {prefix}
            {formatted}
            {suffix}
        </span>
    )
}

export function StatsBar() {
    const ref = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.3 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <section ref={ref} className="border-y border-white/[0.04] py-10 sm:py-14">
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <AnimatedNumber {...stat} active={active} />
                            <div className="text-sm text-[#9ca3af] mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
