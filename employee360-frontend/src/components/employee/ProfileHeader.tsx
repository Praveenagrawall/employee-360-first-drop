import { Mail, Phone, MapPin, Calendar, Download, MessageSquare, PenSquare, Edit, Building2, Network } from 'lucide-react';
import { useState } from 'react';
import { Card, Avatar, Badge, AllocationStatusBadge, Button } from '../common';
import { formatDate } from '../../utils';
import type { EmployeeDetail, AllocationStatus } from '../../types';
import { exportApi } from '../../api/exportApi';
import { useUserContext } from '../../context/UserContextProvider';
import { useCreateReview } from '../../hooks';
import GiveFeedbackModal from '../feedback/GiveFeedbackModal';
import StartReviewModal from '../performance/StartReviewModal';

import toast from 'react-hot-toast';

interface ProfileHeaderProps {
    employee: EmployeeDetail;
}

export function ProfileHeader({ employee }: ProfileHeaderProps) {
    const { currentUser, hasPermission } = useUserContext();
    const [exporting, setExporting] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview();

    // Calculate allocation status
    let allocStatus: AllocationStatus = 'BENCH';
    if (employee.totalAllocationPercentage >= 100) allocStatus = 'ACTIVE';
    else if (employee.totalAllocationPercentage > 0) allocStatus = 'PARTIAL';

    const isOwnProfile = currentUser?.employeeId === employee.id;
    const isManagerOfThisEmployee = currentUser?.employeeId === employee.reportingManagerId;

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportApi.downloadEmployeeReport(employee.id);
            toast.success('Report downloaded!');
        } catch {
            toast.error('Failed to download report.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Card className="relative overflow-hidden border-[#E5E8EB] bg-card-bg rounded-card mb-6">
            {/* Header Gradient Strip */}
            <div className="h-[100px] bg-header-gradient opacity-10" />

            <div className="relative z-10 p-6 flex flex-col md:flex-row gap-8">
                {/* Left Side: Avatar & Core Info */}
                <div className="flex flex-col items-center md:items-start -mt-16">
                    <div className="relative">
                        <Avatar
                            src={employee.profilePicUrl}
                            name={employee.fullName}
                            size="2xl"
                            className="w-32 h-32 ring-4 ring-white shadow-sm"
                        />
                        {isOwnProfile && (
                            <button className="absolute bottom-1 right-1 p-1.5 bg-white rounded-full shadow-sm border border-[#E5E8EB] text-kpmg-blue hover:bg-page-bg transition-all">
                                <Edit className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="mt-4 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            {employee.fullName}
                        </h1>
                        <p className="text-sm font-bold text-kpmg-blue uppercase tracking-wider mt-0.5">
                            {employee.designationName}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                            {employee.isActive ? (
                                <AllocationStatusBadge status={allocStatus} />
                            ) : (
                                <Badge color="secondary">Inactive</Badge>
                            )}
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-[#F1F3F5] px-2 py-0.5 rounded">
                                #{employee.empCode}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Actions */}
                <div className="flex-1 space-y-6">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <Building2 className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Service Line</p>
                                <p className="text-sm font-semibold text-text-primary">{employee.department}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <MapPin className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Location</p>
                                <p className="text-sm font-semibold text-text-primary">{employee.location || 'Remote'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <Calendar className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Joined Date</p>
                                <p className="text-sm font-semibold text-text-primary">{formatDate(employee.dateOfJoining)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <Mail className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</p>
                                <p className="text-sm font-semibold text-text-primary truncate">{employee.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <Phone className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Phone Number</p>
                                <p className="text-sm font-semibold text-text-primary">{employee.phone || 'Not Provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#F0F4F8] rounded">
                                <Network className="w-4 h-4 text-kpmg-blue" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reporting Manager</p>
                                <p className="text-sm font-semibold text-text-primary">{employee.reportingManagerName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#F1F3F5]">
                        {(hasPermission('GIVE_PEER_FEEDBACK') || hasPermission('GIVE_DOWNWARD_FEEDBACK')) && (
                            <Button variant="primary" size="sm" className="gap-2" onClick={() => setIsFeedbackModalOpen(true)}>
                                <MessageSquare className="w-3.5 h-3.5" />
                                Give Feedback
                            </Button>
                        )}

                        {hasPermission('WRITE_PERFORMANCE_REVIEW') && isManagerOfThisEmployee && (
                            <Button variant="secondary" size="sm" className="gap-2" onClick={() => setIsReviewModalOpen(true)}>
                                <PenSquare className="w-3.5 h-3.5" />
                                Write Review
                            </Button>
                        )}

                        {(hasPermission('EXPORT_TEAM_REPORT') || hasPermission('EXPORT_ANY_REPORT')) && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleExport}
                                isLoading={exporting}
                                className="gap-2"
                            >
                                {!exporting && <Download className="w-3.5 h-3.5" />}
                                Export Profile
                            </Button>
                        )}

                        {isOwnProfile && (
                            <Button variant="secondary" size="sm" className="gap-2">
                                <Edit className="w-3.5 h-3.5" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <GiveFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                fromEmployeeId={currentUser?.employeeId || 0}
                targetEmployeeId={employee.id}
            />

            <StartReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                employeeId={employee.id}
                employeeName={employee.fullName}
                onSubmit={(data) => {
                    createReview(data, {
                        onSuccess: () => {
                            setIsReviewModalOpen(false);
                            toast.success('Performance review started successfully');
                        },
                        onError: (error: Error) => {
                            toast.error(error.message || 'Failed to start review');
                        }
                    });
                }}
                isSubmitting={isSubmittingReview}
            />
        </Card>
    );
}
