package com.kpmg.employee360.controller;

import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.service.AnalyticsService;
import com.kpmg.employee360.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Organization-wide analytics and reporting")
@CrossOrigin
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final PermissionService permissionService;

    @GetMapping("/headcount")
    @Operation(summary = "Get headcount distribution across organization")
    public ResponseEntity<ApiResponse<HeadcountDTO>> getHeadcount() {
        checkPermission();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getHeadcount()));
    }

    @GetMapping("/utilization")
    @Operation(summary = "Get utilization metrics")
    public ResponseEntity<ApiResponse<UtilizationDTO>> getUtilization() {
        checkPermission();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUtilization()));
    }

    @GetMapping("/performance-overview")
    @Operation(summary = "Get performance overview distribution")
    public ResponseEntity<ApiResponse<PerformanceOverviewDTO>> getPerformanceOverview() {
        checkPermission();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPerformanceOverview()));
    }

    @GetMapping("/project-overview")
    @Operation(summary = "Get project status and risk overview")
    public ResponseEntity<ApiResponse<ProjectOverviewDTO>> getProjectOverview() {
        checkPermission();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getProjectOverview()));
    }

    @GetMapping("/org-overview")
    @Operation(summary = "Get consolidated leadership analytics overview")
    public ResponseEntity<ApiResponse<LeadershipAnalyticsDTO>> getOrgOverview() {
        checkPermission();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOrgOverview()));
    }

    private void checkPermission() {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.VIEW_ORG_ANALYTICS)) {
            throw new com.kpmg.employee360.exception.AccessDeniedException(
                    "Insufficient permissions to view analytics");
        }
    }
}
