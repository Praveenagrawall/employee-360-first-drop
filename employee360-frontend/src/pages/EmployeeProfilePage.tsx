import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    BarChart3,
    MessageSquare,
    Network,
    Lock,
    Star,
    TrendingUp,
    ArrowDown,
    Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployeeRequests } from '../api/allocationRequestApi';
import AddToTeamModal from '../components/allocation/AddToTeamModal';
import {
    useEmployee,
    useDirectReports,
    useOrgHierarchy,
    usePerformanceReviews,
    useEmployeeFeedback as useFeedback
} from '../hooks';
import { FullPageLoader, EmptyState, Card, CardHeader, CardTitle, Badge, RatingStars } from '../components/common';
import {
    ProfileHeader,
    ProfileTabs,
    OrgChartNode,
    ReportingChainCard
} from '../components/employee';
import { Button } from '../components/common';
import type { TabItem } from '../components/employee/ProfileTabs';
import { useUserContext } from '../context/UserContextProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils';

export default function EmployeeProfilePage() {
    const { id } = useParams<{ id: string }>();
    const employeeId = id ? parseInt(id, 10) : undefined;
    const { currentUser, hasPermission } = useUserContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAddToTeamModalOpen, setIsAddToTeamModalOpen] = useState(false);

    // Data fetching
    const { data: employee, isLoading: isEmpLoading, error: empError } = useEmployee(employeeId);
    const { data: directReports } = useDirectReports(employeeId);
    const { data: hierarchy, isLoading: isOrgLoading } = useOrgHierarchy(employeeId);
    const { data: perfReviews } = usePerformanceReviews(employeeId);
    const { data: feedbackList } = useFeedback(employeeId);

    // Permission logic
    const isOwnProfile = currentUser?.employeeId === employeeId;
    const canViewPerformance = hasPermission('VIEW_TEAM_PERFORMANCE') || isOwnProfile;
    const canViewFeedback = hasPermission('VIEW_FEEDBACK') || isOwnProfile;
    const isDirectReport = hierarchy?.reportingManager?.id === currentUser?.employeeId;
    const canAddToTeam = hasPermission('ASSIGN_TEAM_MEMBERS') && !isOwnProfile && !isDirectReport;

    const { data: requestRes } = useQuery({
        queryKey: ['employeeRequests', employeeId],
        queryFn: async () => {
            if (!employeeId) return [];
            const res = await fetchEmployeeRequests(employeeId);
            return res.data?.data || [];
        },
        enabled: !!employeeId
    });
    const allocationRequests = requestRes || [];
    const showAllocationRequests = isOwnProfile || hasPermission('VIEW_TEAM_PROFILE') || hasPermission('VIEW_ANY_PROFILE');

    const tabs: TabItem[] = useMemo(() => [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'performance', label: 'Performance', icon: BarChart3, restricted: !canViewPerformance },
        { id: 'feedback', label: 'Feedback', icon: MessageSquare, restricted: !canViewFeedback },
        { id: 'orgchart', label: 'Org Chart', icon: Network },
    ], [canViewPerformance, canViewFeedback]);

    if (isEmpLoading) return <FullPageLoader message="Cultivating 360° Perspective..." />;
    if (empError || !employee) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-gray-50/50">
                <EmptyState
                    title="Profile Unavailable"
                    description="This profile could not be reached or hasn't been initialized yet."
                />
            </div>
        );
    }

    // Determine if access is limited (e.g. peer with no specific permissions)
    const isLimitedAccess = !isOwnProfile && !hasPermission('VIEW_ANY_PROFILE') && !hasPermission('VIEW_TEAM_PROFILE');

    if (isLimitedAccess) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <ProfileHeader employee={employee} />
                <Card className="p-12 text-center border-dashed border-2 bg-white/50">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#00338D]" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary mb-2">Limited Access Profile</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        You have limited access to this profile. Detailed project assignments, performance metrics, and feedback history are restricted.
                        Contact your manager or HR for elevated permissions.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* 360 Header */}
            <ProfileHeader employee={employee} />

            {/* Navigation Tabs */}
            <div className="bg-card-bg rounded-card border border-[#E5E8EB] overflow-hidden sticky top-[52px] z-20">
                <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {canAddToTeam && !isLimitedAccess && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => setIsAddToTeamModalOpen(true)}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Add to My Team
                                    </Button>
                                </div>
                            )}
                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="p-4 bg-card-bg border-[#E5E8EB] rounded-card shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Projects</p>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-kpmg-blue" />
                                        <span className="text-xl font-bold text-text-primary">{employee.currentTeams?.length || 0}</span>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-card-bg border-[#E5E8EB] rounded-card shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Allocation</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-status-success" />
                                        <span className="text-xl font-bold text-text-primary">{employee.totalAllocationPercentage}%</span>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-card-bg border-[#E5E8EB] rounded-card shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avg Rating</p>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-[#F39C12] fill-[#F39C12]" />
                                        <span className="text-xl font-bold text-text-primary">{employee.performanceSummary?.averageRating || '—'}</span>
                                    </div>
                                </Card>
                                <Card className="p-4 bg-card-bg border-[#E5E8EB] rounded-card shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Feedback</p>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-kpmg-blue-light" />
                                        <span className="text-xl font-bold text-text-primary">{feedbackList?.length || 0}</span>
                                    </div>
                                </Card>
                            </div>

                            {/* Current Team Assignments */}
                            <Card className="border-[#E5E8EB] shadow-sm overflow-hidden bg-card-bg rounded-card">
                                <CardHeader className="bg-card-bg border-b border-[#E5E8EB] px-6 py-4">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-text-primary">
                                        <Briefcase className="w-4 h-4 text-kpmg-blue" />
                                        Current Assignments
                                    </CardTitle>
                                </CardHeader>
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-table-header-bg">
                                            <tr className="text-[11px] font-bold text-text-primary uppercase tracking-wider border-b border-[#E5E8EB]">
                                                <th className="py-3 px-6">Project Name</th>
                                                <th className="py-3 px-6">My Role</th>
                                                <th className="py-3 px-6 text-center">Allocation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5E8EB]">
                                            {employee.currentTeams.map((team) => (
                                                <tr key={team.teamId} className="hover:bg-sidebar-hover transition-colors">
                                                    <td className="py-4 px-6 font-semibold text-text-primary">{team.projectName}</td>
                                                    <td className="py-4 px-6">
                                                        <Badge variant="soft" color="primary">{team.roleInTeam}</Badge>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="font-bold text-kpmg-blue">
                                                            {team.allocationPercentage}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {employee.currentTeams.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-text-muted italic text-sm">No active project assignments.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Allocation Requests */}
                            {showAllocationRequests && allocationRequests.length > 0 && (
                                <Card className="border-[#E5E8EB] shadow-sm overflow-hidden bg-card-bg rounded-card">
                                    <CardHeader className="bg-card-bg border-b border-[#E5E8EB] px-6 py-4">
                                        <CardTitle className="text-base font-bold flex items-center gap-2 text-text-primary">
                                            <Briefcase className="w-4 h-4 text-kpmg-blue" />
                                            Recent Allocation Requests
                                        </CardTitle>
                                    </CardHeader>
                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-table-header-bg">
                                                <tr className="text-[11px] font-bold text-text-primary uppercase tracking-wider border-b border-[#E5E8EB]">
                                                    <th className="py-3 px-6">Project Name</th>
                                                    <th className="py-3 px-6">Role</th>
                                                    <th className="py-3 px-6 text-center">Alloc %</th>
                                                    <th className="py-3 px-6">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E5E8EB]">
                                                {allocationRequests.slice(0, 5).map((req: any) => (
                                                    <tr key={req.id} className="hover:bg-sidebar-hover transition-colors">
                                                        <td className="py-4 px-6 font-semibold text-text-primary">{req.projectName}</td>
                                                        <td className="py-4 px-6">
                                                            <Badge variant="soft" color="primary">{req.roleInTeam}</Badge>
                                                        </td>
                                                        <td className="py-4 px-6 text-center font-bold text-kpmg-blue">{req.requestedAllocation}%</td>
                                                        <td className="py-4 px-6">
                                                            <Badge color={req.status === 'APPROVED' || req.status === 'AUTO_APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : req.status === 'PENDING' ? 'warning' : 'gray'} variant="soft">{req.status}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-8">
                            <ReportingChainCard employee={employee} />
                            {directReports && directReports.length > 0 && (
                                <Card className="border-none shadow-sm overflow-hidden bg-white">
                                    <CardHeader className="p-6 bg-white border-b border-gray-100">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ArrowDown className="w-4 h-4 text-[#00338D]" />
                                            Direct Reports ({directReports.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <div className="p-6 flex flex-wrap gap-4">
                                        {directReports.map(report => (
                                            <OrgChartNode key={report.id} employee={report} className="w-full" />
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <Card className="border-[#E5E8EB] shadow-sm overflow-hidden bg-card-bg rounded-card">
                        <CardHeader className="px-8 py-6 border-b border-[#E5E8EB]">
                            <CardTitle className="text-xl font-bold text-text-primary">Project History</CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-table-header-bg">
                                    <tr className="text-[11px] font-bold text-text-primary uppercase tracking-wider border-b border-[#E5E8EB]">
                                        <th className="py-4 px-8">Project & Client</th>
                                        <th className="py-4 px-8">Role</th>
                                        <th className="py-4 px-8 text-center">Allocation</th>
                                        <th className="py-4 px-8">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E8EB]">
                                    {employee.currentTeams.map((p) => (
                                        <tr key={p.teamId} className="hover:bg-sidebar-hover transition-colors group">
                                            <td className="py-5 px-8">
                                                <div>
                                                    <p className="font-semibold text-text-primary group-hover:text-kpmg-blue transition-colors">{p.projectName}</p>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{p.clientName || 'Global Client'}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <Badge color="primary" variant="soft">{p.roleInTeam}</Badge>
                                            </td>
                                            <td className="py-5 px-8 text-center font-bold text-kpmg-blue">{p.allocationPercentage}%</td>
                                            <td className="py-5 px-8">
                                                <Badge color="success">Active</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-8">
                        {!canViewPerformance ? (
                            <Card className="p-20 text-center bg-gray-50/50 border-dashed border-2">
                                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Performance data is restricted</p>
                            </Card>
                        ) : (
                            <>
                                {/* Rating Trend Chart */}
                                <Card className="p-6 border-[#E5E8EB] shadow-sm bg-card-bg rounded-card overflow-hidden h-[400px] flex flex-col">
                                    <CardTitle className="mb-6 text-text-primary text-xl font-bold">Performance Rating Trend</CardTitle>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={perfReviews?.slice().reverse() || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="reviewCycle" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} />
                                                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ fontWeight: 900, color: '#00338D' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="rating"
                                                    stroke="#00338D"
                                                    strokeWidth={4}
                                                    dot={{ r: 6, fill: '#00338D', strokeWidth: 4, stroke: '#fff' }}
                                                    activeDot={{ r: 8, fill: '#0091DA' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                {/* Review Timeline */}
                                <div className="space-y-4">
                                    {(perfReviews || []).map((review) => (
                                        <Card key={review.id} className="p-6 border-[#E5E8EB] shadow-sm bg-card-bg rounded-card hover:bg-sidebar-hover transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge color="primary" className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{review.reviewCycle}</Badge>
                                                        <Badge color={review.status === 'COMPLETED' ? 'success' : 'warning'} variant="soft">{review.status}</Badge>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                                        Reviewed by <span className="text-kpmg-blue">{review.reviewerName}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <RatingStars rating={review.rating} size="sm" isInteractive={false} />
                                                        <p className="text-lg font-bold text-kpmg-blue mt-1">{review.rating}/5.0</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F1F3F5]">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Goals Met</p>
                                                    <p className="text-sm text-text-primary leading-relaxed">{review.goals || 'No specific goals documented.'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Manager Comments</p>
                                                    <p className="text-sm text-text-primary leading-relaxed italic font-medium">"{review.comments || 'No comments provided.'}"</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="space-y-4">
                        {!canViewFeedback ? (
                            <Card className="p-16 text-center bg-page-bg border-dashed border-[#E5E8EB] rounded-card">
                                <Lock className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
                                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Feedback history is restricted</p>
                            </Card>
                        ) : (
                            (feedbackList as any[] || []).map((f: any) => (
                                <Card key={f.id} className="p-6 border-[#E5E8EB] shadow-sm bg-card-bg rounded-card flex gap-5 hover:bg-sidebar-hover transition-all">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded bg-sidebar-active flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-kpmg-blue" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-[11px] font-bold text-kpmg-blue uppercase tracking-wider">Recognized by {f.fromEmployeeName || 'Anonymous'}</span>
                                                <p className="text-[10px] text-text-muted font-semibold">{formatDate(f.createdAt)}</p>
                                            </div>
                                            <Badge variant="soft" color="accent" className="font-bold italic text-[10px]">{f.type === 'UPWARD' ? 'Feedback to Senior' : f.type === 'DOWNWARD' ? 'Senior Feedback' : f.type}</Badge>
                                        </div>
                                        <p className="text-text-primary leading-relaxed text-base font-medium italic">"{f.content}"</p>
                                        <div className="mt-4 pt-3 border-t border-[#F1F3F5] flex items-center gap-4">
                                            <RatingStars rating={f.rating} size="sm" isInteractive={false} />
                                            <span className="text-[10px] font-bold text-kpmg-blue uppercase tracking-widest">{f.rating}/5 Impact</span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'orgchart' && (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center overflow-x-auto">
                        <div className="relative flex flex-col items-center min-w-max">
                            {/* Upward Chain (Managers) */}
                            {hierarchy && (
                                <div className="flex flex-col items-center">
                                    {hierarchy.reportingManager && (
                                        <>
                                            <OrgChartNode employee={hierarchy.reportingManager} />
                                            <div className="w-px h-12 bg-gray-200" />
                                        </>
                                    )}

                                    {/* Active Node */}
                                    <OrgChartNode employee={employee} isActive />

                                    {/* Direct Reports Connector */}
                                    {directReports && directReports.length > 0 && (
                                        <div className="flex flex-col items-center w-full">
                                            <div className="w-px h-12 bg-gray-200" />
                                            <div className="relative flex justify-center w-full">
                                                <div className="absolute top-0 h-px bg-gray-200"
                                                    style={{
                                                        width: directReports.length > 1 ? `calc(100% - ${200 / directReports.length}px)` : '0'
                                                    }}
                                                />
                                                <div className="flex gap-8 pt-12">
                                                    {directReports.map(report => (
                                                        <div key={report.id} className="flex flex-col items-center">
                                                            <div className="absolute top-0 w-px h-12 bg-gray-200" />
                                                            <OrgChartNode employee={report} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {!hierarchy && isOrgLoading && <FullPageLoader message="Mapping connections..." />}
                        </div>
                    </div>
                )}
            </div>

            {isAddToTeamModalOpen && employee && (
                <AddToTeamModal
                    isOpen={isAddToTeamModalOpen}
                    onClose={() => setIsAddToTeamModalOpen(false)}
                    preSelectedEmployee={{
                        ...employee,
                        id: employee.id,
                        fullName: `${employee.firstName} ${employee.lastName}`,
                        designation: (employee as any).designation || (employee as any).designationName,
                        department: employee.department,
                        profilePicUrl: employee.profilePicUrl,
                        totalAllocation: employee.totalAllocationPercentage,
                        currentAssignments: employee.currentTeams
                    }}
                />
            )}
        </div>
    );
}
