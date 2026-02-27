import {
    Briefcase,
    MessageSquare,
    Star,
    PieChart,
    ChevronRight,
    User,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    Card,
    CardHeader,
    CardTitle,
    StatCard,
    Avatar,
    ProjectTypeBadge,
    Badge,
    RatingStars,
    EmptyState
} from '../common';
import type { DashboardData } from '../../types';
import { formatDate } from '../../utils';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployeeRequests } from '../../api/allocationRequestApi';
import { useUserContext } from '../../context/UserContextProvider';

interface IndividualDashboardProps {
    data: DashboardData;
}

export function IndividualDashboard({ data }: IndividualDashboardProps) {

    // Helper for allocation color
    const getAllocationColorScheme = (alloc: number): 'success' | 'warning' | 'primary' => {
        if (alloc >= 80) return 'success';
        if (alloc >= 40) return 'warning';
        return 'primary';
    };

    const getRatingColorScheme = (rating: number): 'success' | 'primary' | 'warning' => {
        if (rating >= 4.0) return 'success';
        if (rating >= 3.0) return 'primary';
        return 'warning';
    };

    const { currentUser } = useUserContext();
    const employeeId = currentUser?.employeeId;
    const { data: requestRes } = useQuery({
        queryKey: ['employeeRequests', employeeId],
        queryFn: async () => {
            if (!employeeId) return [];
            const res = await fetchEmployeeRequests(employeeId);
            return res.data?.data || [];
        },
        enabled: !!employeeId
    });

    const pendingRequests = Array.isArray(requestRes)
        ? requestRes.filter((r: any) => r.status === 'PENDING')
        : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {pendingRequests.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in slide-in-from-top-4">
                    <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-blue-900 text-sm">Allocation Request Pending</h4>
                        <div className="text-xs text-blue-700 mt-1 space-y-1">
                            {pendingRequests.map((req: any) => (
                                <p key={req.id}>
                                    You have been requested for <span className="font-bold">{req.projectName}</span> by <span className="font-bold">{req.requesterName}</span>.
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Projects"
                    value={data.currentProjectCount || 0}
                    icon={<Briefcase />}
                    colorScheme="primary"
                />
                <StatCard
                    title="Total Allocation"
                    value={`${data.totalAllocation || 0}% `}
                    icon={<PieChart />}
                    colorScheme={getAllocationColorScheme(data.totalAllocation || 0)}
                />
                <StatCard
                    title="Latest Rating"
                    value={data.latestRating?.toFixed(1) || '—'}
                    icon={<Star />}
                    colorScheme={getRatingColorScheme(data.latestRating || 0)}
                />
                <StatCard
                    title="Feedback Received"
                    value={data.feedbackCount || 0}
                    icon={<MessageSquare />}
                    colorScheme="secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: My Projects */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Briefcase className="w-5 h-5" />
                            My Projects
                        </CardTitle>
                    </CardHeader>
                    {!data.myProjects || data.myProjects.length === 0 ? (
                        <EmptyState title="No Active Projects" description="You are currently unallocated." className="flex-1" />
                    ) : (
                        <div className="divide-y divide-gray-100 bg-white">
                            {data.myProjects.map((assignment) => (
                                <div key={assignment.projectName} className="p-5 hover:bg-gray-50/80 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-text-primary group-hover:text-[#00338D] transition-colors">{assignment.projectName}</h4>
                                            <p className="text-xs text-text-secondary font-medium">{assignment.clientName}</p>
                                        </div>
                                        <ProjectTypeBadge type={assignment.projectType} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Your Role</p>
                                            <p className="text-xs font-semibold text-text-primary">{assignment.roleInTeam}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Allocation</p>
                                            <p className={cn(
                                                "text-xs font-bold",
                                                assignment.allocationPercentage >= 80 ? "text-success-600" : "text-warning-600"
                                            )}>
                                                {assignment.allocationPercentage}%
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Team Lead</p>
                                            <p className="text-xs font-semibold text-text-primary truncate">{assignment.teamLeadName || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Badge color="success" variant="solid" className="px-2 py-0 text-[10px]">ACTIVE</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Section 2: My Teammates */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <User className="w-5 h-5" />
                            My Teammates
                        </CardTitle>
                    </CardHeader>
                    {!data.myTeammates || data.myTeammates.length === 0 ? (
                        <EmptyState title="No Teammates" description="Join a project to see your team." className="flex-1" />
                    ) : (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
                            {data.myTeammates.map((teammate) => (
                                <Link
                                    to={`/ employees / ${teammate.id} `}
                                    key={teammate.id}
                                    className="flex items-center p-4 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-md hover:border-[#00338D]/10 transition-all group"
                                >
                                    <Avatar name={teammate.fullName} size="sm" className="mr-4 ring-2 ring-white shadow-sm" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-text-primary truncate group-hover:text-[#00338D] transition-colors">
                                            {teammate.fullName}
                                        </p>
                                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{teammate.designationName}</p>
                                    </div>
                                    <div className="ml-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-[#00338D]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 3: Performance Reviews Timeline */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Star className="w-5 h-5" />
                            Recent Performance Timeline
                        </CardTitle>
                    </CardHeader>
                    {!data.recentReviews || data.recentReviews.length === 0 ? (
                        <EmptyState title="No Reviews Yet" description="Historical ratings will be logged here." className="flex-1" />
                    ) : (
                        <div className="p-8 space-y-8 bg-white overflow-hidden">
                            {data.recentReviews.map((review, idx) => (
                                <div key={review.id} className="relative pl-10">
                                    {/* Timeline Line */}
                                    {idx !== data.recentReviews!.length - 1 && (
                                        <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-gray-100" />
                                    )}
                                    {/* Timeline Marker */}
                                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center z-10 shadow-sm">
                                        {review.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-5 h-5 text-success-600" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-warning-500" />
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <div>
                                                <h4 className="font-extrabold text-text-primary capitalize text-lg">{review.reviewCycle?.replace('-', ' ')}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <RatingStars rating={review.rating} size="sm" />
                                                    <span className="text-sm font-bold text-text-primary">{review.rating.toFixed(1)}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatDate(review.reviewDate)}</span>
                                                </div>
                                            </div>
                                            <Badge color={review.status === 'COMPLETED' ? 'success' : 'warning'} variant="solid" className="self-start sm:self-center">
                                                {review.status}
                                            </Badge>
                                        </div>

                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 relative group">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Reviewer: {review.reviewerName}</p>
                                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 italic group-hover:line-clamp-none transition-all cursor-pointer">
                                                "{review.comments}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Section 4: Recent Feedback */}
                <Card className="flex flex-col h-full border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <MessageSquare className="w-5 h-5" />
                            Recognition Feed
                        </CardTitle>
                    </CardHeader>
                    {!data.recentFeedback || data.recentFeedback.length === 0 ? (
                        <EmptyState title="No Feedback Yet" description="Shoutouts and peer recognition will appear here." className="flex-1" />
                    ) : (
                        <div className="p-6 space-y-5 bg-white">
                            {data.recentFeedback.map((feedback) => (
                                <div key={feedback.id} className="relative bg-gray-50/30 rounded-2xl p-5 border border-gray-100/50 hover:border-primary/20 hover:bg-white hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar name={feedback.isAnonymous ? '?' : feedback.fromEmployeeName} size="md" className="ring-2 ring-white shadow-sm" />
                                            <div>
                                                <p className="text-sm font-extrabold text-text-primary">
                                                    {feedback.isAnonymous ? 'Anonymous' : feedback.fromEmployeeName}
                                                </p>
                                                <Badge color="primary" className="text-[9px] px-2 py-0 mt-1 uppercase font-black">
                                                    {feedback.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <RatingStars rating={feedback.rating} size="sm" />
                                            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">{formatDate(feedback.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -left-1 -top-2 text-3xl text-primary/10 font-serif leading-none">"</span>
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
