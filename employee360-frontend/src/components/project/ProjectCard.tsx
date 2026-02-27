import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Briefcase,
    ChevronRight,
    User
} from 'lucide-react';
import { Card, Badge } from '../common';
import { cn, formatDate } from '../../utils';
import type { Project } from '../../types';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../../types/enums';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const navigate = useNavigate();

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]';
            case 'COMPLETED': return 'bg-[#F1F3F4] text-[#3C4043] border-[#E8EAED]';
            case 'ON_HOLD': return 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]';
            case 'PIPELINE': return 'bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]';
            default: return 'bg-[#F8F9FA] text-[#5F6368] border-[#E5E8EB]';
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CLIENT': return 'bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]';
            case 'INTERNAL': return 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]';
            case 'PROPOSAL': return 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <Card
            className="group cursor-pointer hover:bg-sidebar-hover transition-all duration-200 border-[#E5E8EB] rounded-card shadow-sm"
            onClick={() => navigate(`/projects/${project.id}`)}
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {project.projectCode}
                            </span>
                            <Badge className={cn("text-[8px] font-bold uppercase py-0.5 px-1.5 rounded-sm", getTypeStyles(project.type))}>
                                {PROJECT_TYPE_LABELS[project.type]}
                            </Badge>
                        </div>
                        <h3 className="text-base font-bold text-text-primary line-clamp-1 group-hover:text-kpmg-blue transition-colors">
                            {project.name}
                        </h3>
                    </div>
                    <Badge className={cn("text-[8px] font-bold uppercase py-0.5 px-1.5 rounded-sm", getStatusStyles(project.status))}>
                        {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                </div>

                <div className="space-y-2.5">
                    {project.clientName && (
                        <div className="flex items-center gap-2 text-xs text-text-primary">
                            <Briefcase className="w-3.5 h-3.5 text-kpmg-blue opacity-70" />
                            <span className="font-semibold truncate">{project.clientName}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <User className="w-3.5 h-3.5 text-text-muted opacity-60" />
                        <span className="truncate">EM: <span className="font-bold text-text-primary">{project.engagementManagerName || 'Unassigned'}</span></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Calendar className="w-3.5 h-3.5 text-text-muted opacity-60" />
                        <span className="font-medium">{formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : 'Present'}</span>
                    </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F1F3F5] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                            <Users className="w-3 h-3 text-kpmg-blue opacity-50" />
                            <span>{project.memberCount} members</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-kpmg-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Details
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </Card>
    );
}
