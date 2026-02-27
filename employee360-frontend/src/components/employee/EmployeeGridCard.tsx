import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, Avatar, EmptyState } from '../common';
import type { EmployeeSlim } from '../../types';

interface EmployeeGridCardProps {
    title: string;
    icon: ReactNode;
    employees: EmployeeSlim[];
    emptyMessage?: string;
    emptyIcon?: ReactNode;
    maxDisplay?: number;
}

export function EmployeeGridCard({
    title,
    icon,
    employees = [],
    emptyMessage,
    emptyIcon,
    maxDisplay
}: EmployeeGridCardProps) {

    const displayList = maxDisplay && maxDisplay > 0 ? employees.slice(0, maxDisplay) : employees;
    const hasMore = maxDisplay ? employees.length > maxDisplay : false;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <span className="text-primary mr-2 flex items-center shrink-0">{icon}</span>
                    <span className="truncate">{title}</span>
                    {employees.length > 0 && (
                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 flex items-center">
                            {employees.length}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            {employees.length === 0 ? (
                <EmptyState
                    icon={emptyIcon || icon}
                    title={`No ${title}`}
                    description={emptyMessage || `There are no ${title.toLowerCase()} to display.`}
                    className="py-8"
                />
            ) : (
                <div className="flex flex-col h-[calc(100%-4rem)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        {displayList.map((emp) => (
                            <Link
                                key={emp.id}
                                to={`/employees/${emp.id}`}
                                className="flex items-center p-3 rounded-lg border border-gray-100 bg-white hover:border-primary-100 hover:bg-primary-50 transition-colors group shadow-sm overflow-hidden"
                            >
                                <Avatar
                                    name={emp.fullName}
                                    src={emp.profilePicUrl}
                                    size="md"
                                    className="mr-3 shrink-0"
                                />
                                <div className="overflow-hidden min-w-0 flex-1">
                                    <p className="font-medium text-text-primary text-sm truncate group-hover:text-primary transition-colors">
                                        {emp.fullName}
                                    </p>
                                    <p className="text-xs text-text-secondary truncate">
                                        {emp.designationName}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="pt-3 mt-3 text-center border-t border-gray-100 shrink-0">
                            <button
                                className="text-sm font-medium text-primary hover:underline inline-block px-4 py-2 focus:outline-none"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // In a real app, this would open a modal with the full list
                                    console.log('View all clicked');
                                }}
                            >
                                View all {employees.length} {title.toLowerCase()}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
