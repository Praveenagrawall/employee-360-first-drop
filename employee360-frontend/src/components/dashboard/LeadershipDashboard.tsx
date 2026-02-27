import {
    StatCard,
    Card,
    CardHeader,
    CardTitle,
    Avatar,
    Skeleton,
    EmptyState,
    Button
} from '../common';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { useOrgOverview } from '../../hooks/useAnalytics';
import type { DashboardData } from '../../types';
import { Link } from 'react-router-dom';
import PendingApprovalsPanel from '../allocation/PendingApprovalsPanel';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingCount } from '../../api/allocationRequestApi';
import { Users, Activity, Briefcase, FileText, Trophy, AlertTriangle, ChevronRight, Star, Bell } from 'lucide-react';

interface LeadershipDashboardProps {
    data: DashboardData;
}

const COLORS = ['#00338D', '#0091DA', '#483698', '#009A44', '#F5A623', '#772432'];

export function LeadershipDashboard({ data }: LeadershipDashboardProps) {
    const { data: orgStats, isLoading: statsLoading } = useOrgOverview();

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
                    title="Total Headcount"
                    value={data.totalHeadcount || 0}
                    icon={<Users />}
                    colorScheme="primary"
                />
                <StatCard
                    title="Active Client Projects"
                    value={data.clientProjectCount || 0}
                    icon={<Briefcase />}
                    colorScheme="success"
                />
                <StatCard
                    title="Avg Utilization"
                    value="86%"
                    icon={<Activity />}
                    colorScheme="accent"
                />
                <StatCard
                    title="Open Proposals"
                    value={data.proposalCount || 0}
                    icon={<FileText />}
                    colorScheme="warning"
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

            {/* Allocation Requests Section */}
            <div>
                <PendingApprovalsPanel />
            </div>

            {/* Row 2: Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Organization Headcount Distribution (Horizontal Bar) */}
                <Card className="h-[450px] flex flex-col border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Users className="w-5 h-5" />
                            Headcount by Designation
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 min-h-0 p-6">
                        {statsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                            </div>
                        ) : !orgStats?.headcountByDesignation ? (
                            <EmptyState title="No Data" description="No headcount metrics available." className="h-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={orgStats.headcountByDesignation}
                                    layout="vertical"
                                    margin={{ left: 40, right: 40, top: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="designation"
                                        axisLine={false}
                                        tickLine={false}
                                        width={140}
                                        tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                        {orgStats.headcountByDesignation.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Utilization Health (Donut) */}
                <Card className="h-[450px] flex flex-col border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Activity className="w-5 h-5" />
                            Utilization Breakdown
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 min-h-0 p-6 relative">
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="w-64 h-64 rounded-full" />
                            </div>
                        ) : !orgStats?.utilizationStats ? (
                            <EmptyState title="No Data" description="No utilization health data available." className="h-full" />
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Allocated', value: orgStats.utilizationStats.allocated },
                                                { name: 'Partial', value: orgStats.utilizationStats.partial },
                                                { name: 'Bench', value: orgStats.utilizationStats.bench },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={90}
                                            outerRadius={130}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            <Cell fill="#00338D" stroke="none" />
                                            <Cell fill="#0091DA" stroke="none" />
                                            <Cell fill="#F5A623" stroke="none" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend iconType="circle" verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-18px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global</p>
                                    <p className="text-3xl font-black text-[#00338D]">86%</p>
                                    <p className="text-[10px] font-bold text-success-600 uppercase">Healthy</p>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 3: Top Performers & Bench Strength */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Performers Leaderboard */}
                <Card className="lg:col-span-2 flex flex-col border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-[#00338D]">
                            <Trophy className="w-5 h-5 text-warning-500" />
                            Organization Top Performers
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        {statsLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : !orgStats?.topPerformers || orgStats.topPerformers.length === 0 ? (
                            <EmptyState title="No Data" description="Leaderboard is initializing." className="p-12" />
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="py-4 px-6">Rank</th>
                                        <th className="py-4 px-6">Employee</th>
                                        <th className="py-4 px-6">Designation</th>
                                        <th className="py-4 px-6 text-center">Avg Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orgStats.topPerformers.slice(0, 5).map((performer, idx) => (
                                        <tr key={performer.employee.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="py-4 px-6 font-black text-gray-300 group-hover:text-[#00338D] transition-colors">#{idx + 1}</td>
                                            <td className="py-4 px-6 flex items-center gap-3">
                                                <Avatar name={performer.employee.fullName} size="sm" className="ring-2 ring-white" />
                                                <span className="text-sm font-bold text-text-primary group-hover:text-[#00338D] transition-colors">{performer.employee.fullName}</span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-text-secondary font-medium">{performer.employee.designationName}</td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="inline-flex items-center justify-center bg-success-50 text-success-700 px-3 py-1 rounded-full text-xs font-black shadow-sm ring-1 ring-success-100">
                                                    <Star className="w-3 h-3 mr-1 fill-success-700" />
                                                    {performer.averageRating.toFixed(1)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>

                {/* Bench Strength Watchlist */}
                <Card className="flex flex-col border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 p-6">
                        <CardTitle className="flex items-center gap-2 text-warning-700">
                            <AlertTriangle className="w-5 h-5" />
                            Critical Bench Strength
                        </CardTitle>
                    </CardHeader>
                    <div className="p-6 space-y-4">
                        {statsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : !orgStats?.benchEmployees || orgStats.benchEmployees.length === 0 ? (
                            <EmptyState title="Full Utilization" description="No unallocated resources detected." className="h-full" />
                        ) : (
                            orgStats.benchEmployees.map((bench) => (
                                <div key={bench.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={bench.fullName} size="xs" className="ring-1 ring-white" />
                                        <div>
                                            <p className="text-xs font-black text-text-primary group-hover:text-[#00338D] transition-colors">{bench.fullName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{bench.designationName}</p>
                                        </div>
                                    </div>
                                    <Link to={`/employees/${bench.id}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-[#00338D]" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-auto p-6 bg-gray-50/50 border-t border-gray-100">
                        <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest text-[#00338D] h-10">
                            View Resource Analytics
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
