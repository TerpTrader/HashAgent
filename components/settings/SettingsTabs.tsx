'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { ProfileTab } from './ProfileTab'
import { SecurityTab } from './SecurityTab'
import { OrganizationTab } from './OrganizationTab'
import { TeamTab } from './TeamTab'
import { BillingTab } from './BillingTab'
import { NotificationsTab } from './NotificationsTab'

type SettingsTabsProps = {
    user: {
        id: string
        name: string
        email: string
        createdAt: string
        lastLoginAt: string | null
    }
    org: {
        name: string
        plan: string
        memberCount: number
    }
    role: string
}

const TABS = [
    { value: 'profile', label: 'Profile', icon: 'person' },
    { value: 'security', label: 'Security', icon: 'lock' },
    { value: 'organization', label: 'Organization', icon: 'apartment' },
    { value: 'team', label: 'Team', icon: 'group' },
    { value: 'billing', label: 'Billing', icon: 'credit_card' },
    { value: 'notifications', label: 'Notifications', icon: 'notifications' },
] as const

export function SettingsTabs({ user, org, role }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            {/* Tab list — horizontal scrollable on mobile */}
            <Tabs.List className="flex gap-1 overflow-x-auto pb-px mb-6 border-b border-white/[0.06] scrollbar-hide">
                {TABS.map((tab) => (
                    <Tabs.Trigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0',
                            activeTab === tab.value
                                ? 'text-white border-primary'
                                : 'text-muted border-transparent hover:text-white hover:border-white/20'
                        )}
                    >
                        <span
                            className={cn(
                                'material-symbols-outlined text-[18px]',
                                activeTab === tab.value ? 'text-primary' : 'text-muted/60'
                            )}
                            style={{ fontVariationSettings: `'FILL' ${activeTab === tab.value ? 1 : 0}, 'wght' 300, 'opsz' 18` }}
                        >
                            {tab.icon}
                        </span>
                        {tab.label}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {/* Tab panels */}
            <div className="max-w-2xl">
                <Tabs.Content value="profile" className="outline-none">
                    <ProfileTab
                        initialName={user.name}
                        email={user.email}
                        joinedAt={user.createdAt}
                    />
                </Tabs.Content>

                <Tabs.Content value="security" className="outline-none">
                    <SecurityTab lastLoginAt={user.lastLoginAt} />
                </Tabs.Content>

                <Tabs.Content value="organization" className="outline-none">
                    <OrganizationTab
                        orgName={org.name}
                        plan={org.plan}
                        memberCount={org.memberCount}
                        isOwner={role === 'OWNER'}
                    />
                </Tabs.Content>

                <Tabs.Content value="team" className="outline-none">
                    <TeamTab
                        currentUserId={user.id}
                        currentRole={role}
                    />
                </Tabs.Content>

                <Tabs.Content value="billing" className="outline-none max-w-none">
                    <BillingTab currentPlan={org.plan} />
                </Tabs.Content>

                <Tabs.Content value="notifications" className="outline-none">
                    <NotificationsTab />
                </Tabs.Content>
            </div>
        </Tabs.Root>
    )
}
