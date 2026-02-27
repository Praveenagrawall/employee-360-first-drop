import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
    restricted?: boolean;
}

interface ProfileTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <div className="flex border-b border-[#E5E8EB] w-full overflow-x-auto no-scrollbar bg-card-bg">
            {tabs.map((tab) => {
                if (tab.restricted) return null;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-all border-b-2 whitespace-nowrap relative",
                            isActive
                                ? "border-kpmg-blue text-kpmg-blue bg-sidebar-active"
                                : "border-transparent text-text-muted hover:text-text-primary hover:bg-sidebar-hover"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", isActive ? "text-kpmg-blue" : "text-text-muted")} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
