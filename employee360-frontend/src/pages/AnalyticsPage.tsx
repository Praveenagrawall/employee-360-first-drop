import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import {
    Users, TrendingUp, Briefcase, Activity,
    AlertTriangle, Star, Building2, Award
} from 'lucide-react';
import { useOrgOverview, useProjectOverview, usePerformanceOverview } from '../hooks/useAnalytics';
import { useUserContext } from '../context/UserContextProvider';
import { Avatar, Card, Badge, SkeletonCard } from '../components/common';

// ─── KPMG Brand Colors ──────────────────────────────────────────────────────
const KPMG = {
    blue: '#00338D',
    light: '#0091DA',
    teal: '#00A3A1',
    purple: '#483698',
    pink: '#C6007E',
    green: '#00A652',
    amber: '#F0A500',
    red: '#D41F2C',
};

// ─── Section heading ────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded bg-sidebar-active flex items-center justify-center border border-[#D0E1F9]">
                <Icon className="w-5 h-5 text-kpmg-blue" />
            </div>
            <div>
                <h2 className="text-base font-bold text-text-primary">{title}</h2>
                {subtitle && <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ─── Custom Donut Label ─────────────────────────────────────────────────────
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.06) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

// ─── Stat Pill ──────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[#F1F3F5] last:border-0">
            <span className="text-xs text-text-muted font-medium">{label}</span>
            <span className="text-xs font-bold" style={{ color }}>{value}</span>
        </div>
    );
}

