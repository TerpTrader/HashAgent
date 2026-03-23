import { RegisterEquipmentForm } from '@/components/equipment/RegisterEquipmentForm'

export const metadata = {
    title: 'Register Equipment',
}

export default function RegisterEquipmentPage() {
    return (
        <div className="animate-fade-in">
            <RegisterEquipmentForm />
        </div>
    )
}
