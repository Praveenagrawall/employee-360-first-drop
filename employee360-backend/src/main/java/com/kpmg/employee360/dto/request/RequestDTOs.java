package com.kpmg.employee360.dto.request;

import com.kpmg.employee360.enums.FeedbackType;
import com.kpmg.employee360.enums.ProjectStatus;
import com.kpmg.employee360.enums.ProjectType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

public class RequestDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeCreateRequest {
        @NotBlank(message = "Employee code is required")
        private String empCode;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;

        @NotNull(message = "Designation ID is required")
        private Long designationId;

        @NotBlank(message = "Department is required")
        private String department;

        private String location;
        private LocalDate dateOfJoining;
        private Long reportingManagerId;
        private Long performanceManagerId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeUpdateRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private Long designationId;
        private String department;
        private String location;
        private Long reportingManagerId;
        private Long performanceManagerId;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectCreateRequest {
        @NotBlank(message = "Project code is required")
        private String projectCode;

        @NotBlank(message = "Project name is required")
        private String name;

        private String description;

        @NotNull(message = "Project type is required")
        private ProjectType type;

        private ProjectStatus status;
        private String clientName;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        private LocalDate endDate;

        @NotNull(message = "Engagement manager is required")
        private Long engagementManagerId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamCreateRequest {
        @NotBlank(message = "Team name is required")
        private String name;

        @NotNull(message = "Project ID is required")
        private Long projectId;

        private Long teamLeadId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberAddRequest {
        @NotNull(message = "Team ID is required")
        private Long teamId;

        @NotNull(message = "Employee ID is required")
        private Long employeeId;

        @NotBlank(message = "Role in team is required")
        private String roleInTeam;

        @Min(value = 0)
        @Max(value = 100)
        private Integer allocationPercentage;

        private LocalDate startDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceReviewRequest {
        @NotNull(message = "Employee ID is required")
        private Long employeeId;

        @NotBlank(message = "Review cycle is required")
        private String reviewCycle;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;

        private String goals;
        private String comments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackRequest {
        @NotNull(message = "Recipient employee ID is required")
        private Long toEmployeeId;

        private Long projectId;

        @NotNull(message = "Feedback type is required")
        private FeedbackType type;

        @NotBlank(message = "Feedback content is required")
        private String content;

        @Min(1)
        @Max(5)
        private Integer rating;

        private Boolean isAnonymous;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectUpdateRequest {
        private String name;
        private String description;
        private ProjectStatus status;
        private String clientName;
        private LocalDate endDate;
        private Long engagementManagerId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewUpdateRequest {
        @Min(1)
        @Max(5)
        private Integer rating;
        private String goals;
        private String comments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationUpdateRequest {
        @Min(0)
        @Max(100)
        @NotNull
        private Integer allocationPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleUpdateRequest {
        @NotBlank
        private String roleInTeam;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationRequestCreateDTO {
        @NotNull(message = "Employee ID is required")
        private Long employeeId;

        @NotNull(message = "Team ID is required")
        private Long teamId;

        @NotNull(message = "Project ID is required")
        private Long projectId;

        private String roleInTeam;

        @NotNull
        @Min(1)
        @Max(100)
        private Integer requestedAllocation;

        private LocalDate proposedStartDate;
        private LocalDate proposedEndDate;

        private String requestReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationRequestActionDTO {
        private String comments; // for approve
        private String reason; // for reject
    }
}
