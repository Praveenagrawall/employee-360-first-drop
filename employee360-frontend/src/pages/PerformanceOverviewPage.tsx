import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Star, Users, ChevronDown, ChevronUp } from 'lucide-react';
import {
    useReviewsForTeam,
    useReviewsWithFilters,
    useCreateReview,
    useUpdateReview,
    usePerformanceOverview,
    useDirectReports,
} from '../hooks';
import { useUserContext } from '../context/UserContextProvider';
import type { ReviewStatus, PerformanceReview, EmployeeSlim, ReviewRequest, ReviewUpdateRequest } from '../types';
import {
    Badge,
    Button,
    Card,
    RatingStars,
    StatCard,
    EmptyState,
    FullPageLoader,
    Avatar,
} from '../components/common';
import { cn } from '../utils';
import StartReviewModal from '../components/performance/StartReviewModal';
import toast from 'react-hot-toast';

export default function PerformanceOverviewPage() {
    const navigate = useNavigate();
    const { currentUser, isLeadership, isManager } = useUserContext();


    const [activeTab, setActiveTab] = useState<'TEAM' | 'ORG'>(isLeadership() ? 'ORG' : 'TEAM');
    const [teamCycleMode, setTeamCycleMode] = useState<'CURRENT' | 'PAST'>('CURRENT');
    const [cycleFilter, setCycleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL');
    const [deptFilter, setDeptFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const CURRENT_CYCLE = '2025-Q1';

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
    const [editingReview, setEditingReview] = useState<PerformanceReview | undefined>(undefined);

    // Data Hooks
    const managerId = currentUser?.employeeId;
    const { data: teamReviews = [], isLoading: loadingTeam } = useReviewsForTeam(managerId);
    const { data: directReports = [], isLoading: loadingReports } = useDirectReports(managerId);
    const { data: allReviews = [], isLoading: loadingAll } = useReviewsWithFilters(
        activeTab === 'ORG' ? {
            department: deptFilter || undefined,
            designation: levelFilter ? parseInt(levelFilter) : undefined,
            cycle: cycleFilter || undefined,
            status: statusFilter === 'ALL' ? undefined : statusFilter
        } : {}
    );
    const { data: stats, isLoading: loadingStats } = usePerformanceOverview();

    const { mutate: createReview, isPending: isCreating } = useCreateReview();
    const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();

    const isLoading = loadingTeam || (activeTab === 'ORG' && loadingAll) || loadingStats || loadingReports;

    // Strict Permissions Check
    useEffect(() => {
        if (!isLoading && !isManager() && !isLeadership()) {
            toast.error('Access restricted to Managers and Leadership');
            navigate('/dashboard');
        }
    }, [isLoading, currentUser, isManager, isLeadership, navigate]);

    const displayedReviews = useMemo(() => {
        if (activeTab === 'TEAM') {
            const baseFiltered = teamReviews.filter(r => {
                if (teamCycleMode === 'CURRENT') {
                    return r.reviewCycle === CURRENT_CYCLE;
                } else {
                    return r.reviewCycle !== CURRENT_CYCLE;
                }
            });

            return baseFiltered.filter(r => {
                if (cycleFilter && r.reviewCycle !== cycleFilter) return false;
                if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
                return true;
            });
        }
        return allReviews;
    }, [activeTab, teamReviews, allReviews, cycleFilter, statusFilter, teamCycleMode]);

    // Identify team members without current cycle reviews
    const pendingReviewEmployees = useMemo(() => {
        if (activeTab !== 'TEAM' || teamCycleMode !== 'CURRENT') return [];

        return directReports.filter(report => {
            const hasReview = teamReviews.some(r => r.employeeId === report.id && r.reviewCycle === CURRENT_CYCLE);
            return !hasReview;
        });
    }, [directReports, teamReviews, activeTab, teamCycleMode]);

    const getStatusColor = (status: ReviewStatus | string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'SUBMITTED': return 'primary';
            case 'ACKNOWLEDGED': return 'secondary';
            case 'DRAFT': return 'gray';
            default: return 'gray';
        }
    };

    const handleEditReview = (review: PerformanceReview) => {
        setEditingReview(review);
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (data: ReviewRequest) => {
        createReview(data, {
            onSuccess: () => {
                toast.success('Review created successfully');
                setIsModalOpen(false);
            },
            onError: (err: any) => toast.error(err.message || 'Failed to create review')
        });
    };

    const handleModalUpdate = (id: number, data: ReviewUpdateRequest) => {
        updateReview({ id, request: data }, {
            onSuccess: () => {
                toast.success('Review updated successfully');
                setIsModalOpen(false);
            },
            onError: (err: any) => toast.error(err.message || 'Failed to update review')
        });
    };

    if (!isManager() && !isLeadership()) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-md p-8 text-center">
                    <Award className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
                    <p className="text-text-secondary mb-6">
                        Performance overview is only available to Managers and Leadership.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            {/* Header and Core Tabs */}
            <div className="flex flex-col gap-6 shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                            <Award className="w-7 h-7 text-kpmg-blue" />
                            {activeTab === 'TEAM' ? 'Team Performance' : 'Organization Performance'}
                        </h1>
                        <p className="text-sm text-text-muted mt-1 font-medium">
                            {activeTab === 'TEAM'
                                ? 'Manage performance cycles and reviews for your direct reports.'
                                : 'Organization-wide performance metrics and review tracking.'}
                        </p>
                    </div>
                    {isLeadership() && (
                        <div className="flex bg-[#F1F3F5] p-1 rounded border border-[#E5E8EB]">
                            <button
                                onClick={() => setActiveTab('TEAM')}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'TEAM' ? 'bg-white text-kpmg-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                MY TEAM
                            </button>
                            <button
                                onClick={() => setActiveTab('ORG')}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'ORG' ? 'bg-white text-kpmg-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                ORG WIDE
                            </button>
                        </div>
                    )}
                </div>

                {/* Team Sub-tabs (Current vs Past) */}
                {activeTab === 'TEAM' && (
                    <div className="flex items-center gap-6 border-b border-[#F1F3F5] pb-px">
                        <button
                            onClick={() => setTeamCycleMode('CURRENT')}
                            className={cn(
                                "pb-3 px-1 text-sm font-bold transition-all border-b-2",
                                teamCycleMode === 'CURRENT'
                                    ? "text-kpmg-blue border-kpmg-blue"
                                    : "text-text-muted border-transparent hover:text-text-primary"
                            )}
                        >
                            Current Cycle ({CURRENT_CYCLE})
                        </button>
                        <button
                            onClick={() => setTeamCycleMode('PAST')}
                            className={cn(
                                "pb-3 px-1 text-sm font-bold transition-all border-b-2",
                                teamCycleMode === 'PAST'
                                    ? "text-kpmg-blue border-kpmg-blue"
                                    : "text-text-muted border-transparent hover:text-text-primary"
                            )}
                        >
                            Past Cycles
                        </button>
                    </div>
                )}
            </div>

            {/* Leadership Stats */}
            {activeTab === 'ORG' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                    <StatCard
                        title="Org Avg Rating"
                        value={stats.organizationAverageRating.toFixed(2)}
                        icon={<Star className="w-5 h-5 text-warning" />}
                        trend={{ value: 4.2, label: 'target' }}
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${((stats.completedReviewsCount / Math.max(1, stats.completedReviewsCount + stats.pendingReviewsCount)) * 100).toFixed(0)}%`}
                        icon={<Award className="w-5 h-5 text-primary" />}
                    />
                    <StatCard
                        title="Completed Reviews"
                        value={stats.completedReviewsCount}
                        icon={<Users className="w-5 h-5 text-success" />}
                    />
                    <StatCard
                        title="Pending Reviews"
                        value={stats.pendingReviewsCount}
                        icon={<Users className="w-5 h-5 text-warning" />}
                        className={stats.pendingReviewsCount > 0 ? 'bg-warning-50/30' : ''}
                    />
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-card-bg p-3.5 rounded-card shadow-sm border border-[#E5E8EB] space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex items-center bg-[#F1F3F5] rounded p-1 shrink-0 border border-[#E5E8EB]">
                            {(['ALL', 'DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all uppercase tracking-wider ${statusFilter === s ? 'bg-white text-kpmg-blue shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    {s === 'ALL' ? 'ALL STATUS' : s}
                                </button>
                            ))}
                        </div>
                        <select
                            value={cycleFilter}
                            onChange={(e) => setCycleFilter(e.target.value)}
                            title="Filter by Cycle"
                            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"
                        >
                            <option value="">All Cycles</option>
                            <option value="2024-Q4">2024-Q4</option>
                            <option value="2024-Q3">2024-Q3</option>
                        </select>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        rightIcon={isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        className="text-xs"
                    >
                        More Filters
                    </Button>
                </div>

                {isFiltersOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-50 anima-fade-in">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Department</label>
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                title="Filter by Department"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            >
                                <option value="">All Departments</option>
                                <option value="Digital Lighthouse">Digital Lighthouse</option>
                                <option value="Tax">Tax</option>
                                <option value="Advisory">Advisory</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Level</label>
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                title="Filter by Level"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                            >
                                <option value="">All Levels</option>
                                {[1, 2, 3, 4, 5, 6, 7].map(l => (
                                    <option key={l} value={l.toString()}>Level {l}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDeptFilter('');
                                    setLevelFilter('');
                                    setCycleFilter('');
                                    setStatusFilter('ALL');
                                }}
                                className="w-full text-xs"
                            >
                                Reset All
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                {isLoading ? (
                    <FullPageLoader />
                ) : (displayedReviews.length === 0 && pendingReviewEmployees.length === 0) ? (
                    <EmptyState
                        title="No reviews found"
                        description="Try adjusting your filters or check back later."
                        icon={<Award className="w-12 h-12 text-gray-200" />}
                    />
                ) : (
                    <div className="overflow-auto h-full scrollbar-thin">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                                <tr>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Department / Level</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Cycle</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Rating</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedReviews.map((review: PerformanceReview) => (
                                    <tr
                                        key={review.id}
                                        className={`hover:bg-primary-50/20 transition-colors group ${review.status === 'DRAFT' ? 'bg-warning-50/10' : ''}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-sidebar-active text-kpmg-blue flex items-center justify-center text-xs font-bold border border-[#D0E1F9]">
                                                    {review.employeeName.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-text-primary group-hover:text-kpmg-blue transition-colors cursor-pointer" onClick={() => navigate(`/employees/${review.employeeId}`)}>
                                                        {review.employeeName}
                                                    </p>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Reviewer: {review.reviewerName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-xs text-text-primary">Department</p>
                                            <p className="text-[10px] text-text-secondary">L5 (Static Example)</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-text-secondary">
                                                {review.reviewCycle}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <RatingStars rating={review.rating} size="sm" />
                                                <span className="text-xs font-bold text-text-primary">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge color={getStatusColor(review.status)} variant="soft" className="text-[10px] uppercase font-bold tracking-tight">
                                                {review.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {(review.status === 'DRAFT' || review.status === 'SUBMITTED') && review.reviewerId === managerId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-xs text-primary"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/employees/${review.employeeId}?tab=performance`)}
                                                    className="text-xs"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Employees needing reviews */}
                                {pendingReviewEmployees.map((report: EmployeeSlim) => (
                                    <tr key={`pending-${report.id}`} className="bg-warning-50/5 hover:bg-warning-50/10 transition-all border-l-4 border-warning-200">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={report.fullName} size="sm" />
                                                <div>
                                                    <p className="font-semibold text-sm text-text-primary">{report.fullName}</p>
                                                    <p className="text-[10px] text-text-secondary">{report.empCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-xs text-text-primary">{report.department}</p>
                                            <p className="text-[10px] text-text-secondary">{report.designationName}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] font-mono bg-warning-100 px-2 py-1 rounded text-warning-800 font-bold">
                                                {CURRENT_CYCLE}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs text-gray-400 italic">No Rating Yet</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge color="warning" className="text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-sm bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]">
                                                Review Pending
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEmployee({ id: report.id, name: report.fullName });
                                                    setEditingReview(undefined);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-xs"
                                            >
                                                Start Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modals */}
            <StartReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employeeId={selectedEmployee?.id}
                employeeName={selectedEmployee?.name}
                existingReview={editingReview}
                onSubmit={handleModalSubmit}
                onUpdate={handleModalUpdate}
                isSubmitting={isCreating || isUpdating}
            />
        </div>
    );
}
