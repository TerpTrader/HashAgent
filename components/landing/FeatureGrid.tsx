import {
    FlaskConical,
    BarChart3,
    Bot,
    Thermometer,
    Shield,
    Star,
} from 'lucide-react'
import { ScrollReveal } from '@/components/landing/ScrollReveal'

const features = [
    {
        icon: FlaskConical,
        title: 'Batch Tracking',
        description:
            'Bubble hash, rosin, pressed hash \u2014 full traceability from input material to finished SKU.',
    },
    {
        icon: BarChart3,
        title: 'Yield Analytics',
        description:
            'Track yield by strain, micron grade, and operator. Know exactly what works and why.',
    },
    {
        icon: Bot,
        title: 'AI Assistant',
        description:
            'Log batches by voice, snap scale photos, get AI-powered process recommendations.',
    },
    {
        icon: Thermometer,
        title: 'Equipment Monitoring',
        description:
            'Real-time freeze dryer telemetry, maintenance scheduling, and automated alerts.',
    },
    {
        icon: Shield,
        title: 'METRC Compliance',
        description:
            'UID tracking, batch traceability, and compliance reporting built for California and beyond.',
    },
    {
        icon: Star,
        title: 'Quality Grading',
        description:
            '1\u20136 star quality system, terpene profiling, and consistency grading across every run.',
    },
]

export function FeatureGrid() {
    return (
        <section id="features" className="py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <ScrollReveal>
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                            Everything you need to run
                            <br className="hidden sm:block" />
                            {' '}a world-class lab
                        </h2>
                    </div>
                </ScrollReveal>

                <ScrollReveal staggerChildren>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={feature.title}
                                    className="glass-card glass-card-hover p-6 rounded-xl transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5 text-teal-400 mb-3" />
                                    <h3 className="text-sm font-semibold text-white mb-1.5">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-[#9ca3af] leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
