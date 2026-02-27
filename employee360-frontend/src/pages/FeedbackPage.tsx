import { useState, useMemo } from 'react';
import { MessageSquare, Send, Inbox, Users, Trash2, Plus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useEmployeeFeedback,
    useGivenFeedback,
    useTeamFeedback,
    useDeleteFeedback
} from '../hooks/useFeedback';
import { useUserContext } from '../context/UserContextProvider';
import {
    Avatar,
    Badge,
    Card,
    EmptyState,
    FullPageLoader,
    RatingStars,
} from '../components/common';
import GiveFeedbackModal from '../components/feedback/GiveFeedbackModal';
import { cn, formatDate } from '../utils';

type FeedbackTab = 'RECEIVED' | 'GIVEN' | 'TEAM';

const FEEDBACK_TYPE_COLORS: Record<string, any> = {
    PEER: 'feedback-peer',
    UPWARD: 'feedback-upward',
    DOWNWARD: 'feedback-downward',
    SELF: 'warning',
};

export default function FeedbackPage() {
    const { currentUser, isManager, isLeadership } = useUserContext();
    const [activeTab, setActiveTab] = useState<FeedbackTab>('RECEIVED');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data Hooks
    const userId = currentUser?.employeeId;
    const { data: received = [], isLoading: loadingReceived } = useEmployeeFeedback(userId);
    const { data: given = [], isLoading: loadingGiven } = useGivenFeedback(userId);
    const { data: teamFeedback = [], isLoading: loadingTeam } = useTeamFeedback(userId);

    const { mutate: deleteFeedback } = useDeleteFeedback();

    const isLoading = loadingReceived || loadingGiven || loadingTeam;

    const handleDelete = (id: number) => {
        if (!userId) return;
        if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
            deleteFeedback({ id, employeeId: userId }, {
                onSuccess: () => toast.success('Feedback deleted successfully'),
                onError: (err: any) => toast.error(err.message || 'Failed to delete feedback')
            });
        }
    };

    const isDeletable = (createdAt: string) => {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffInMs = now.getTime() - createdDate.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const currentFeedbackList = useMemo(() => {
        switch (activeTab) {
            case 'RECEIVED': return received;
            case 'GIVEN': return given;
            case 'TEAM': return teamFeedback;
            default: return [];
        }
    }, [activeTab, received, given, teamFeedback]);

    return (
        <div className="space-y-6 flex flex-col h-full relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-kpmg-blue" />
                        Feedback Center
                    </h1>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        Track your impact and see what colleagues are saying about your work.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[#F1F3F5] shrink-0">
                <button
                    onClick={() => setActiveTab('RECEIVED')}
                    className={cn(
                        "flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all border-b-2",
                        activeTab === 'RECEIVED'
                            ? "text-kpmg-blue border-kpmg-blue"
                            : "text-text-muted border-transparent hover:text-text-primary"
                    )}
                >
                    <Inbox className="w-4 h-4" />
                    Received
                    {received.length > 0 && <span className="text-[10px] bg-sidebar-active text-kpmg-blue px-1.5 rounded-sm font-bold ml-1 border border-[#D0E1F9]">{received.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('GIVEN')}
                    className={cn(
                        "flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all border-b-2",
                        activeTab === 'GIVEN'
                            ? "text-kpmg-blue border-kpmg-blue"
                            : "text-text-muted border-transparent hover:text-text-primary"
                    )}
                >
                    <Send className="w-4 h-4" />
                    Given
                </button>
                {(isManager() || isLeadership()) && (
                    <button
                        onClick={() => setActiveTab('TEAM')}
                        className={cn(
                            "flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all border-b-2",
                            activeTab === 'TEAM'
                                ? "text-kpmg-blue border-kpmg-blue"
                                : "text-text-muted border-transparent hover:text-text-primary"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Team
                    </button>
                )}
            </div>

            {/* Feedback Content */}
            <div className="flex-1 overflow-auto pb-20">
                {isLoading ? (
                    <FullPageLoader />
                ) : currentFeedbackList.length === 0 ? (
                    <Card className="p-12">
                        <EmptyState
                            title={activeTab === 'RECEIVED' ? "No feedback received yet" : activeTab === 'GIVEN' ? "You haven't given any feedback" : "No team feedback found"}
                            description={activeTab === 'GIVEN' ? "Share constructive feedback with your colleagues to help them grow." : "Encourage your team to share feedback regularly."}
                            actionLabel={activeTab === 'GIVEN' ? "Give Initial Feedback" : undefined}
                            onAction={activeTab === 'GIVEN' ? () => setIsModalOpen(true) : undefined}
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {currentFeedbackList.map((fb: any) => (
                            <Card key={fb.id} className="p-5 flex flex-col h-full hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#F1F3F5] flex items-center justify-center border border-[#E5E8EB] shadow-sm">
                                            <Avatar
                                                name={activeTab === 'RECEIVED' ? (fb.isAnonymous ? '?' : fb.fromEmployeeName) : fb.toEmployeeName}
                                                size="sm"
                                                className={fb.isAnonymous && activeTab === 'RECEIVED' ? 'bg-gray-400' : ''}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-text-primary">
                                                {activeTab === 'RECEIVED'
                                                    ? (fb.isAnonymous ? 'Anonymous' : fb.fromEmployeeName)
                                                    : fb.toEmployeeName}
                                            </p>
                                            <p className="text-[10px] text-text-secondary flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(fb.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge
                                            color={FEEDBACK_TYPE_COLORS[fb.type] || 'gray'}
                                            variant="soft"
                                            className="text-[10px] uppercase font-bold"
                                        >
                                            {fb.type === 'UPWARD' ? 'Feedback to Senior' : fb.type === 'DOWNWARD' ? 'Senior Feedback' : fb.type}
                                        </Badge>
                                        {fb.projectName && (
                                            <span className="text-[10px] text-text-secondary font-medium">
                                                {fb.projectName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <p className="text-xs text-text-primary leading-relaxed italic border-l-2 border-kpmg-blue-light/30 pl-3 py-0.5 font-medium">
                                        "{fb.content}"
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <RatingStars rating={fb.rating} size="sm" />
                                        <span className="text-xs font-bold text-text-primary">
                                            {fb.rating}.0
                                        </span>
                                    </div>
                                    {activeTab === 'GIVEN' && isDeletable(fb.createdAt.toString()) && (
                                        <button
                                            onClick={() => handleDelete(fb.id)}
                                            className="text-text-secondary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-50"
                                            title="Delete (available for 24h)"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-12 h-12 bg-kpmg-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-kpmg-blue-dark transition-all hover:scale-105 z-20 group"
            >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span className="absolute right-16 bg-white text-kpmg-blue px-2.5 py-1.5 rounded shadow-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#E5E8EB] uppercase tracking-wider">
                    Give Feedback
                </span>
            </button>

            {/* Modal */}
            {userId && (
                <GiveFeedbackModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fromEmployeeId={userId}
                />
            )}
        </div>
    );
}
