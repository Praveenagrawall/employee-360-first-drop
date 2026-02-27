import { useState } from 'react';
import { Briefcase, ClipboardList, CheckCircle } from 'lucide-react';
import PendingApprovalsPanel from '../components/allocation/PendingApprovalsPanel';
import MyRequestsPanel from '../components/allocation/MyRequestsPanel';
import { useUserContext } from '../context/UserContextProvider';

export default function AllocationRequestsPage() {
    const { hasAtLeastLevel, hasPermission } = useUserContext();
    const [activeTab, setActiveTab] = useState<'pending' | 'my-requests' | 'all'>('pending');

    const canSeeAll = hasAtLeastLevel(6) || hasPermission('ADMIN_PANEL');

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-7 h-7 text-[#00338D]" />
                        Allocation Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage project team member requests and approvals</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending'
                                ? 'border-[#00338D] text-[#00338D]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Pending Approvals
                    </button>
                    <button
                        onClick={() => setActiveTab('my-requests')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my-requests'
                                ? 'border-[#00338D] text-[#00338D]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        My Requests
                    </button>
                    {canSeeAll && (
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'all'
                                    ? 'border-[#00338D] text-[#00338D]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            All Requests (Org-Wide)
                        </button>
                    )}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'pending' && <PendingApprovalsPanel />}
                {activeTab === 'my-requests' && <MyRequestsPanel />}
                {activeTab === 'all' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Organization Requests</h3>
                        <p className="text-gray-500 mt-2">This view would contain a full data table with global filtering and pagination.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
