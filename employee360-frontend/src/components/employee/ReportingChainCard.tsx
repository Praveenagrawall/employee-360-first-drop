import { Link } from 'react-router-dom';
import { Network, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, Avatar } from '../common';
import type { EmployeeDetail } from '../../types';

interface ReportingChainCardProps {
    employee: EmployeeDetail;
}

export function ReportingChainCard({ employee }: ReportingChainCardProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Network className="w-5 h-5 mr-2 text-primary" />
                    Reporting Chain
                </CardTitle>
            </CardHeader>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        Performance Manager
                    </div>
                    {employee.performanceManagerId ? (
                        <Link
                            to={`/employees/${employee.performanceManagerId}`}
                            className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-primary-100 hover:bg-primary-50 transition-colors group"
                        >
                            <Avatar name={employee.performanceManagerName!} size="md" className="mr-3" />
                            <div>
                                <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                                    {employee.performanceManagerName}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {employee.performanceManagerDesignation || 'Manager'}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Not Assigned</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        Reporting Manager
                    </div>
                    {employee.reportingManagerId ? (
                        <Link
                            to={`/employees/${employee.reportingManagerId}`}
                            className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-primary-100 hover:bg-primary-50 transition-colors group"
                        >
                            <Avatar name={employee.reportingManagerName!} size="md" className="mr-3" />
                            <div>
                                <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                                    {employee.reportingManagerName}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {employee.reportingManagerDesignation || 'Manager'}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Not Assigned</p>
                    )}
                </div>
            </div>

            <div className="mt-5 text-xs text-gray-400 bg-gray-50 p-2 rounded flex items-start">
                <span className="mr-1.5 leading-none">ℹ️</span>
                <p>Performance and Reporting managers may be different depending on current project assignments and career tracks.</p>
            </div>
        </Card>
    );
}
