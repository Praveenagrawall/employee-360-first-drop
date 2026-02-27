import React, { useState, useMemo, useEffect } from 'react';
import { Modal, RatingStars, Avatar } from '../common';
import { useEmployees, useSubmitFeedback, useActiveProjects, useEmployee } from '../../hooks';
import type { FeedbackType, FeedbackRequest, EmployeeSlim, ProjectSlim } from '../../types';
import toast from 'react-hot-toast';

interface GiveFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    fromEmployeeId: number;
    targetEmployeeId?: number; // Optional prop when opened from an employee profile
}

export default function GiveFeedbackModal({ isOpen, onClose, fromEmployeeId, targetEmployeeId }: GiveFeedbackModalProps) {
    const [toEmployeeId, setToEmployeeId] = useState(targetEmployeeId?.toString() || '');
    const [type, setType] = useState<FeedbackType>('PEER');
    const [projectId, setProjectId] = useState<string>('');
    const [rating, setRating] = useState(3);
    const [content, setContent] = useState('');

    const { data: employeesData } = useEmployees(0, 500);
    const employees: EmployeeSlim[] = useMemo(() => {
        if (!employeesData?.content) return [];
        return employeesData.content.map(e => ({
            ...e,
            totalAllocation: e.totalAllocation ?? undefined
        })) as EmployeeSlim[];
    }, [employeesData]);

    const { data: projectsData } = useActiveProjects();
    const projects: ProjectSlim[] = useMemo(() => {
        if (!projectsData?.content) return [];
        return projectsData.content.map((p) => ({
            id: p.id,
            projectCode: p.projectCode,
            projectName: p.name
        })) as ProjectSlim[];
    }, [projectsData]);

    const { data: targetEmployeeDetail } = useEmployee(toEmployeeId ? parseInt(toEmployeeId) : undefined);
    const { data: currentUserDetail } = useEmployee(fromEmployeeId);

    const { mutate: submitFeedback, isPending } = useSubmitFeedback();

    const currentUserData = useMemo(() => employees.find(e => e.id === fromEmployeeId), [employees, fromEmployeeId]);

    // Compute shared projects
    const sharedProjectIds = useMemo(() => {
        if (!targetEmployeeDetail || !currentUserDetail) return [];
        const currentProjects = currentUserDetail.currentTeams.map(t => t.projectId);
        const targetProjects = targetEmployeeDetail.currentTeams.map(t => t.projectId);
        return currentProjects.filter(id => targetProjects.includes(id));
    }, [targetEmployeeDetail, currentUserDetail]);

    const availableProjects = useMemo(() => {
        if (!toEmployeeId) return projects;
        return projects.filter(p => sharedProjectIds.includes(p.id));
    }, [projects, sharedProjectIds, toEmployeeId]);

    // Sync state when modal opens or target changes
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (targetEmployeeId) {
                    setToEmployeeId(targetEmployeeId.toString());
                } else {
                    setToEmployeeId('');
                    setProjectId('');
                    setType('PEER');
                    setRating(3);
                    setContent('');
                }
            }, 0);
        }
    }, [isOpen, targetEmployeeId]);

    // Smart-default the type when recipient changes
    useEffect(() => {
        if (toEmployeeId && currentUserData) {
            const target = employees.find(e => e.id === parseInt(toEmployeeId));
            if (target) {
                setTimeout(() => {
                    if (currentUserData.designationLevel > target.designationLevel) {
                        setType('DOWNWARD');
                    } else if (currentUserData.designationLevel < target.designationLevel) {
                        setType('UPWARD');
                    } else {
                        setType('PEER');
                    }
                }, 0);
            }
        }
    }, [toEmployeeId, currentUserData, employees]);

    const handleRecipientChange = (id: string) => {
        setToEmployeeId(id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!toEmployeeId || !content.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (content.trim().length < 20) {
            toast.error('Feedback must be at least 20 characters long');
            return;
        }

        const data: FeedbackRequest = {
            toEmployeeId: parseInt(toEmployeeId),
            type,
            projectId: projectId ? parseInt(projectId) : undefined,
            rating,
            content: content.trim(),
            isAnonymous: false
        };

        submitFeedback({ data, fromEmployeeId }, {
            onSuccess: () => {
                toast.success('Feedback submitted successfully!');
                onClose();
                // Reset form
                setToEmployeeId('');
                setProjectId('');
                setRating(3);
                setContent('');
            },
            onError: (err: Error) => {
                toast.error(err.message || 'Failed to submit feedback');
            }
        });
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Give Feedback" size="xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {targetEmployeeId ? (
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 mb-1">
                            Recipient
                        </label>
                        <div className="flex items-center gap-3 w-full border border-gray-200 rounded p-3 bg-gray-50">
                            {targetEmployeeDetail ? (
                                <>
                                    <Avatar name={targetEmployeeDetail.fullName} size="sm" className="w-8 h-8 rounded-full" />
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-gray-900 leading-tight">{targetEmployeeDetail.fullName}</span>
                                        <span className="text-[13px] text-gray-500 leading-tight">{targetEmployeeDetail.designationName}</span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-sm text-text-secondary">Loading...</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 mb-1">
                            Recipient <span className="text-error">*</span>
                        </label>
                        <select
                            value={toEmployeeId}
                            onChange={(e) => handleRecipientChange(e.target.value)}
                            required
                            title="Select Recipient"
                            className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                        >
                            <option value="">Select a colleague...</option>
                            {employees.filter(e => e.id !== fromEmployeeId).map(e => (
                                <option key={e.id} value={e.id}>{e.fullName} ({e.designationName})</option>
                            ))}
                        </select>
                    </div>
                )}

                {availableProjects.length > 0 && (
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 mb-1">
                            Related Project (Optional)
                        </label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            title="Select Project"
                            className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                        >
                            <option value="">— No specific project —</option>
                            {availableProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 mb-1">
                            Type
                        </label>
                        <div className="flex border border-gray-300 rounded-md overflow-hidden">
                            {[
                                { value: 'PEER', label: 'Peer' },
                                { value: 'UPWARD', label: 'Feedback to Senior' },
                                { value: 'DOWNWARD', label: 'Senior Feedback' }
                            ].map(option => {
                                const isActive = type === option.value;
                                const isDisabled = !!targetEmployeeId;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => setType(option.value as FeedbackType)}
                                        className={`flex-1 py-2 px-3 text-sm font-medium text-center border-r border-gray-300 last:border-r-0 transition-colors ${isActive ? 'bg-[#00338D] text-white' : 'bg-white text-gray-600'
                                            } ${!isDisabled && !isActive ? 'hover:bg-gray-50 cursor-pointer' : ''
                                            } ${isDisabled && !isActive ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''
                                            } ${isDisabled && isActive ? 'cursor-default' : ''
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 mb-1">
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            <RatingStars rating={rating} isInteractive onChange={setRating} size="xl" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-gray-500 mb-1">
                        Your Feedback <span className="text-error">*</span>
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        maxLength={500}
                        placeholder="Share your feedback about this person's work, skills, or collaboration..."
                        className="w-full border border-gray-300 rounded p-3 text-sm min-h-[120px] resize-y focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="text-xs text-gray-400 mt-1 flex justify-end">
                        {content.length} / 500 characters
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={rating === 0 || isPending}
                        className="bg-[#00338D] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#004BB4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Submit Feedback
                    </button>
                </div>
            </form>
        </Modal>
    );
}
