import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingRequests, approveRequest, rejectRequest } from '../../api/allocationRequestApi';
import { Modal } from '../common';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingApprovalsPanel() {
    const queryClient = useQueryClient();
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; request: any } | null>(null);
    const [actionText, setActionText] = useState('');

    const { data: requests, isLoading } = useQuery({
        queryKey: ['pendingApprovals'],
        queryFn: async () => {
            const res = await fetchPendingRequests();
            return res.data?.data || [];
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, comments }: { id: number; comments: string }) => approveRequest(id, { comments }),
        onSuccess: () => {
            toast.success('Request approved successfully');
            queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setActionModal(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to approve request');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectRequest(id, { reason }),
        onSuccess: () => {
            toast.success('Request rejected successfully');
            queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setActionModal(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to reject request');
        }
    });

    const toggleExpand = (id: number) => {
        const newIds = new Set(expandedIds);
        if (newIds.has(id)) newIds.delete(id);
        else newIds.add(id);
        setExpandedIds(newIds);
    };

    const handleActionSubmit = () => {
        if (!actionModal) return;

        if (actionModal.type === 'reject' && !actionText.trim()) {
            toast.error('Rejection reason is required');
            return;
        }

        if (actionModal.type === 'approve') {
            approveMutation.mutate({ id: actionModal.request.id, comments: actionText });
        } else {
            rejectMutation.mutate({ id: actionModal.request.id, reason: actionText });
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500 text-sm">Loading pending approvals...</div>;
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-gray-900 font-medium">No pending allocation requests</h3>
                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    Pending Approvals
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                </h3>
            </div>

            <div className="divide-y divide-gray-100">
                {requests.map((req: any) => {
                    const isExpanded = expandedIds.has(req.id);
                    const isOverAllocated = (req.currentTotalAllocation + req.requestedAllocation) > 100;

                    return (
                        <div key={req.id} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        <span className="text-xs font-medium text-gray-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-[15px] font-medium text-gray-900 mb-1 leading-tight">
                                        <span className="font-bold">{req.requesterName}</span> requested <span className="font-bold text-[#00338D]">{req.employeeName}</span> for <span className="font-bold">{req.projectName}</span>
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                                        <div><span className="text-gray-400">Role:</span> <span className="font-medium text-gray-900">{req.roleInTeam}</span></div>
                                        <div><span className="text-gray-400">Duration:</span> <span className="font-medium text-gray-900">{new Date(req.proposedStartDate).toLocaleDateString()} - {req.proposedEndDate ? new Date(req.proposedEndDate).toLocaleDateString() : 'Ongoing'}</span></div>
                                    </div>

                                    {/* Allocation Bar */}
                                    <div className="mt-4 bg-white p-3 border border-gray-200 rounded-md">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-medium text-gray-700">Allocation Impact</span>
                                            <span className="text-gray-500">
                                                Current: <span className="font-semibold">{req.currentTotalAllocation}%</span> + Request: <span className="font-semibold text-[#00338D]">{req.requestedAllocation}%</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-gray-400" style={{ width: `${Math.min(req.currentTotalAllocation, 100)}%` }} title={`Current: ${req.currentTotalAllocation}%`} />
                                            <div className={`h-full ${isOverAllocated ? 'bg-red-500' : 'bg-[#00338D]'} opacity-80`} style={{ width: `${Math.min(req.requestedAllocation, Math.max(0, 100 - req.currentTotalAllocation))}%` }} title={`Requested: ${req.requestedAllocation}%`} />
                                        </div>
                                        {isOverAllocated && (
                                            <p className="text-[11px] text-red-600 font-medium mt-1">⚠ This request will over-allocate {req.employeeName} to {req.currentTotalAllocation + req.requestedAllocation}%</p>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        <button
                                            onClick={() => toggleExpand(req.id)}
                                            className="text-[13px] text-[#00338D] font-medium hover:underline flex items-center gap-1"
                                        >
                                            {isExpanded ? 'Hide Reason' : 'View Reason'}
                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                        {isExpanded && (
                                            <div className="mt-2 p-3 bg-blue-50/50 rounded border border-blue-100/50 text-sm text-gray-700 italic border-l-2 border-l-[#00338D]">
                                                "{req.requestReason}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    <button
                                        onClick={() => { setActionModal({ type: 'approve', request: req }); setActionText(''); }}
                                        className="w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 font-medium py-1.5 px-3 rounded text-sm transition-colors shadow-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => { setActionModal({ type: 'reject', request: req }); setActionText(''); }}
                                        className="w-full bg-white border border-red-600 text-red-700 hover:bg-red-50 font-medium py-1.5 px-3 rounded text-sm transition-colors shadow-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Modal */}
            <Modal
                isOpen={!!actionModal}
                onClose={() => setActionModal(null)}
                title={actionModal?.type === 'approve' ? 'Approve Allocation Request' : 'Reject Allocation Request'}
            >
                {actionModal && (
                    <div className="p-5">
                        <p className="text-sm text-gray-600 mb-4">
                            {actionModal.type === 'approve'
                                ? `You are about to approve ${actionModal.request.requesterName}'s request for ${actionModal.request.employeeName}.`
                                : `You are about to reject ${actionModal.request.requesterName}'s request for ${actionModal.request.employeeName}.`}
                        </p>

                        <div className="mb-4">
                            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                                {actionModal.type === 'approve' ? 'Comments (Optional)' : 'Rejection Reason'}
                                {actionModal.type === 'reject' && <span className="text-red-500 text-[10px] normal-case bg-red-50 px-1.5 rounded">Required</span>}
                            </label>
                            <textarea
                                value={actionText}
                                onChange={(e) => setActionText(e.target.value)}
                                placeholder={actionModal.type === 'approve' ? 'Add any notes for the requester...' : 'Why are you rejecting this request?'}
                                className={`w-full p-3 border rounded text-sm min-h-[100px] outline-none transition-colors ${actionModal.type === 'reject' ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500 border-gray-300' : 'focus:border-green-500 focus:ring-1 focus:ring-green-500 border-gray-300'
                                    }`}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setActionModal(null)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActionSubmit}
                                disabled={(actionModal.type === 'reject' && !actionText.trim()) || approveMutation.isPending || rejectMutation.isPending}
                                className={`px-5 py-2 rounded text-white text-sm font-medium transition-colors shadow-sm flex items-center justify-center min-w-[100px] ${actionModal.type === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                                    }`}
                            >
                                {(approveMutation.isPending || rejectMutation.isPending) ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    actionModal.type === 'approve' ? 'Approve' : 'Reject'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
