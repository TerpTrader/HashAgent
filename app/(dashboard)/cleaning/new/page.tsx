import { CleaningWizard } from '@/components/cleaning/CleaningWizard'

export const metadata = { title: 'New Cleaning Log' }

export default function NewCleaningPage() {
    return (
        <div className="animate-fade-in">
            <CleaningWizard />
        </div>
    )
}
