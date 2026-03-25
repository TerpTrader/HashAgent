import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { StatsBar } from '@/components/landing/StatsBar'
import { ProductShowcase, BatchMockup, EquipmentMockup } from '@/components/landing/ProductShowcase'
import { ChatMockup } from '@/components/landing/ChatMockup'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <Hero />

            <StatsBar />

            <ProductShowcase
                sectionNumber="01"
                subtitle="Batch Intelligence"
                title="Every micron, tracked."
                description="Full-spectrum batch logging from input material through every wash pass, micron grade, and quality assessment. Know your yield down to the gram."
                features={[
                    'Per-micron yield breakdown across all grades',
                    'Input-to-output traceability for compliance',
                    '1\u20136 star quality grading per grade',
                    'Strain-level historical yield comparison',
                ]}
                mockupContent={<BatchMockup />}
            />

            <ProductShowcase
                sectionNumber="02"
                subtitle="AI Assistant"
                title="Log batches with a message."
                description="Hash Agent's AI understands your workflow. Log runs, query yield data, and get process recommendations through natural conversation."
                features={[
                    'Natural language batch logging',
                    'Yield trend analysis on demand',
                    'Process optimization suggestions',
                    'Voice and photo input support',
                ]}
                mockupContent={<ChatMockup />}
                reversed
            />

            <ProductShowcase
                sectionNumber="03"
                subtitle="Equipment Monitoring"
                title="Know your machines are running."
                description="Real-time telemetry from your freeze dryers, presses, and extraction equipment. Automated maintenance scheduling keeps your lab running."
                features={[
                    'Live temperature and vacuum monitoring',
                    'Cycle progress tracking and alerts',
                    'Predictive maintenance scheduling',
                    'Equipment downtime analytics',
                ]}
                mockupContent={<EquipmentMockup />}
            />

            <FeatureGrid />

            <HowItWorks />

            <Pricing />

            <FinalCTA />

            <Footer />
        </div>
    )
}
