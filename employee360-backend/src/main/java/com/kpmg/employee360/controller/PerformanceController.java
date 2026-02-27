package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.service.PerformanceService;
import com.kpmg.employee360.service.PermissionService;
import com.kpmg.employee360.service.EmployeeService;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.enums.ReviewStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
@Tag(name = "Performance", description = "Performance review APIs")
@CrossOrigin
public class PerformanceController {

    private final PerformanceService performanceService;
    private final PermissionService permissionService;
    private final EmployeeService employeeService;
    private final com.kpmg.employee360.service.AnalyticsService analyticsService;

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> createReview(
            @Valid @RequestBody PerformanceReviewRequest request,
            @RequestParam @NonNull Long reviewerId) {

        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.WRITE_PERFORMANCE_REVIEW)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to write reviews"));
        }

        // Verify reviewer is the employee's reporting or performance manager
        Employee employee = employeeService.findEmployeeById(request.getEmployeeId());
        boolean isManager = (employee.getReportingManager() != null
                && employee.getReportingManager().getId().equals(reviewerId)) ||
                (employee.getPerformanceManager() != null
                        && employee.getPerformanceManager().getId().equals(reviewerId));

        if (!isManager) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only the reporting or performance manager can submit reviews"));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created", performanceService.createReview(request, reviewerId)));
    }

    @GetMapping("/reviews/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getReviewsByEmployee(
            @PathVariable @NonNull Long employeeId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.canViewPerformance(currentUserId, employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to view performance reviews"));
        }
        return ResponseEntity.ok(ApiResponse.success(performanceService.getReviewsByEmployee(employeeId)));
    }

    @GetMapping("/summary/{employeeId}")
    public ResponseEntity<ApiResponse<PerformanceSummaryDTO>> getPerformanceSummary(
            @PathVariable @NonNull Long employeeId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.canViewPerformance(currentUserId, employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to view performance summary"));
        }
        return ResponseEntity.ok(ApiResponse.success(performanceService.getPerformanceSummary(employeeId)));
    }

    @GetMapping("/reviews/pending/{reviewerId}")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getPendingReviews(
            @PathVariable @NonNull Long reviewerId) {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getPendingReviews(reviewerId)));
    }

    @PutMapping("/reviews/{id}")
    @Operation(summary = "Update performance review details")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> updateReview(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody ReviewUpdateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        PerformanceReviewResponse review = performanceService.getReviewById(id);

        if (!currentUserId.equals(review.getReviewerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only the reviewer can update the review"));
        }

        if (review.getStatus() != ReviewStatus.DRAFT && review.getStatus() != ReviewStatus.SUBMITTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Reviews can only be updated in DRAFT or SUBMITTED status"));
        }

        return ResponseEntity.ok(ApiResponse.success("Review updated", performanceService.updateReview(id, request)));
    }

    @PutMapping("/reviews/{id}/submit")
    @Operation(summary = "Submit review (DRAFT -> SUBMITTED)")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> submitReview(@PathVariable @NonNull Long id) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        PerformanceReviewResponse review = performanceService.getReviewById(id);

        if (!currentUserId.equals(review.getReviewerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only the reviewer can submit the review"));
        }

        return ResponseEntity.ok(ApiResponse.success("Review submitted", performanceService.submitReview(id)));
    }

    @PutMapping("/reviews/{id}/acknowledge")
    @Operation(summary = "Acknowledge review (SUBMITTED -> ACKNOWLEDGED)")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> acknowledgeReview(@PathVariable @NonNull Long id) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        PerformanceReviewResponse review = performanceService.getReviewById(id);

        if (!currentUserId.equals(review.getEmployeeId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only the employee being reviewed can acknowledge the review"));
        }

        return ResponseEntity.ok(ApiResponse.success("Review acknowledged", performanceService.acknowledgeReview(id)));
    }

    @PutMapping("/reviews/{id}/complete")
    @Operation(summary = "Complete review (ACKNOWLEDGED -> COMPLETED)")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> completeReview(@PathVariable @NonNull Long id) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        PerformanceReviewResponse review = performanceService.getReviewById(id);
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();

        boolean isReviewer = currentUserId.equals(review.getReviewerId());
        boolean isDirectorOrAbove = currentUser.getDesignationLevel() >= 6;

        if (!isReviewer && !isDirectorOrAbove) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only the reviewer or Directors/Partners can complete the review"));
        }

        return ResponseEntity.ok(ApiResponse.success("Review completed", performanceService.completeReview(id)));
    }

    @GetMapping("/reviews/cycle/{cycle}")
    @Operation(summary = "Get all reviews for a specific cycle")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getReviewsByCycle(@PathVariable String cycle) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();

        if (currentUser.getDesignationLevel() < 5) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Managers+ (Level 5+) can view cycle reports"));
        }

        return ResponseEntity.ok(ApiResponse.success(performanceService.getReviewsByCycle(cycle)));
    }

    @GetMapping("/reviews/team/{managerId}")
    @Operation(summary = "Get reviews for all direct reports of a manager")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getReviewsForTeam(
            @PathVariable @NonNull Long managerId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!currentUserId.equals(managerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Can only view reviews for own team"));
        }
        return ResponseEntity.ok(ApiResponse.success(performanceService.getReviewsForTeam(managerId)));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get all reviews with optional filters (Leadership only)")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getReviewsWithFilters(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer designation,
            @RequestParam(required = false) String cycle,
            @RequestParam(required = false) ReviewStatus status) {

        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.VIEW_ANY_PERFORMANCE)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Leadership can view all reviews"));
        }
        return ResponseEntity.ok(
                ApiResponse.success(performanceService.getReviewsWithFilters(department, designation, cycle, status)));
    }

    @GetMapping("/overview")
    @Operation(summary = "Get performance overview for analytics")
    public ResponseEntity<ApiResponse<PerformanceOverviewDTO>> getPerformanceOverview() {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.VIEW_ORG_ANALYTICS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to view performance overview"));
        }
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPerformanceOverview()));
    }
}
