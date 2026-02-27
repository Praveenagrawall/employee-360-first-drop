import {
    Users,
    ClipboardList,
    BarChart3,
    ChevronRight,
    Briefcase,
    MessageSquare,
    Search,
    Download,
    TrendingUp,
    AlertCircle,
    Star,
    Bell
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    StatCard,
    Avatar,
    Badge,
    Button,
    EmptyState,
    RatingStars
} from '../common';
import type { DashboardData } from '../../types';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import PendingApprovalsPanel from '../allocation/PendingApprovalsPanel';
import MyRequestsPanel from '../allocation/MyRequestsPanel';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingCount } from '../../api/allocationRequestApi';

interface ManagerDashboardProps {
    data: DashboardData;
}

export function ManagerDashboard({ data }: ManagerDashboardProps) {

    // Helper for utilization color
    const getUtilizationColorScheme = (util: number): 'success' | 'warning' | 'primary' => {
        if (util >= 80) return 'success';
        if (util >= 60) return 'warning';
        return 'primary';
    };

    const { data: pendingCountRes } = useQuery({
        queryKey: ['pendingCount'],
        queryFn: async () => {
            const res = await fetchPendingCount();
            return res.data?.data || 0;
        }
    });
    const pendingCount = pendingCountRes || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats Row */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${pendingCount > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
                <StatCard
                    title="Direct Reports"
                    value={data.directReportCount || 0}
                    icon={<Users />}
                    colorScheme="primary"
                />
                <StatCard
                    title="Team Avg Rating"
                    value={data.averageTeamRating?.toFixed(1) || '—'}
                    icon={<Star />}
                    colorScheme="accent"
                />
                <StatCard
                    title="Pending Reviews"
                    value={data.pendingReviewCount || 0}
                    icon={<ClipboardList />}
                    colorScheme={(data.pendingReviewCount || 0) > 0 ? "warning" : "primary"}
                />
                <StatCard
                    title="Team Utilization"
                    value={`${data.teamUtilization || 0}%`}
                    icon={<BarChart3 />}
                    colorScheme={getUtilizationColorScheme(data.teamUtilization || 0)}
                />
                {pendingCount > 0 && (
                    <StatCard
                        title="Pending Approvals"
                        value={pendingCount}
                        icon={<Bell />}
                        colorScheme="warning"
                    />
                )}
            </div>

            {/* Allocation Requests Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PendingApprovalsPanel />
                <MyRequestsPanel />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1: Direct Reports Table */}
                <Card className="lg:col-span-2 flex flex-col h-full border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Users className="w-5 h-5" />
                            Direct Reports
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                                Search Team
                            </Button>
                            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    {!data.directReports || data.directReports.length === 0 ? (
                        <EmptyState title="No Direct Reports" description="Your reporting hierarchy is currently empty." className="flex-1" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Alloc %</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rating</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.directReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Avatar name={report.fullName} size="sm" className="mr-3 ring-2 ring-white" />
                                                    <div>
                                                        <p className="text-sm font-bold text-text-primary group-hover:text-[#00338D] transition-colors">{report.fullName}</p>
                                                        <p className="text-[10px] text-text-secondary font-medium">{report.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-text-primary font-bold">{report.designationName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center justify-center w-12 h-6 rounded-lg text-[10px] font-black shadow-sm",
                                                    (report.totalAllocation || 0) >= 80 ? "bg-success-100 text-success-700" :
                                                        (report.totalAllocation || 0) >= 40 ? "bg-warning-100 text-warning-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {report.totalAllocation || 0}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge color={(report.latestRating || 0) >= 4.0 ? "success" : "primary"} variant="solid" className="px-2 py-0 text-[10px] font-black">
                                                    {report.latestRating?.toFixed(1) || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/employees/${report.id}`} className="p-2 rounded-full hover:bg-[#00338D]/10 transition-colors inline-block text-[#00338D]">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Section 2: Team Active Projects */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Briefcase className="w-5 h-5" />
                            Managed Projects
                        </CardTitle>
                    </CardHeader>
                    {!data.activeProjects || data.activeProjects.length === 0 ? (
                        <EmptyState title="No Active Projects" description="You are currently between project assignments." className="flex-1" />
                    ) : (
                        <div className="p-4 space-y-4">
                            {data.activeProjects.map((project) => (
                                <div key={project.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:border-[#00338D]/20 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-extrabold text-text-primary group-hover:text-[#00338D] transition-colors">{project.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{project.clientName}</p>
                                        </div>
                                        <Badge color="success" variant="solid" className="px-1.5 py-0 text-[9px] uppercase font-black">{project.status}</Badge>
                                    </div>

                                    {/* Progress Visualization */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                            <span>Delivery Health</span>
                                            <span className="text-[#00338D]">75%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#00338D] to-[#0091DA] w-3/4 shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <Avatar key={i} name={`User ${i}`} size="xs" className="ring-2 ring-white" />
                                            ))}
                                            <div className="w-6 h-6 rounded-full bg-white ring-2 ring-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">
                                                +2
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#00338D]">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-wider tabular-nums">5 Specialists</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 3: Pending Action Cards */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-red-50/50 border-b border-red-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5 animate-pulse" />
                            Action Required: Pending Reviews
                        </CardTitle>
                    </CardHeader>
                    {!data.pendingReviews || data.pendingReviews.length === 0 ? (
                        <EmptyState title="Queue Is Clear" description="All performance reviews for your team are complete." className="flex-1" />
                    ) : (
                        <div className="p-6 space-y-4">
                            {data.pendingReviews.map((review) => (
                                <div key={review.id} className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border border-warning-100 bg-warning-50/20 hover:shadow-md transition-shadow gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <Avatar name={review.employeeName || 'Unknown'} size="md" className="ring-2 ring-white shadow-sm" />
                                        <div>
                                            <p className="text-sm font-extrabold text-text-primary">{review.employeeName}</p>
                                            <p className="text-[10px] text-warning-700 font-bold uppercase tracking-wider">{review.reviewCycle?.replace('-', ' ')} Cycle</p>
                                        </div>
                                    </div>
                                    <Button variant="primary" size="sm" className="w-full sm:w-auto px-6 font-black uppercase tracking-widest text-[10px] h-9 shadow-lg shadow-primary/20">
                                        Complete Review
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Section 4: Team Feedback Summary */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <MessageSquare className="w-5 h-5" />
                            Team Sentiment Summary
                        </CardTitle>
                    </CardHeader>
                    {!data.recentFeedback || data.recentFeedback.length === 0 ? (
                        <EmptyState title="Quiet Period" description="No recent recognition for your reports yet." className="flex-1" />
                    ) : (
                        <div className="p-6 space-y-4">
                            {data.recentFeedback.slice(0, 3).map((feedback) => (
                                <div key={feedback.id} className="bg-gray-50/30 rounded-2xl p-5 border border-gray-100 hover:border-primary/10 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <Avatar name={feedback.toEmployeeName || 'Unknown'} size="xs" className="ring-1 ring-white" />
                                            <p className="text-[11px] font-black text-text-primary uppercase tracking-tight">
                                                For {feedback.toEmployeeName}
                                            </p>
                                        </div>
                                        <RatingStars rating={feedback.rating} size="sm" />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -left-1 -top-1 text-2xl text-primary/10 font-serif font-black">"</span>
                                        <p className="text-sm text-text-secondary italic pl-3 leading-relaxed">
                                            {feedback.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
