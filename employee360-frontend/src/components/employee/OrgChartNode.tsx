import { Link } from 'react-router-dom';
import { Avatar } from '../common';
import { cn } from '../../utils/cn';
import type { EmployeeSlim } from '../../types';

interface OrgChartNodeProps {
    employee: EmployeeSlim;
    isActive?: boolean;
    className?: string;
}

export function OrgChartNode({ employee, isActive, className }: OrgChartNodeProps) {
    return (
        <Link
            to={`/employees/${employee.id}`}
            className={cn(
                "flex flex-col items-center p-4 rounded-2xl transition-all w-48 text-center group",
                isActive
                    ? "bg-[#00338D] text-white shadow-xl scale-110 z-10"
                    : "bg-white border border-gray-100 hover:border-[#00338D] hover:shadow-md",
                className
            )}
        >
            <Avatar
                name={employee.fullName}
                className={cn("mb-3 ring-4", isActive ? "ring-white/20" : "ring-gray-50")}
                size="md"
            />
            <div className="w-full">
                <p className={cn("text-xs font-black truncate px-2", isActive ? "text-white" : "text-text-primary group-hover:text-[#00338D]")}>
                    {employee.fullName}
                </p>
                <p className={cn("text-[10px] uppercase tracking-tighter font-bold", isActive ? "text-blue-100" : "text-gray-400")}>
                    {employee.designationName}
                </p>
            </div>
        </Link>
    );
}
