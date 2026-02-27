
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyRequests, withdrawRequest } from '../../api/allocationRequestApi';
import { Clock, Send, CheckCircle2, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRequestsPanel() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ['myRequests'],
        queryFn: async () => {
            const res = await fetchMyRequests();
            return res.data?.data || [];
        }
    });

    const withdrawMutation = useMutation({
        mutationFn: (id: number) => withdrawRequest(id),
        onSuccess: () => {
            toast.success('Request withdrawn successfully');
            queryClient.invalidateQueries({ queryKey: ['myRequests'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to withdraw request');
        }
    });

    const getStatusBadge = (status: string, approverName: string, reason: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval — awaiting {approverName}
                    </div>
                );
            case 'APPROVED':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-800 border border-green-200 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                    </div>
                );
            case 'AUTO_APPROVED':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-[#00338D] border border-blue-200 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Auto-Approved
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="inline-flex items-start gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-800 border border-red-200 text-xs font-medium max-w-sm">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                            <span className="block font-bold">Rejected</span>
                            <span className="font-normal opacity-90">{reason || 'No reason provided'}</span>
                        </div>
                    </div>
                );
            case 'WITHDRAWN':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">
                        <X className="w-3.5 h-3.5" />
                        Withdrawn
                    </div>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">{status}</span>
                );
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500 text-sm border border-gray-200 rounded-lg">Loading your requests...</div>;
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                    <Send className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">No Allocation Requests</h3>
                <p className="text-sm text-gray-500 mt-1">You haven't made any requests to add members to your teams yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    My Allocation Requests
                </h3>
            </div>

            <div className="divide-y divide-gray-100">
                {requests.map((req: any) => (
                    <div key={req.id} className="p-5 flex flex-col md:flex-row md:justify-between md:items-start gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex-1">
                            <h4 className="text-[15px] font-medium text-gray-900 mb-1 leading-tight">
                                Requested <span className="font-bold text-[#00338D]">{req.employeeName}</span> for <span className="font-bold">{req.projectName}</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                                <div><span className="text-gray-400">Role:</span> <span className="text-gray-700 font-medium">{req.roleInTeam}</span></div>
                                <div><span className="text-gray-400">Allocation:</span> <span className="text-gray-700 font-medium">{req.requestedAllocation}%</span></div>
                                <div><span className="text-gray-400">Date:</span> <span className="text-gray-700 font-medium">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                            </div>

                            <div className="mt-3">
                                {getStatusBadge(req.status, req.approverName, req.rejectionReason)}
                            </div>
                        </div>

                        {req.status === 'PENDING' && (
                            <div className="shrink-0">
                                <button
                                    onClick={() => withdrawMutation.mutate(req.id)}
                                    disabled={withdrawMutation.isPending}
                                    className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 bg-white border border-gray-200 px-3 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                                >
                                    {withdrawMutation.isPending && req.id === withdrawMutation.variables ? (
                                        <div className="w-3 h-3 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                    ) : (
                                        <X className="w-3.5 h-3.5" />
                                    )}
                                    Withdraw Request
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
