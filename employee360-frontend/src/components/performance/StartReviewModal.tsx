import React, { useState, useEffect } from 'react';
import { Save, Send } from 'lucide-react';
import { Button, Modal, RatingStars } from '../common';
import type { PerformanceReview, ReviewRequest, ReviewUpdateRequest } from '../../types';

interface StartReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId?: number;
    employeeName?: string;
    existingReview?: PerformanceReview;
    onSubmit: (data: ReviewRequest) => void;
    onUpdate?: (id: number, data: ReviewUpdateRequest) => void;
    isSubmitting?: boolean;
}

export default function StartReviewModal({
    isOpen,
    onClose,
    employeeId,
    employeeName,
    existingReview,
    onSubmit,
    onUpdate,
    isSubmitting
}: StartReviewModalProps) {
    const [rating, setRating] = useState(3);
    const [cycle, setCycle] = useState('2024-Q4');
    const [goals, setGoals] = useState('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setCycle(existingReview.reviewCycle);
            setGoals(existingReview.goals || '');
            setComments(existingReview.comments || '');
        } else {
            setRating(3);
            setCycle('2024-Q4');
            setGoals('');
            setComments('');
        }
    }, [existingReview, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (existingReview && onUpdate) {
            onUpdate(existingReview.id, { rating, goals, comments });
        } else if (employeeId) {
            onSubmit({
                employeeId,
                reviewCycle: cycle,
                rating,
                goals,
                comments
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingReview ? 'Edit Review' : 'Start Review'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                        Employee
                    </label>
                    <p className="text-sm text-text-secondary bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        {employeeName || existingReview?.employeeName} (ID: {employeeId || existingReview?.employeeId})
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Rating
                        </label>
                        <div className="flex items-center gap-3">
                            <RatingStars rating={rating} isInteractive onChange={setRating} size="lg" />
                            <span className="text-sm font-medium text-text-secondary">{rating}/5</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1">
                            Review Cycle
                        </label>
                        <select
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value)}
                            disabled={!!existingReview}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white disabled:bg-gray-50 disabled:text-text-secondary"
                        >
                            <option value="2024-Q4">2024-Q4 (Current)</option>
                            <option value="2024-Q3">2024-Q3</option>
                            <option value="2024-Q2">2024-Q2</option>
                            <option value="2024-Q1">2024-Q1</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                        Key Goals & Achievements
                    </label>
                    <textarea
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        rows={3}
                        placeholder="What were the main objectives for this period?"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                        Performance Comments
                    </label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        placeholder="Provide detailed feedback on strengths and areas for improvement..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white resize-none"
                    />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        leftIcon={existingReview ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    >
                        {existingReview ? 'Update Review' : 'Create Review'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
