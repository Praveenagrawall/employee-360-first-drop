package com.kpmg.employee360.dto.response;

import com.kpmg.employee360.enums.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class ResponseDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSlimDTO {
        private Long id;
        private String empCode;
        private String fullName;
        private String email;
        private String designationName;
        private Integer designationLevel;
        private String profilePicUrl;
        private String department;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeResponse {
        private Long id;
        private String empCode;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String designationName;
        private Integer designationLevel;
        private DashboardType dashboardType;
        private String department;
        private String location;
        private LocalDate dateOfJoining;
        private String profilePicUrl;
        private Boolean isActive;
        // Reporting chain — flattened
        private Long reportingManagerId;
        private String reportingManagerName;
        private Long performanceManagerId;
        private String performanceManagerName;
        private Integer totalAllocation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeDetailResponse {
        private Long id;
        private String empCode;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String designationName;
        private Integer designationLevel;
        private DashboardType dashboardType;
        private String department;
        private String location;
        private LocalDate dateOfJoining;
        private String profilePicUrl;
        private Boolean isActive;
        // Reporting chain
        private Long reportingManagerId;
        private String reportingManagerName;
        private String reportingManagerDesignation;
        private Long performanceManagerId;
        private String performanceManagerName;
        private String performanceManagerDesignation;
        // Teams & Projects
        private List<TeamAssignmentDTO> currentTeams;
        private Integer totalAllocationPercentage;
        // People
        private List<EmployeeSlimDTO> directReports;
        private List<EmployeeSlimDTO> teammates;
        // Performance
        private PerformanceSummaryDTO performanceSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamAssignmentDTO {
        private Long teamId;
        private String teamName;
        private Long projectId;
        private String projectName;
        private ProjectType projectType;
        private String clientName;
        private String roleInTeam;
        private Integer allocationPercentage;
        private String teamLeadName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectResponse {
        private Long id;
        private String projectCode;
        private String name;
        private String description;
        private ProjectType type;
        private ProjectStatus status;
        private String clientName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String engagementManagerName;
        private Long engagementManagerId;
        private Integer teamCount;
        private Integer memberCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDetailResponse {
        private Long id;
        private String projectCode;
        private String name;
        private String description;
        private ProjectType type;
        private ProjectStatus status;
        private String clientName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String engagementManagerName;
        private Long engagementManagerId;
        private List<TeamResponse> teams;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamResponse {
        private Long id;
        private String name;
        private String teamLeadName;
        private Long teamLeadId;
        private String projectName;
        private Long projectId;
        private Integer memberCount;
        private List<TeamMemberDTO> members;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberDTO {
        private Long id;
        private String employeeName;
        private Long employeeId;
        private String empCode;
        private String designation;
        private String roleInTeam;
        private Integer allocationPercentage;
        private AllocationStatus status;
        private LocalDate startDate;
        private LocalDate endDate;
        private String profilePicUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceReviewResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private Long reviewerId;
        private String reviewerName;
        private String reviewCycle;
        private Integer rating;
        private String goals;
        private String comments;
        private ReviewStatus status;
        private LocalDate reviewDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceSummaryDTO {
        private Integer latestRating;
        private Double averageRating;
        private Integer totalReviews;
        private String lastReviewCycle;
        private LocalDate lastReviewDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackResponse {
        private Long id;
        private String fromEmployeeName;
        private Long fromEmployeeId;
        private String toEmployeeName;
        private Long toEmployeeId;
        private String projectName;
        private FeedbackType type;
        private String content;
        private Integer rating;
        private Boolean isAnonymous;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrgHierarchyDTO {
        private EmployeeSlimDTO employee;
        private EmployeeSlimDTO reportingManager;
        private EmployeeSlimDTO performanceManager;
        private List<EmployeeSlimDTO> directReports;
        private List<OrgHierarchyDTO> upwardChain; // chain up to Partner
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private DashboardType dashboardType;
        private EmployeeSlimDTO employee;
        // Individual dashboard fields
        private Integer currentProjectCount;
        private Integer totalAllocation;
        private Integer latestRating;
        private Integer feedbackCount;
        private List<TeamAssignmentDTO> myProjects;
        private List<EmployeeSlimDTO> myTeammates;
        private List<PerformanceReviewResponse> recentReviews;
        private List<FeedbackResponse> recentFeedback;
        private String allocationStatus;
        private String currentGoals;
        // Manager dashboard fields
        private Integer directReportCount;
        private Double averageTeamRating;
        private Integer pendingReviewCount;
        private Double teamUtilization;
        private List<EmployeeSlimDTO> directReports;
        private List<ProjectResponse> activeProjects;
        private List<PerformanceReviewResponse> pendingReviews;
        private List<EmployeeSlimDTO> benchedReports;
        private Double reviewCompletionRate;

        // Allocation Request fields (Manager / Leadership)
        private Integer pendingAllocationRequestCount;
        private List<AllocationRequestResponse> pendingAllocationRequests;

        // Leadership dashboard fields
        private Integer totalHeadcount;
        private Integer clientProjectCount;
        private Integer proposalCount;
        private Integer benchStrength;
        private Double utilizationRate;
        private List<EmployeeSlimDTO> recentHires;
        private java.util.Map<String, Integer> departmentBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeadcountDTO {
        private int totalActive;
        private int totalInactive;
        private java.util.Map<String, Integer> byDesignation;
        private java.util.Map<String, Integer> byDepartment;
        private java.util.Map<String, Integer> byLocation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationDTO {
        private double averageUtilization;
        private int fullyAllocated;
        private int partiallyAllocated;
        private int onBench;
        private List<EmployeeSlimDTO> benchEmployees;
        private List<EmployeeSlimDTO> overAllocated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceOverviewDTO {
        private double organizationAverageRating;
        private java.util.Map<Integer, Integer> ratingDistribution;
        private java.util.Map<String, Double> averageByDepartment;
        private List<EmployeeSlimDTO> topPerformers;
        private int pendingReviewsCount;
        private int completedReviewsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectOverviewDTO {
        private int totalProjects;
        private int activeProjects;
        private int completedProjects;
        private int onHoldProjects;
        private int pipelineProjects;
        private java.util.Map<String, Integer> byType;
        private List<ProjectResponse> atRiskProjects;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResultsDTO {
        private List<EmployeeSlimDTO> employees;
        private List<ProjectResponse> projects;
        private int totalEmployeeResults;
        private int totalProjectResults;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeadcountByDesignationDTO {
        private String designation;
        private Integer count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationStatsDTO {
        private Integer allocated; // 100%
        private Integer partial; // 1-99%
        private Integer bench; // 0%
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPerformerDTO {
        private EmployeeSlimDTO employee;
        private Double averageRating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeadershipAnalyticsDTO {
        private List<HeadcountByDesignationDTO> headcountByDesignation;
        private UtilizationStatsDTO utilizationStats;
        private List<TopPerformerDTO> topPerformers;
        private List<EmployeeSlimDTO> benchEmployees;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentUserResponse {
        private EmployeeResponse profile;
        private Set<String> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserContextDTO {
        private Long employeeId;
        private String fullName;
        private String empCode;
        private String email;
        private String designation;
        private Integer designationLevel;
        private DashboardType dashboardType;
        private String department;
        private String location;
        private String profilePicUrl;
        private Set<String> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationRequestResponse {
        private Long id;

        // Employee info
        private Long employeeId;
        private String employeeName;
        private String employeeDesignation;
        private String employeeDepartment;
        private String employeeEmpCode;

        // Project/Team info
        private Long projectId;
        private String projectName;
        private String projectType;
        private Long teamId;
        private String teamName;

        // Request details
        private String roleInTeam;
        private Integer requestedAllocation;
        private Integer currentTotalAllocation;
        private Integer availableAllocation;
        private Boolean willExceedCapacity;
        private LocalDate proposedStartDate;
        private LocalDate proposedEndDate;
        private String requestReason;

        // Requester info
        private Long requesterId;
        private String requesterName;
        private String requesterDesignation;

        // Approver info
        private Long approverId;
        private String approverName;
        private String approverDesignation;

        // Status
        private AllocationRequestStatus status;
        private String statusDisplayName;
        private String rejectionReason;
        private String approverComments;
        private LocalDateTime createdAt;
        private LocalDateTime resolvedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationRequestSummary {
        private long pendingCount;
        private long approvedCount;
        private long rejectedCount;
        private List<AllocationRequestResponse> recentRequests;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeAvailabilityDTO {
        private Long id;
        private String empCode;
        private String fullName;
        private String email;
        private String designation;
        private Integer designationLevel;
        private String department;
        private String location;
        private String profilePicUrl;
        private Integer totalAllocation;
        private Integer availableAllocation;
        private String allocationStatus;
        private List<CurrentAssignmentDTO> currentAssignments;
        private Double averageRating;
        private Integer latestRating;
        private Boolean hasPendingRequest;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentAssignmentDTO {
        private String projectName;
        private String teamName;
        private String roleInTeam;
        private Integer allocationPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDTO {
        private Long id;
        private String title;
        private String message;
        private String type;
        private Long referenceId;
        private String referenceType;
        private Boolean isRead;
        private java.time.LocalDateTime createdAt;
    }
}
