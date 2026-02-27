import { useState, useMemo } from 'react';
import { MessageSquare, ThumbsUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, Avatar, EmptyState, Badge, RatingStars } from '../common';
import type { Feedback, FeedbackType } from '../../types';
import { formatDate } from '../../utils';
import { cn } from '../../utils/cn';

interface FeedbackCardProps {
    feedbackList?: Feedback[];
    isLoading?: boolean;
}

export function FeedbackCard({ feedbackList = [], isLoading }: FeedbackCardProps) {
    const [activeTab, setActiveTab] = useState<FeedbackType | 'ALL'>('ALL');

    const filteredFeedback = useMemo(() => {
        if (activeTab === 'ALL') return feedbackList;
        return feedbackList.filter(f => f.type === activeTab);
    }, [feedbackList, activeTab]);

    const tabs = [
        { id: 'ALL', label: 'All Feedback', icon: MessageSquare },
        { id: 'PEER', label: 'Peer', icon: Users },
        { id: 'UPWARD', label: 'Feedback to Senior', icon: ArrowUpRight },
        { id: 'DOWNWARD', label: 'Senior Feedback', icon: ArrowDownRight },
    ] as const;

    const getTypeColor = (type: FeedbackType) => {
        switch (type) {
            case 'PEER': return 'feedback-peer';
            case 'UPWARD': return 'feedback-upward';
            case 'DOWNWARD': return 'feedback-downward';
            default: return 'gray';
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
                <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-24 bg-gray-200 rounded"></div>)}
                </div>
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="p-4 border border-gray-100 rounded-lg">
                            <div className="flex gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                    Continuous Feedback
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {feedbackList.length}
                    </span>
                </CardTitle>
            </CardHeader>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 mb-4 shrink-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const count = tab.id === 'ALL'
                        ? feedbackList.length
                        : feedbackList.filter(f => f.type === tab.id).length;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as FeedbackType | 'ALL')}
                            className={cn(
                                'flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                            )}
                        >
                            <Icon className={cn("w-4 h-4 mr-2", isActive ? "text-primary" : "text-gray-400")} />
                            {tab.label}
                            <span className={cn(
                                "ml-2 text-xs py-0.5 px-1.5 rounded-full",
                                isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filteredFeedback.length === 0 ? (
                <EmptyState
                    icon={<ThumbsUp />}
                    title={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase() + ' '}Feedback`}
                    description="There is no feedback available in this category yet."
                    className="flex-1"
                />
            ) : (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    {filteredFeedback.map((feedback) => (
                        <div key={feedback.id} className="p-4 rounded-lg border border-gray-100 bg-white hover:border-primary-100 hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        name={feedback.fromEmployeeName}
                                        src={undefined} // Backend currently doesn't provide fromEmployee profile pic in FeedbackDTO, would need extension
                                        size="md"
                                    />
                                    <div>
                                        <h4 className="text-sm font-semibold text-text-primary">
                                            {feedback.fromEmployeeName}
                                        </h4>
                                        <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                                            {formatDate(feedback.createdAt)}
                                            {feedback.projectName && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[120px] sm:max-w-xs">{feedback.projectName}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge color={getTypeColor(feedback.type)} variant="soft" className="mb-1">
                                        {feedback.type === 'UPWARD' ? 'Feedback to Senior' : feedback.type === 'DOWNWARD' ? 'Senior Feedback' : 'Peer'}
                                    </Badge>
                                    <RatingStars rating={feedback.rating} size="sm" className="justify-end mt-1" />
                                </div>
                            </div>

                            <div className="bg-gray-50/80 p-3 rounded-md border border-gray-100">
                                <p className="text-sm text-text-primary/90 whitespace-pre-line leading-relaxed">
                                    "{feedback.content}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
