import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
    Download,
    X,
    ChevronDown,
    ChevronUp,
    Search,
    Mail,
    MapPin,
    Building2
} from 'lucide-react';
import { useEmployeeFilter } from '../hooks';
import { useUserContext } from '../context/UserContextProvider';
import { employeeApi } from '../api';
import toast from 'react-hot-toast';
import {
    Avatar,
    Button,
    Card,
    EmptyState,
} from '../components/common';

import { cn } from '../utils';
import type { Employee } from '../types';

const DEPARTMENTS = ['Digital Lighthouse', 'Tax & Advisory', 'Risk Advisory', 'Management Consulting'];
const DESIGNATIONS = [
    { label: 'Associate Consultant', level: 1 },
    { label: 'Consultant', level: 2 },
    { label: 'Assistant Manager', level: 3 },
    { label: 'Manager', level: 4 },
    { label: 'Assistant Director', level: 5 },
    { label: 'Director', level: 6 },
    { label: 'Partner', level: 7 },
];
const LOCATIONS = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Gurgaon'];

export default function EmployeesPage() {
    const navigate = useNavigate();
    const { hasPermission, hasAtLeastLevel } = useUserContext();

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);

    // Pagination State
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);

    // Filter State
    const [filters, setFilters] = useState({
        q: '',
        designation: '',
        department: '',
        location: '',
        active: true
    });

    // Sorting State (Local for List View)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Data Fetching
    const { data: pagedData, isLoading } = useEmployeeFilter(filters, page, pageSize);

    const employees = useMemo(() => pagedData?.content || [], [pagedData]);
    const totalElements = pagedData?.totalElements || 0;
    const totalPages = pagedData?.totalPages || 0;

    // Permissions
    const canSeeFullSearch = hasPermission('SEARCH_FULL');
    const canExport = hasAtLeastLevel(6);

    // Handlers
    const handleFilterChange = (key: string, value: string | boolean | null) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            q: '',
            designation: '',
            department: '',
            location: '',
            active: true
        });
        setPage(0);
    };

    const handleExport = async () => {
        try {
            const blob = await employeeApi.exportEmployees();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees-directory.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Directory exported successfully');
        } catch (error) {
            toast.error('Failed to export directory');
        }
    };

    // Sorting Logic
    const sortedEmployees = useMemo(() => {
        if (!sortConfig) return employees;
        const sorted = [...employees].sort((a, b) => {
            const valA = (a as any)[sortConfig.key];
            const valB = (b as any)[sortConfig.key];
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [employees, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            {/* Page Header - Corporate Styled */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Employee Directory</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        {isLoading ? (
                            <span className="inline-block w-32 h-4 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            `Manage and view all members of the organization (${totalElements})`
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex bg-[#E2E8F0] p-1 rounded">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                viewMode === 'grid' ? "bg-white shadow-sm text-kpmg-blue" : "text-text-muted hover:text-text-primary"
                            )}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                viewMode === 'list' ? "bg-white shadow-sm text-kpmg-blue" : "text-text-muted hover:text-text-primary"
                            )}
                            title="List View"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Filter className="w-3.5 h-3.5" />}
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                        {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>

                    {canExport && (
                        <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Bar - KPMG Card Design */}
            {isFiltersOpen && (
                <Card className="p-4 border-[#E5E8EB]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Name, code, email..."
                                    value={filters.q}
                                    onChange={(e) => handleFilterChange('q', e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm focus:ring-1 focus:ring-kpmg-blue focus:border-kpmg-blue transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Designation</label>
                            <select
                                value={filters.designation}
                                onChange={(e) => handleFilterChange('designation', e.target.value)}
                                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm focus:ring-1 focus:ring-kpmg-blue focus:border-kpmg-blue outline-none"
                            >
                                <option value="">All Designations</option>
                                {DESIGNATIONS.map((d) => (
                                    <option key={d.level} value={d.level}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm focus:ring-1 focus:ring-kpmg-blue focus:border-kpmg-blue outline-none"
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-sm focus:ring-1 focus:ring-kpmg-blue focus:border-kpmg-blue outline-none"
                            >
                                <option value="">All Locations</option>
                                {LOCATIONS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</label>
                                <div className="flex bg-[#E2E8F0] p-1 rounded w-full">
                                    <button
                                        onClick={() => handleFilterChange('active', true)}
                                        className={cn(
                                            "flex-1 py-1 px-2 rounded text-[11px] font-bold transition-all",
                                            filters.active ? "bg-white text-kpmg-blue shadow-sm" : "text-text-muted"
                                        )}
                                    >
                                        ACTIVE
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('active', null)}
                                        className={cn(
                                            "flex-1 py-1 px-2 rounded text-[11px] font-bold transition-all",
                                            filters.active === null ? "bg-white text-kpmg-blue shadow-sm" : "text-text-muted"
                                        )}
                                    >
                                        ALL
                                    </button>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="mt-6 text-text-muted hover:text-status-error"
                                leftIcon={<X className="w-3.5 h-3.5" />}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-transparent py-1">
                {isLoading ? (
                    <div className={cn(
                        "grid gap-4",
                        viewMode === 'grid'
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                    )}>
                        {Array.from({ length: pageSize }).map((_, i) => (
                            <Card key={i} className="p-4 space-y-4 border-[#E5E8EB]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#F4F6F9] animate-pulse rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-[#F4F6F9] animate-pulse rounded w-3/4" />
                                        <div className="h-3 bg-[#F4F6F9] animate-pulse rounded w-1/2" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : employees.length === 0 ? (
                    <EmptyState
                        title="No results found"
                        description="Adjust your search or filters to find what you're looking for."
                    />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {employees.map((emp) => (
                            <Card
                                key={emp.id}
                                className="p-5 flex flex-col items-center text-center hover:border-kpmg-blue-light transition-all cursor-pointer group border-[#E5E8EB]"
                                onClick={() => navigate(`/employees/${emp.id}`)}
                            >
                                <Avatar
                                    name={emp.fullName}
                                    src={emp.profilePicUrl}
                                    size="lg"
                                />
                                <div className="mt-4 w-full min-w-0">
                                    <h3 className="font-bold text-text-primary group-hover:text-kpmg-blue transition-colors truncate text-sm">
                                        {emp.fullName}
                                    </h3>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                                        {emp.designationName}
                                    </p>

                                    <div className="mt-4 space-y-2 text-xs text-text-secondary border-t border-[#F1F3F5] pt-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="truncate">{emp.department}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-text-muted" />
                                            <span>{emp.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-kpmg-blue-light font-semibold">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{emp.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="overflow-hidden border-[#E5E8EB]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-table-header-bg border-b border-[#E5E8EB]">
                                        <th
                                            className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider cursor-pointer hover:bg-[#D9E9F7]"
                                            onClick={() => requestSort('fullName')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Employee Name {sortConfig?.key === 'fullName' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                            </div>
                                        </th>
                                        {canSeeFullSearch && (
                                            <th
                                                className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider cursor-pointer hover:bg-[#D9E9F7]"
                                                onClick={() => requestSort('empCode')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    ID {sortConfig?.key === 'empCode' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                </div>
                                            </th>
                                        )}
                                        <th className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider">Role & Grade</th>
                                        <th className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider">Service Line</th>
                                        <th className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider">Office</th>
                                        {canSeeFullSearch && (
                                            <>
                                                <th className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider">Reporting To</th>
                                                <th className="py-3 px-4 text-[11px] font-bold text-text-primary uppercase tracking-wider text-center">Utilization</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F3F5]">
                                    {sortedEmployees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="hover:bg-page-bg cursor-pointer transition-colors group"
                                            onClick={() => navigate(`/employees/${emp.id}`)}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={emp.fullName} src={emp.profilePicUrl} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-text-primary group-hover:text-kpmg-blue transition-colors truncate">
                                                            {emp.fullName}
                                                        </p>
                                                        <p className="text-[10px] text-text-muted truncate">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {canSeeFullSearch && (
                                                <td className="py-3 px-4">
                                                    <span className="text-[10px] font-bold text-text-muted">
                                                        {emp.empCode}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="py-3 px-4">
                                                <span className="text-[11px] font-bold text-text-primary uppercase">
                                                    {emp.designationName}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-text-secondary">
                                                {emp.department}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-text-secondary">
                                                {emp.location || '—'}
                                            </td>
                                            {canSeeFullSearch && (
                                                <>
                                                    <td className="py-3 px-4 text-xs text-text-secondary">
                                                        {emp.reportingManagerName || <span className="text-text-muted italic">Not Assigned</span>}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-12 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all",
                                                                        (emp.totalAllocation || 0) >= 100 ? "bg-status-success" :
                                                                            (emp.totalAllocation || 0) > 0 ? "bg-status-warning" : "bg-status-error"
                                                                    )}
                                                                    style={{ width: `${Math.min(100, emp.totalAllocation || 0)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-text-secondary min-w-[28px]">
                                                                {emp.totalAllocation || 0}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Pagination - KPMG Styled */}
            <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between bg-card-bg px-4 py-3 rounded-card border border-[#E5E8EB] gap-4 mt-2">
                <div className="flex items-center gap-4">
                    <p className="text-xs text-text-muted">
                        Page <span className="font-bold text-text-primary">{page + 1}</span> of <span className="font-bold text-text-primary">{totalPages || 1}</span>
                        <span className="mx-2">•</span>
                        Showing <span className="font-bold text-text-primary">{totalElements}</span> total records
                    </p>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-text-muted uppercase font-bold tracking-tight">Show</label>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5 text-xs font-bold outline-none focus:border-kpmg-blue"
                        >
                            {[12, 24, 48].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || totalPages === 0}
                    >
                        Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
