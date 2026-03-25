'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Notification preferences — persisted to localStorage until backend is ready

type NotificationCategory = {
    id: string
    label: string
    description: string
    icon: string
}

type NotificationPrefs = Record<string, boolean>

const CATEGORIES: NotificationCategory[] = [
    {
        id: 'batch_new',
        label: 'New batch alerts',
        description: 'Get notified when a new batch is created by a team member',
        icon: 'science',
    },
    {
        id: 'yield_alerts',
        label: 'Yield alerts',
        description: 'Alert when yield drops below your historical average',
        icon: 'trending_down',
    },
    {
        id: 'equipment_maintenance',
        label: 'Maintenance due',
        description: 'Reminders when equipment maintenance is scheduled or overdue',
        icon: 'engineering',
    },
    {
        id: 'equipment_offline',
        label: 'Equipment offline',
        description: 'Alert when a freeze dryer or other equipment goes offline',
        icon: 'power_off',
    },
    {
        id: 'coa_expiry',
        label: 'COA expiry reminders',
        description: 'Heads up when Certificates of Analysis are approaching expiry',
        icon: 'verified',
    },
    {
        id: 'compliance_deadlines',
        label: 'Compliance deadlines',
        description: 'Reminders for METRC reporting and other compliance deadlines',
        icon: 'gavel',
    },
    {
        id: 'ai_digest',
        label: 'Weekly AI digest',
        description: 'AI-generated summary of your week — yields, trends, and tips',
        icon: 'auto_awesome',
    },
    {
        id: 'ai_optimization',
        label: 'Optimization suggestions',
        description: 'Receive AI-powered process improvement recommendations',
        icon: 'lightbulb',
    },
]

const STORAGE_KEY = 'ha_notification_prefs'

function loadPrefs(): NotificationPrefs {
    if (typeof window === 'undefined') return {}
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function savePrefs(prefs: NotificationPrefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
        // Storage full or unavailable — silently fail
    }
}

export function NotificationsTab() {
    const [prefs, setPrefs] = useState<NotificationPrefs>({})
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setPrefs(loadPrefs())
    }, [])

    const toggle = useCallback((id: string) => {
        setPrefs((prev) => {
            const updated = { ...prev, [id]: !prev[id] }
            savePrefs(updated)
            return updated
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Notifications</h3>
                <p className="text-sm text-muted mt-1">Choose what alerts and updates you receive</p>
            </div>

            <div className="bg-surface-card border border-white/[0.06] rounded-xl divide-y divide-white/[0.06]">
                {CATEGORIES.map((cat) => {
                    const isOn = !!prefs[cat.id]

                    return (
                        <div
                            key={cat.id}
                            className="flex items-center justify-between px-5 py-4 gap-4"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <span
                                    className={cn(
                                        'material-symbols-outlined text-[20px] mt-0.5 shrink-0',
                                        isOn ? 'text-primary' : 'text-muted/40'
                                    )}
                                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}
                                >
                                    {cat.icon}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white">{cat.label}</p>
                                    <p className="text-xs text-muted/60 mt-0.5">{cat.description}</p>
                                </div>
                            </div>

                            {/* Toggle switch */}
                            <button
                                onClick={() => toggle(cat.id)}
                                className={cn(
                                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[#050505]',
                                    isOn ? 'bg-primary' : 'bg-white/10'
                                )}
                                role="switch"
                                aria-checked={isOn}
                                aria-label={cat.label}
                            >
                                <span
                                    className={cn(
                                        'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                                        isOn ? 'translate-x-6' : 'translate-x-1'
                                    )}
                                />
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Saved indicator */}
            <div className="h-5">
                {saved && (
                    <p className="text-xs text-emerald-400 animate-fade-in">
                        Preferences saved
                    </p>
                )}
            </div>

            <p className="text-xs text-muted/40">
                Notification delivery coming soon. Preferences are saved locally for now.
            </p>
        </div>
    )
}
