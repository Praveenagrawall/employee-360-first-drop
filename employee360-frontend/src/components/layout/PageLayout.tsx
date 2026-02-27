import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../utils/cn';
import { useUserContext } from '../../context/UserContextProvider';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import Button from '../common/Button';

interface PageLayoutProps {
    children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { isLoading, error, refetchUser } = useUserContext();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="mt-6 text-text-primary font-bold tracking-tight animate-pulse">
                    Loading Employee 360...
                </p>
                <p className="mt-1 text-text-secondary text-sm">
                    Synchronizing your enterprise profile
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Connection Error</h2>
                <p className="text-text-secondary mb-8 max-w-md">
                    We're having trouble reaching the Employee 360 servers. Please check your connection and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => refetchUser()}
                        leftIcon={<RefreshCcw className="w-4 h-4" />}
                        className="shadow-lg shadow-primary/20"
                    >
                        Retry Connection
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col">
            <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

            <div className="flex flex-1 relative">
                <Sidebar
                    isMobileOpen={isMobileSidebarOpen}
                    setIsMobileOpen={setIsMobileSidebarOpen}
                />

                <main className={cn(
                    "flex-1 overflow-x-hidden w-full transition-all duration-300 ease-in-out lg:ml-[240px]",
                    isMobileSidebarOpen ? "ml-0" : ""
                )}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
