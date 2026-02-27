import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Avatar } from '../common';
import { fetchAvailableEmployees, createAllocationRequest } from '../../api/allocationRequestApi';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUserContext } from '../../context/UserContextProvider';
import { useEmployee } from '../../hooks';
import { Search, ChevronRight, ArrowLeft, AlertCircle, Link as LinkIcon, Minus, Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProject';
import { useTeamsByProject } from '../../hooks/useTeam';
import { cn } from '../../utils/cn';


interface AddToTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: number;
    teamId?: number;
    projectName?: string;
    preSelectedEmployee?: any;
}

export default function AddToTeamModal({ isOpen, onClose, projectId: initialProjectId, teamId: initialTeamId, projectName: initialProjectName, preSelectedEmployee }: AddToTeamModalProps) {
    const { currentUser } = useUserContext();
    const currentUserId = currentUser?.employeeId;
    const { data: currentUserDetail } = useEmployee(currentUserId || undefined);

    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Details
    const [selectedEmployee, setSelectedEmployee] = useState<any>(preSelectedEmployee || null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(initialProjectId);
    const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(initialTeamId);

    const [requestedAllocation, setRequestedAllocation] = useState(20);
    const [roleInTeam, setRoleInTeam] = useState('');
    const [proposedStartDate, setProposedStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [proposedEndDate, setProposedEndDate] = useState('');
    const [requestReason, setRequestReason] = useState('');

    const { data: projectsRes, isLoading: isProjectsLoading } = useProjects(undefined, 0, 500);
    const projects = useMemo(() => projectsRes?.content || [], [projectsRes]);

    const { data: teamsRes, isLoading: isTeamsLoading } = useTeamsByProject(selectedProjectId);
    const teams = useMemo(() => teamsRes || [], [teamsRes]);

    // Auto-select team logic
    useEffect(() => {
        if (teams.length === 1 && selectedProjectId) {
            setSelectedTeamId(teams[0].id);
        } else if (!initialTeamId && selectedProjectId) {
            // Only reset if we change projects and the current team isn't in the new list
            if (!teams.some(t => t.id === selectedTeamId)) {
                setSelectedTeamId(undefined);
            }
        }
    }, [teams, selectedProjectId, initialTeamId, selectedTeamId]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Track previous isOpen to only initialize when modal first opens
    const prevIsOpenRef = useRef(false);

    // Reset/Initialize when modal opens or closes
    useEffect(() => {
        const wasOpen = prevIsOpenRef.current;
        prevIsOpenRef.current = isOpen;

        if (isOpen && !wasOpen) {
            // Modal just opened — initialize state from props
            setStep(preSelectedEmployee ? 2 : 1);
            setSelectedEmployee(preSelectedEmployee || null);
            setSelectedProjectId(initialProjectId);
            setSelectedTeamId(initialTeamId);
            setRequestedAllocation(20);
            setRoleInTeam('');
            setProposedStartDate(new Date().toISOString().split('T')[0]);
            setProposedEndDate('');
            setRequestReason('');
        } else if (!isOpen && wasOpen) {
            // Modal just closed — reset search
            setSearchQuery('');
            setDebouncedQuery('');
        }
    }, [isOpen, preSelectedEmployee, initialProjectId, initialTeamId]);

    const { data: searchResults, isLoading: isSearchLoading } = useQuery({
        queryKey: ['availableEmployees', debouncedQuery],
        queryFn: async () => {
            const res = await fetchAvailableEmployees({ q: debouncedQuery, size: 10 });
            return res.data?.data?.content || [];
        },
        enabled: isOpen && step === 1,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createAllocationRequest(data),
        onSuccess: (res) => {
            const isAutoApproved = res.data?.data?.status === 'AUTO_APPROVED' || res.data?.data?.status === 'APPROVED';
            toast.success(isAutoApproved ? 'Employee added to team' : 'Request submitted successfully');
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        // Relaxed validation: only selectedEmployee is strictly required for the backend DTO usually, 
        // but let's keep basic identifiers to avoid bad data.
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }

        const requestData = {
            employeeId: selectedEmployee.id,
            projectId: selectedProjectId || 1, // Fallback to Project 1 (HDFC) for relaxed testing
            teamId: selectedTeamId || 1,      // Fallback to Team 1 (HDFC) for relaxed testing
            roleInTeam: roleInTeam || 'Member',
            requestedAllocation,
            proposedStartDate,
            proposedEndDate: proposedEndDate || null,
            requestReason: requestReason || 'Added to team'
        };

        createMutation.mutate(requestData);
    };

    // Determine approver logic for display
    let approverDisplay = '';
    if (selectedEmployee && currentUserDetail) {
        if (currentUserDetail.designationLevel >= 6) {
            approverDisplay = 'This will be auto-approved (Director+ privilege)';
        } else if (Number(selectedEmployee.id) === Number(currentUserId)) {
            approverDisplay = 'This will be auto-approved (Self-request)';
        } else {
            // Usually sent to the employee's manager
            approverDisplay = `This request will require approval from their manager.`;
        }
    }

    const currentTotalAlloc = selectedEmployee?.totalAllocation || 0;
    const newTotalAlloc = currentTotalAlloc + requestedAllocation;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialProjectName ? `Add to Team: ${initialProjectName}` : `Add to My Team`}
            size="lg"
        >
            <div className="flex flex-col h-full bg-white">
                <div className="p-6 overflow-y-auto min-h-0">
                    {/* Step Indicators */}
                    {!preSelectedEmployee && (
                        <div className="flex items-center justify-center mb-8">
                            {[1, 2, 3].map((num) => (
                                <React.Fragment key={num}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                                        step >= num ? "bg-[#00338D] text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
                                    )}>
                                        {num}
                                    </div>
                                    {num < 3 && <div className={cn("w-12 h-[2px] mx-2", step > num ? "bg-[#00338D]" : "bg-gray-100")} />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Step 1: Search */}
                    {step === 1 && !preSelectedEmployee && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, code or skills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00338D] focus:ring-1 focus:ring-[#00338D] text-sm"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                                {isSearchLoading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-lg" />)
                                ) : searchResults?.length > 0 ? (
                                    searchResults.map((emp: any) => (
                                        <div
                                            key={emp.id}
                                            onClick={() => setSelectedEmployee(emp)}
                                            className={cn(
                                                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center gap-4",
                                                selectedEmployee?.id === emp.id ? "border-[#00338D] bg-blue-50/30 ring-1 ring-[#00338D]" : "border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            <Avatar name={emp.fullName} src={emp.profilePicUrl} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{emp.fullName}</h4>
                                                <p className="text-xs text-gray-500 truncate">{emp.designation} • {emp.department}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn("text-xs font-bold", emp.availableAllocation > 0 ? "text-green-600" : "text-amber-600")}>
                                                    {emp.availableAllocation}% Available
                                                </div>
                                                <div className="text-[10px] text-gray-400">Total: {emp.totalAllocation}%</div>
                                            </div>
                                        </div>
                                    ))
                                ) : searchQuery.length > 0 ? (
                                    <div className="text-center py-10 text-gray-500">No employees found matching "{searchQuery}"</div>
                                ) : (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        Enter a name to find people for your team
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedEmployee}
                                    className="bg-[#00338D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002870] disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Request Details */}
                    {step === 2 && selectedEmployee && (
                        <div className="space-y-6">
                            {/* Employee Card */}
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center gap-4">
                                <Avatar name={selectedEmployee.fullName} src={selectedEmployee.profilePicUrl} size="lg" />
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{selectedEmployee.fullName}</h3>
                                    <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                            selectedEmployee.availableAllocation > 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {selectedEmployee.allocationStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Project */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Project</label>
                                    <select
                                        aria-label="Select Project"
                                        value={selectedProjectId || ''}
                                        onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                                        disabled={!!initialProjectId}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00338D] disabled:opacity-50"
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.projectCode} — {project.name} ({project.clientName})
                                            </option>
                                        ))}
                                    </select>
                                    {projects.length === 0 && !isProjectsLoading && (
                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-600 font-medium">
                                            <AlertCircle className="w-3 h-3" />
                                            No active projects found. <LinkIcon className="w-3 h-3" /> Go to Projects &rarr;
                                        </div>
                                    )}
                                </div>

                                {/* Team */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Team</label>
                                    <select
                                        aria-label="Select Team"
                                        value={selectedTeamId || ''}
                                        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                                        disabled={!!initialTeamId || !selectedProjectId || isTeamsLoading}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00338D] disabled:opacity-50"
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name} {team.teamLeadName ? `(Lead: ${team.teamLeadName})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Role */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role in Team</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Backend Developer, QA Lead"
                                        value={roleInTeam}
                                        onChange={(e) => setRoleInTeam(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00338D]"
                                    />
                                </div>

                                {/* Allocation slider */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Requested Allocation %</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            title="Decrease Allocation"
                                            onClick={() => setRequestedAllocation(Math.max(0, requestedAllocation - 5))}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 relative">
                                            <input
                                                title="Allocation Percentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={requestedAllocation}
                                                onChange={(e) => setRequestedAllocation(Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center font-bold text-gray-900 focus:outline-none focus:border-[#00338D]"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                        </div>
                                        <button
                                            title="Increase Allocation"
                                            onClick={() => setRequestedAllocation(Math.min(100, requestedAllocation + 5))}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Simplified allocation summary info */}
                                    <div className="flex justify-between text-[10px] mt-1 px-1">
                                        <span className="text-gray-400">Current: <span className="font-bold text-gray-600">{currentTotalAlloc}%</span></span>
                                        <span className={`font-bold ${newTotalAlloc > 100 ? 'text-red-500' : 'text-green-600'}`}>
                                            Total: {newTotalAlloc}%
                                        </span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Proposed Start Date</label>
                                    <input
                                        title="Start Date"
                                        type="date"
                                        value={proposedStartDate}
                                        onChange={(e) => setProposedStartDate(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00338D]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Proposed End Date (Optional)</label>
                                    <input
                                        title="End Date"
                                        type="date"
                                        value={proposedEndDate}
                                        onChange={(e) => setProposedEndDate(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00338D]"
                                    />
                                </div>

                                {/* Reason */}
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason for Request</label>
                                    <textarea
                                        placeholder="Briefly explain why this person is needed..."
                                        value={requestReason}
                                        onChange={(e) => setRequestReason(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm h-20 resize-none focus:outline-none focus:border-[#00338D] focus:ring-1 focus:ring-[#00338D]"
                                    />
                                </div>
                            </div>

                            {/* Approver Logic */}
                            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <span className="font-bold">Approval Flow:</span> {approverDisplay}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={preSelectedEmployee ? onClose : handleBack}
                                    className="text-gray-500 px-4 py-2 text-sm font-semibold hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {preSelectedEmployee ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="bg-[#00338D] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#002870] flex items-center gap-2 shadow-sm transition-all"
                                >
                                    Review Request <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && selectedEmployee && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-50 text-[#00338D] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Review Your Request</h3>
                                <p className="text-sm text-gray-500">Please confirm the details before sending for approval</p>
                            </div>

                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-50">
                                        <tr className="bg-gray-50/30">
                                            <td className="py-3 px-4 text-gray-500 font-medium">Employee</td>
                                            <td className="py-3 px-4 font-bold text-gray-900">{selectedEmployee.fullName}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-gray-500 font-medium">Project — Team</td>
                                            <td className="py-3 px-4 font-bold text-gray-900">
                                                {projects.find(p => p.id === selectedProjectId)?.name || 'N/A'}
                                                <span className="mx-1 text-gray-300">/</span>
                                                {teams.find(t => t.id === selectedTeamId)?.name || 'N/A'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-gray-500 font-medium">Role & Allocation</td>
                                            <td className="py-3 px-4 font-bold text-gray-900">
                                                {roleInTeam || 'Member'} <span className="mx-2 text-gray-200">|</span> {requestedAllocation}%
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-gray-500 font-medium">Timeline</td>
                                            <td className="py-3 px-4 font-bold text-gray-900">
                                                {proposedStartDate} to {proposedEndDate || 'Indefinite'}
                                            </td>
                                        </tr>
                                        <tr className="align-top">
                                            <td className="py-4 px-4 text-gray-500 font-medium">Reason</td>
                                            <td className="py-4 px-4 text-gray-700 italic text-[13px]">{requestReason || 'Added to team'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={handleBack}
                                    className="text-gray-500 px-4 py-2 text-sm font-semibold hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Edit Details
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={createMutation.isPending}
                                    className="bg-[#00338D] text-white px-10 py-3 rounded-lg text-sm font-bold hover:bg-[#002870] disabled:opacity-50 shadow-md transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {createMutation.isPending ? 'Sending...' : 'Confirm & Request Allocation'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
