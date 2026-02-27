import { useMemo } from 'react';
import { useDashboard } from '../hooks';
import { useUserContext } from '../context/UserContextProvider';
import {
    IndividualDashboard,
    ManagerDashboard,
    LeadershipDashboard
} from '../components/dashboard';
import { AlertCircle, RefreshCcw, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common';

export default function DashboardPage() {
    const { currentUser } = useUserContext();
    const {
        data: dashboardData,
        isLoading,
        isError,
        error,
        refetch
    } = useDashboard(currentUser?.employeeId);

    const today = useMemo(() => {
        const date = new Date();
        return {
            full: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            short: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-card-bg rounded-card p-6 border border-[#E5E8EB] space-y-4">
                    <Skeleton className="h-7 w-64 bg-[#F4F6F9]" />
                    <Skeleton className="h-4 w-48 bg-[#F4F6F9]" />
                </div>
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-card-bg rounded-card border border-[#E5E8EB]" />)}
                </div>
                {/* Sections Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-card-bg rounded-card border border-[#E5E8EB]" />
                    <div className="h-80 bg-card-bg rounded-card border border-[#E5E8EB]" />
                </div>
            </div>
        );
    }

    if (isError || !dashboardData) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card-bg rounded-card border border-[#E5E8EB]">
                <div className="bg-[#FFF1F0] p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-status-error" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Dashboard Unavailable</h3>
                <p className="text-sm text-text-muted max-w-md mb-6 Leading-relaxed">
                    We encountered an issue loading your dashboard. Please try again or contact support if the issue persists.
                    {error instanceof Error ? ` (${error.message})` : ''}
                </p>
                <Button
                    variant="primary"
                    onClick={() => refetch()}
                    leftIcon={<RefreshCcw className="w-4 h-4" />}
                >
                    Retry Loading
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6 pb-8">
            {/* KPMG Style Dashboard Header */}
            <header className="bg-card-bg rounded-card p-6 border border-[#E5E8EB] flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-kpmg-blue tracking-tight">
                        Welcome, {currentUser?.fullName.split(' ')[0]}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-text-muted">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="text-sm font-medium">{today.full}</span>
                        <span className="mx-1">•</span>
                        <span className="text-[11px] font-bold text-status-success uppercase tracking-widest">System Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#F8FAFC] px-4 py-2 border border-[#EDF2F7] rounded">
                    <div className="text-right">
                        <p className="text-xs font-bold text-text-primary uppercase tracking-tight leading-none">
                            {currentUser?.designation}
                        </p>
                        <p className="text-[10px] text-text-muted mt-1 leading-none">
                            {currentUser?.department}
                        </p>
                    </div>
                </div>
            </header>

            {/* Role-Specific Content */}
            <main className="flex-1">
                {currentUser?.dashboardType === 'INDIVIDUAL' && <IndividualDashboard data={dashboardData} />}
                {currentUser?.dashboardType === 'MANAGER' && <ManagerDashboard data={dashboardData} />}
                {currentUser?.dashboardType === 'LEADERSHIP' && <LeadershipDashboard data={dashboardData} />}
            </main>
        </div>
    );
}