// ─── Card 1: Headcount ──────────────────────────────────────────────────────
function HeadcountCard() {
    const { data, isLoading } = useOrgOverview();

    const chartData = useMemo(() => {
        if (!data) return [];
        return [...data.headcountByDesignation]
            .sort((a, b) => b.count - a.count)
            .map(d => ({ name: d.designation.replace(/_/g, ' '), count: d.count }));
    }, [data]);

    const totalHeadcount = useMemo(() =>
        data?.headcountByDesignation.reduce((s, d) => s + d.count, 0) ?? 0
        , [data]);

    if (isLoading) return <SkeletonCard />;

    return (
        <Card className="p-6 flex flex-col h-full">
            <SectionHeader icon={Users} title="Headcount Overview" subtitle="Employees by designation level" />

            {/* Big Number */}
            <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold text-kpmg-blue">{totalHeadcount}</span>
                <span className="text-text-muted font-bold uppercase tracking-widest text-[10px] pb-2">total employees</span>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex-1 min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={130}
                            tick={{ fontSize: 11, fill: '#555' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                            cursor={{ fill: '#f5f7ff' }}
                        />
                        <Bar dataKey="count" fill={KPMG.blue} radius={[0, 4, 4, 0]} barSize={14}
                            label={{ position: 'right', fontSize: 11, fill: '#666', fontWeight: 600 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

// ─── Card 2: Utilization ────────────────────────────────────────────────────
function UtilizationCard() {
    const { data, isLoading } = useOrgOverview();

    const chartData = useMemo(() => {
        if (!data) return [];
        const u = data.utilizationStats;
        const total = u.allocated + u.partial + u.bench;
        return [
            { name: 'Fully Allocated', value: u.allocated, color: KPMG.teal, pct: total ? ((u.allocated / total) * 100).toFixed(0) : 0 },
            { name: 'Partial', value: u.partial, color: KPMG.amber, pct: total ? ((u.partial / total) * 100).toFixed(0) : 0 },
            { name: 'On Bench', value: u.bench, color: KPMG.red, pct: total ? ((u.bench / total) * 100).toFixed(0) : 0 },
        ];
    }, [data]);

    const benchList = data?.benchEmployees?.slice(0, 5) ?? [];

    if (isLoading) return <SkeletonCard />;

    return (
        <Card className="p-6 flex flex-col h-full">
            <SectionHeader icon={Activity} title="Utilization" subtitle="Allocation status across the org" />

            <div className="flex gap-4 mb-6">
                {/* Donut */}
                <div className="w-44 h-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={72}
                                paddingAngle={2}
                                dataKey="value"
                                labelLine={false}
                                label={DonutLabel}
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend + numbers */}
                <div className="flex flex-col justify-center gap-3 flex-1">
                    {chartData.map(d => (
                        <div key={d.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-xs text-gray-600 flex-1">{d.name}</span>
                            <span className="text-sm font-bold" style={{ color: d.color }}>{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bench list */}
            {benchList.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">On Bench</p>
                    <div className="space-y-2">
                        {benchList.map(emp => (
                            <div key={emp.id} className="flex items-center gap-2.5">
                                <Avatar name={emp.fullName} src={emp.profilePicUrl} size="sm" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{emp.fullName}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{emp.designationName} · {emp.department}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

// ─── Card 3: Performance Distribution ──────────────────────────────────────
function PerformanceCard() {
    const { data, isLoading } = usePerformanceOverview();

    const chartData = useMemo(() => {
        if (!data) return [];
        return [1, 2, 3, 4, 5].map(r => ({
            rating: `★ ${r}`,
            count: data.ratingDistribution[r] ?? 0,
        }));
    }, [data]);

    const avgRating = data?.organizationAverageRating ?? 0;
    const topPerformers = data?.topPerformers?.slice(0, 5) ?? [];

    if (isLoading) return <SkeletonCard />;

    return (
        <Card className="p-6 flex flex-col h-full">
            <SectionHeader icon={TrendingUp} title="Performance Distribution" subtitle="Rating spread across all reviews" />

            {/* Avg rating badge */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: `${KPMG.purple}15`, border: `1.5px solid ${KPMG.purple}30` }}>
                    <Star className="w-4 h-4" style={{ color: KPMG.purple, fill: KPMG.purple }} />
                    <span className="text-sm font-bold" style={{ color: KPMG.purple }}>{avgRating.toFixed(1)} org average</span>
                </div>
                <span className="text-xs text-gray-400">
                    {data?.completedReviewsCount ?? 0} completed · {data?.pendingReviewsCount ?? 0} pending
                </span>
            </div>

            {/* Bar chart */}
            <div className="h-40 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="rating" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                            cursor={{ fill: '#f5f7ff' }}
                        />
                        <Bar dataKey="count" fill={KPMG.purple} radius={[4, 4, 0, 0]} barSize={28} />
                        <ReferenceLine
                            x={`★ ${Math.round(avgRating)}`}
                            stroke={KPMG.pink}
                            strokeDasharray="4 2"
                            strokeWidth={2}
                            label={{ value: 'Avg', fill: KPMG.pink, fontSize: 10, fontWeight: 700 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top performers */}
            {topPerformers.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                        <Award className="w-3 h-3 inline mr-1" />Top Performers
                    </p>
                    <div className="space-y-2">
                        {topPerformers.map((emp, i) => (
                            <div key={emp.id} className="flex items-center gap-2.5">
                                <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                                <Avatar name={emp.fullName} src={emp.profilePicUrl} size="sm" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{emp.fullName}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{emp.designationName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

// ─── Card 4: Project Portfolio ──────────────────────────────────────────────
function ProjectPortfolioCard() {
    const { data, isLoading } = useProjectOverview();
    const navigate = useNavigate();

    const pieData = useMemo(() => {
        if (!data) return [];
        return Object.entries(data.byType).map(([k, v], i) => ({
            name: k,
            value: v,
            color: [KPMG.blue, KPMG.light, KPMG.teal][i % 3],
        }));
    }, [data]);

    const atRisk = data?.atRiskProjects?.slice(0, 4) ?? [];

    if (isLoading) return <SkeletonCard />;

    return (
        <Card className="p-6 flex flex-col h-full">
            <SectionHeader icon={Briefcase} title="Project Portfolio" subtitle="Distribution and health of all projects" />

            <div className="flex gap-4 mb-5">
                {/* Pie */}
                <div className="w-40 h-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={65}
                                innerRadius={30}
                                paddingAngle={2}
                                dataKey="value"
                                labelLine={false}
                                label={DonutLabel}
                            >
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats + legend */}
                <div className="flex flex-col justify-center gap-2 flex-1">
                    <StatPill label="Total" value={data?.totalProjects ?? 0} color={KPMG.blue} />
                    <StatPill label="Active" value={data?.activeProjects ?? 0} color={KPMG.teal} />
                    <StatPill label="Completed" value={data?.completedProjects ?? 0} color="#6b7280" />
                    <StatPill label="On Hold" value={data?.onHoldProjects ?? 0} color={KPMG.amber} />
                    <StatPill label="Pipeline" value={data?.pipelineProjects ?? 0} color={KPMG.light} />
                </div>
            </div>

            {/* At-risk projects */}
            {atRisk.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                        style={{ color: KPMG.red }}>
                        <AlertTriangle className="w-3.5 h-3.5" /> At-Risk Projects
                    </p>
                    <div className="space-y-2">
                        {atRisk.map(proj => (
                            <button
                                key={proj.id}
                                onClick={() => navigate(`/projects/${proj.id}`)}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-left group"
                            >
                                <div className="overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-red-700">{proj.name}</p>
                                    <p className="text-[10px] text-gray-500">{proj.clientName ?? 'Internal'} · {proj.projectCode}</p>
                                </div>
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5 shrink-0 ml-2">
                                    Overdue
                                </Badge>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const navigate = useNavigate();
    const { hasPermission } = useUserContext();

    // Role guard
    if (!hasPermission('VIEW_ORG_ANALYTICS')) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    return (
        <div className="w-full space-y-6">
            {/* Page header */}
            <div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-kpmg-blue flex items-center justify-center shadow-lg border border-kpmg-blue-dark">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight uppercase">Organization Analytics</h1>
                        <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-wider">Real-time insights across headcount, utilization, performance and projects</p>
                    </div>
                </div>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HeadcountCard />
                <UtilizationCard />
                <PerformanceCard />
                <ProjectPortfolioCard />
            </div>
        </div>
    );
}
