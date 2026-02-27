import { useState, useMemo } from 'react';
import {
    Plus,
    Filter,
    LayoutGrid,
    List,
    Briefcase,
    CheckCircle2,
    Clock,
    ClipboardList
} from 'lucide-react';
import { useProjects } from '../hooks/useProject';
import { useProjectOverview } from '../hooks/useAnalytics';
import { useUserContext } from '../context/UserContextProvider';
import { ProjectCard } from '../components/project/ProjectCard';
import { CreateProjectModal } from '../components/project/CreateProjectModal';
import { Button, SearchBar, SkeletonCard, Tabs, Card } from '../components/common';
import { PROJECT_TYPE, PROJECT_STATUS, type ProjectType, type ProjectStatus } from '../types/enums';
import { cn } from '../utils';

export default function ProjectsPage() {
    const { hasPermission } = useUserContext();
    const canCreateProject = hasPermission('CREATE_PROJECT');
    const canViewStats = hasPermission('VIEW_ORG_ANALYTICS');

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page] = useState(0);

    const { data: projectsData, isLoading } = useProjects({
        type: activeTab === 'ALL' ? undefined : activeTab as ProjectType,
        status: statusFilter === 'ALL' ? undefined : statusFilter as ProjectStatus
    }, page, 12);

    const { data: stats } = useProjectOverview();

    const tabs = [
        { id: 'ALL', label: 'All Projects' },
        { id: PROJECT_TYPE.CLIENT, label: 'Client' },
        { id: PROJECT_TYPE.INTERNAL, label: 'Internal' },
        { id: PROJECT_TYPE.PROPOSAL, label: 'Proposals' },
    ];

    const filteredProjects = useMemo(() => {
        if (!projectsData?.content) return [];
        if (!searchQuery) return projectsData.content;

        const query = searchQuery.toLowerCase();
        return projectsData.content.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.projectCode.toLowerCase().includes(query) ||
            p.clientName?.toLowerCase().includes(query)
        );
    }, [projectsData, searchQuery]);

    const statItems = useMemo(() => {
        if (!canViewStats || !stats) return [];
        return [
            { label: 'Active', value: stats.activeProjects, icon: Briefcase, color: 'text-status-success', bg: 'bg-[#E6F4EA]' },
            { label: 'Completed', value: stats.completedProjects, icon: CheckCircle2, color: 'text-text-muted', bg: 'bg-[#F8F9FA]' },
            { label: 'On Hold', value: stats.onHoldProjects, icon: Clock, color: 'text-status-warning', bg: 'bg-[#FFF4E5]' },
            { label: 'Pipeline', value: stats.pipelineProjects, icon: ClipboardList, color: 'text-kpmg-blue', bg: 'bg-sidebar-active' },
        ];
    }, [canViewStats, stats]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Projects</h1>
                    <p className="text-sm font-medium text-text-muted">Manage organization projects and team allocations</p>
                </div>
                {canCreateProject && (
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        leftIcon={<Plus className="w-4 h-4" />}
                        size="md"
                    >
                        New Project
                    </Button>
                )}
            </div>

            {/* Stats Bar */}
            {statItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statItems.map((item, idx) => (
                        <Card key={idx} className="flex items-center gap-4 p-4 border-[#E5E8EB] bg-card-bg rounded-card shadow-sm">
                            <div className={cn("p-2 rounded bg-white border border-[#E5E8EB]", item.color)}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.label}</p>
                                <p className="text-xl font-bold text-text-primary">{item.value}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            <Card className="p-4 border-[#E5E8EB] bg-card-bg rounded-card shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <SearchBar
                            placeholder="Search projects..."
                            onSearch={setSearchQuery}
                            className="w-full md:w-80"
                        />
                        <div className="flex border border-[#E5E8EB] rounded p-1 bg-page-bg">
                            <button
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                                className={cn("p-1.5 rounded transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-kpmg-blue" : "text-text-muted hover:text-text-primary")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                title="List View"
                                className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? "bg-white shadow-sm text-kpmg-blue" : "text-text-muted hover:text-text-primary")}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#F1F3F5]">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Filter className="w-3 h-3" /> Status:
                    </span>
                    {['ALL', ...Object.values(PROJECT_STATUS)].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-3 py-1 rounded text-[10px] font-bold transition-all border",
                                statusFilter === status
                                    ? "bg-sidebar-active text-kpmg-blue border-[#D0E1F9]"
                                    : "bg-card-bg text-text-muted border-[#E5E8EB] hover:border-[#D0E1F9]"
                            )}
                        >
                            {status === 'ALL' ? 'All Status' : status}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                )}>
                    {filteredProjects.map((project: import('../types').Project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search query</p>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => {
                            setActiveTab('ALL');
                            setStatusFilter('ALL');
                            setSearchQuery('');
                        }}
                    >
                        Clear all filters
                    </Button>
                </div>
            )}

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
