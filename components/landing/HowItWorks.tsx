import { ScrollReveal } from '@/components/landing/ScrollReveal'

const steps = [
    {
        number: '1',
        title: 'Create your lab',
        description:
            'Set up your facility, register equipment, and invite your team in under 5 minutes.',
    },
    {
        number: '2',
        title: 'Log your first wash',
        description:
            'Record your extraction run, snap a scale photo, and let AI handle the data entry.',
    },
    {
        number: '3',
        title: 'Optimize your process',
        description:
            'Get AI-powered insights on yield trends, equipment health, and quality improvements.',
    },
]

export function HowItWorks() {
    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
                <ScrollReveal>
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                            Get started in minutes
                        </h2>
                    </div>
                </ScrollReveal>

                <ScrollReveal staggerChildren>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="glass-card p-6 text-center"
                            >
                                <div className="w-12 h-12 rounded-full border border-teal-500/20 bg-teal-500/[0.06] flex items-center justify-center mx-auto mb-4">
                                    <span className="text-base font-bold text-teal-400">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-[#9ca3af] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
