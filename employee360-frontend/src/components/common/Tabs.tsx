import { cn } from '../../utils/cn';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    variant?: 'pills' | 'underline';
    className?: string;
}

export function Tabs({
    tabs,
    activeTab,
    onTabChange,
    variant = 'underline',
    className
}: TabsProps) {
    return (
        <div className={cn(
            "flex items-center gap-1",
            variant === 'pills' ? "bg-gray-100 p-1 rounded-xl" : "border-b border-gray-100",
            className
        )}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all whitespace-nowrap",
                        variant === 'pills' ? (
                            activeTab === tab.id
                                ? "bg-white text-brand-600 shadow-sm rounded-lg"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg"
                        ) : (
                            activeTab === tab.id
                                ? "text-brand-600 border-b-2 border-brand-600"
                                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                        )
                    )}
                >
                    {tab.icon && tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default Tabs;
