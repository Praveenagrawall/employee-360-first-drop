import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, RatingStars, EmptyState, ReviewStatusBadge } from '../common';
import type { PerformanceReview, PerformanceSummary } from '../../types';
import { formatDate } from '../../utils';

interface PerformanceHistoryCardProps {
    summary: PerformanceSummary | undefined;
    reviews: PerformanceReview[];
    isLoading?: boolean;
}

export function PerformanceHistoryCard({ summary, reviews, isLoading }: PerformanceHistoryCardProps) {

    // Format data for Recharts
    const chartData = useMemo(() => {
        if (!reviews || reviews.length === 0) return [];

        return reviews
            .filter(r => r.status === 'COMPLETED' || r.status === 'ACKNOWLEDGED') // Only show finalized ratings
            .sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime())
            .map(review => ({
                cycle: review.reviewCycle,
                rating: review.rating,
                date: formatDate(review.reviewDate),
            }));
    }, [reviews]);

    if (isLoading) {
        return (
            <Card className="h-full animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-8"></div>
                <div className="flex gap-6 mb-8">
                    <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="h-48 bg-gray-100 rounded"></div>
            </Card>
        );
    }

    const hasData = reviews && reviews.length > 0;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                    Performance History
                </CardTitle>
            </CardHeader>

            {!hasData ? (
                <EmptyState
                    icon={<BarChart3 />}
                    title="No Performance Data"
                    description="Performance reviews for this employee will appear here once completed."
                    className="py-10"
                />
            ) : (
                <div className="space-y-6">
                    {/* Summary / Latest Rating */}
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-text-primary">
                                {summary?.latestRating?.toFixed(1) || '—'}
                            </div>
                            <div className="mt-1">
                                <RatingStars rating={summary?.latestRating || 0} size="sm" />
                            </div>
                            <div className="text-xs text-text-secondary mt-1 font-medium">Latest Rating</div>
                        </div>

                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs text-text-secondary uppercase tracking-wider mb-1">Average</span>
                                    <span className="text-lg font-semibold text-text-primary">
                                        {summary?.averageRating?.toFixed(1) || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text-secondary uppercase tracking-wider mb-1">Total Reviews</span>
                                    <span className="text-lg font-semibold text-text-primary">
                                        {summary?.totalReviews || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trend Chart */}
                    {chartData.length > 1 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-text-primary mb-4">Rating Trend</h4>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="cycle"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            ticks={[1, 2, 3, 4, 5]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ fontWeight: 'bold', color: '#1A1A2E', marginBottom: '4px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="rating"
                                            stroke="#00338D" // KPMG Blue
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#00338D', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, fill: '#0091DA' }} // KPMG Light Blue
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Previous Reviews List */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-text-primary mb-3">Review History</h4>
                        <div className="space-y-3">
                            {reviews.slice(0, 3).map((review) => (
                                <div key={review.id} className="p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-text-primary text-sm">{review.reviewCycle}</span>
                                            <ReviewStatusBadge status={review.status} />
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                            {formatDate(review.reviewDate)} • By {review.reviewerName}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg text-text-primary">{review.rating.toFixed(1)}</span>
                                        <RatingStars rating={review.rating} size="sm" className="hidden sm:flex mt-0.5" />
                                    </div>
                                </div>
                            ))}

                            {reviews.length > 3 && (
                                <button className="w-full py-2 text-sm font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors">
                                    View full history
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
