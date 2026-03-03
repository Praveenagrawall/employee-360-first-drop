import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Briefcase,
    ChevronLeft,
    Edit,
    Plus,
    User,
    MessageSquare,
    Clock,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Layout
} from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { useTeamsByProject } from '../hooks/useTeam';
import { useProjectFeedback } from '../hooks/useFeedback';
import { useUserContext } from '../context/UserContextProvider';
import AddToTeamModal from '../components/allocation/AddToTeamModal';
import { useQueryClient } from '@tanstack/react-query';
import {
    Card,
    Badge,
    Button,
    SkeletonField,
    SkeletonCard
} from '../components/common';
import { cn, formatDate } from '../utils';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../types/enums';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = parseInt(id || '0');
    const { currentUser, hasPermission } = useUserContext();

    const { data: project, isLoading: isProjectLoading } = useProject(projectId);
    const { data: teams, isLoading: isTeamsLoading } = useTeamsByProject(projectId);
    const { data: feedback, isLoading: isFeedbackLoading } = useProjectFeedback(projectId);
    const queryClient = useQueryClient();

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<{ id: number; name: string } | null>(null);
    const [expandedTeams, setExpandedTeams] = useState<Record<number, boolean>>({});

    const canEdit = hasPermission('EDIT_PROJECT') || (project?.engagementManagerId === currentUser?.employeeId);
    const canManageMembers = hasPermission('ASSIGN_TEAM_MEMBERS');

    if (isProjectLoading) return <DetailSkeleton />;

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Layout className="w-16 h-16 text-gray-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Project Not Found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/projects')}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    const toggleTeam = (teamId: number) => {
        setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
    };

    const handleAddMember = (teamId: number, teamName: string) => {
        setSelectedTeam({ id: teamId, name: teamName });
        setIsAddMemberModalOpen(true);
    };

    const getProjectProgress = () => {
        if (!project.startDate) return 0;
        const start = new Date(project.startDate).getTime();
        const end = project.endDate ? new Date(project.endDate).getTime() : new Date().getTime() + 1000 * 60 * 60 * 24 * 365;
        const now = new Date().getTime();

        if (now < start) return 0;
        if (now > end) return 100;

        return Math.round(((now - start) / (end - start)) * 100);
    };

    return (
        <div className="w-full space-y-8">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-1.5 text-text-muted hover:text-kpmg-blue font-bold transition-colors group text-sm"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Projects
                </button>
                {canEdit && (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => {/* Edit toggle */ }}
                        >
                            Edit Project
                        </Button>
                    </div>
                )}
            </div>

            {/* Header Card */}
            <Card className="p-8 border-[#E5E8EB] bg-card-bg rounded-card shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Briefcase className="w-32 h-32 text-kpmg-blue" />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-sidebar-active text-kpmg-blue border-[#D0E1F9] font-bold uppercase tracking-wider px-2 py-0.5 text-[10px]">
                                    {PROJECT_TYPE_LABELS[project.type as import('../types/enums').ProjectType]}
                                </Badge>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{project.projectCode}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-text-primary tracking-tight">{project.name}</h1>
                        </div>
                        <Badge className={cn(
                            "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-sm",
                            project.status === 'ACTIVE' ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]" : "bg-[#F1F3F4] text-[#3C4043] border-[#E8EAED]"
                        )}>
                            {PROJECT_STATUS_LABELS[project.status as import('../types/enums').ProjectStatus]}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#F1F3F5]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-sidebar-active flex items-center justify-center text-kpmg-blue">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Client</p>
                                <p className="text-base font-bold text-text-primary">{project.clientName || 'Internal Project'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-page-bg flex items-center justify-center text-kpmg-blue">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Engagement Manager</p>
                                <p className="text-base font-bold text-text-primary">{project.engagementManagerName || 'Unassigned'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-page-bg flex items-center justify-center text-kpmg-blue">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Project Timeline</p>
                                <p className="text-base font-bold text-text-primary">
                                    {formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : 'Present'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Teams Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-kpmg-blue" />
                                Project Teams
                            </h2>
                        </div>

                        {isTeamsLoading ? (
                            <div className="space-y-4">
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : teams && teams.length > 0 ? (
                            <div className="space-y-4">
                                {teams.map(team => (
                                    <Card key={team.id} className="overflow-hidden border-[#E5E8EB] shadow-sm hover:bg-sidebar-hover/30 transition-all rounded-card bg-card-bg">
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-base font-bold text-text-primary">{team.name}</h3>
                                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-0.5">Lead: <span className="text-kpmg-blue">{team.teamLeadName || 'Unassigned'}</span></p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right mr-4">
                                                        <p className="text-[10px] font-bold text-text-muted uppercase">Members</p>
                                                        <p className="text-base font-bold text-text-primary">{team.memberCount}</p>
                                                    </div>
                                                    {canManageMembers && (
                                                        <button
                                                            onClick={() => handleAddMember(team.id, team.name)}
                                                            className="p-1.5 rounded bg-sidebar-active text-kpmg-blue hover:bg-kpmg-blue hover:text-white transition-all"
                                                            title="Add Member"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleTeam(team.id)}
                                                        className="p-1.5 rounded hover:bg-page-bg text-text-muted transition-all"
                                                        title={expandedTeams[team.id] ? "Collapse" : "Expand"}
                                                    >
                                                        {expandedTeams[team.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedTeams[team.id] && (
                                                <div className="mt-4 pt-4 border-t border-[#F1F3F5] overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-[#F1F3F5]">
                                                                <th className="pb-2 px-2">Name</th>
                                                                <th className="pb-2 px-2">Role</th>
                                                                <th className="pb-2 px-2 text-center">Alloc %</th>
                                                                <th className="pb-2 px-2">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-[#F1F3F5]">
                                                            {team.members.map(member => (
                                                                <tr key={member.id} className="group hover:bg-page-bg">
                                                                    <td className="py-2.5 px-2">
                                                                        <button
                                                                            onClick={() => navigate(`/employees/${member.employeeId}`)}
                                                                            className="text-sm font-bold text-text-primary hover:text-kpmg-blue"
                                                                        >
                                                                            {member.employeeName}
                                                                        </button>
                                                                    </td>
                                                                    <td className="py-2.5 px-2 text-xs text-text-muted font-medium">{member.roleInTeam || 'Member'}</td>
                                                                    <td className="py-2.5 px-2 text-center">
                                                                        <Badge className={cn(
                                                                            "text-[9px] font-bold py-0 px-1.5 rounded-sm",
                                                                            member.allocationPercentage >= 100 ? "bg-[#E6F4EA] text-[#137333]" :
                                                                                member.allocationPercentage >= 50 ? "bg-[#FEF7E0] text-[#B06000]" :
                                                                                    "bg-[#FCE8E6] text-[#C5221F]"
                                                                        )}>
                                                                            {member.allocationPercentage}%
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="py-2.5 px-2">
                                                                        <Badge color={member.status === 'ACTIVE' ? 'success' : 'gray'} variant="soft" className="text-[9px] py-0 px-1.5">
                                                                            {member.status}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No teams assigned yet</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Timeline & Progress */}
                    <Card className="p-6 space-y-5 bg-card-bg border-[#E5E8EB] rounded-card shadow-sm">
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                            <Clock className="w-4 h-4 text-status-warning" />
                            Project Progress
                        </h3>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                                <span className="text-text-muted uppercase tracking-wider">Completion Status</span>
                                <span className="text-kpmg-blue">{getProjectProgress()}%</span>
                            </div>
                            <div className="w-full h-2 bg-page-bg rounded-full overflow-hidden border border-[#E5E8EB]">
                                <div
                                    className="h-full bg-kpmg-blue rounded-full transition-all duration-1000"
                                    style={{ width: `${getProjectProgress()}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded bg-[#E6F4EA] flex items-center justify-center text-[#137333]">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status Update</p>
                                    <p className="text-xs font-medium text-text-primary leading-relaxed">Project is on track and following the schedule.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Feedback Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-kpmg-blue-light" />
                                Project Feedback
                            </h3>
                            <Badge className="bg-sidebar-active text-kpmg-blue border-[#D0E1F9] font-bold text-[10px]">{feedback?.length || 0}</Badge>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                            {isFeedbackLoading ? (
                                <SkeletonField />
                            ) : feedback && feedback.length > 0 ? (
                                feedback.map(item => (
                                    <div key={item.id} className="p-4 rounded border border-[#E5E8EB] bg-card-bg hover:bg-sidebar-hover transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-kpmg-blue uppercase tracking-widest">{item.type}</span>
                                            <span className="text-[9px] text-text-muted font-bold">{formatDate(item.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-text-primary italic leading-relaxed font-medium">"{item.content}"</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-sidebar-active" />
                                            <span className="text-[10px] font-bold text-text-muted truncate">— {item.fromEmployeeName}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-page-bg rounded border border-dashed border-[#E5E8EB]">
                                    <MessageSquare className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">No feedback entries yet</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {selectedTeam && project && (
                <AddToTeamModal
                    isOpen={isAddMemberModalOpen}
                    onClose={() => {
                        setIsAddMemberModalOpen(false);
                        setSelectedTeam(null);
                        queryClient.invalidateQueries({ queryKey: ['teams', projectId] });
                    }}
                    teamId={selectedTeam.id}
                    projectId={projectId}
                    projectName={project.name}
                />
            )}
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="w-full space-y-8 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded-full" />
            <div className="h-64 w-full bg-gray-100 rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-40 w-full bg-gray-100 rounded-2xl" />
                    <div className="h-40 w-full bg-gray-100 rounded-2xl" />
                </div>
                <div className="space-y-8">
                    <div className="h-64 w-full bg-gray-100 rounded-2xl" />
                    <div className="h-64 w-full bg-gray-100 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
