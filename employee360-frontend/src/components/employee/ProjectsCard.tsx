import { Briefcase, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, ProgressBar, ProjectTypeBadge, EmptyState } from '../common';
import type { EmployeeDetail } from '../../types';

interface ProjectsCardProps {
    employee: EmployeeDetail;
}

export function ProjectsCard({ employee }: ProjectsCardProps) {
    const teams = employee.currentTeams || [];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    Active Projects ({teams.length})
                </CardTitle>
            </CardHeader>

            {teams.length === 0 ? (
                <EmptyState
                    icon={<Briefcase />}
                    title="No Active Projects"
                    description="This employee is not currently allocated to any active projects."
                    className="py-10"
                />
            ) : (
                <div className="space-y-4">
                    {teams.map((team, idx) => (
                        <div key={`${team.projectId}-${team.teamId}-${idx}`} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
                                <div>
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <Link to={`/projects/${team.projectId}`} className="font-semibold text-text-primary hover:text-primary transition-colors">
                                            {team.projectName}
                                        </Link>
                                        <ProjectTypeBadge type={team.projectType} />
                                    </div>
                                    {team.clientName && (
                                        <p className="text-xs text-text-secondary">Client: <span className="font-medium text-text-primary">{team.clientName}</span></p>
                                    )}
                                </div>

                                <Link to={`/projects/${team.projectId}`} className="text-xs text-primary font-medium flex items-center hover:underline shrink-0">
                                    View Project <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                            </div>

                            <div className="bg-white p-3 rounded-md border border-gray-100 mt-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">Role</span>
                                        <span className="text-sm font-medium text-text-primary">{team.roleInTeam}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">Team Lead</span>
                                        <span className="text-sm font-medium text-text-primary truncate">{team.teamLeadName || '—'}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <ProgressBar
                                        value={team.allocationPercentage}
                                        label="Allocation"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <ProgressBar
                            value={employee.totalAllocationPercentage}
                            label="Total Current Allocation"
                            size="md"
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}
