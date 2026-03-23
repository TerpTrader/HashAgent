import { MaintenanceWizard } from '@/components/maintenance/MaintenanceWizard'

export const metadata = { title: 'Log Maintenance' }

export default function NewMaintenancePage() {
    return (
        <div className="animate-fade-in">
            <MaintenanceWizard />
        </div>
    )
}
