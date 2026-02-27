package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.service.DashboardService;
import com.kpmg.employee360.service.PermissionService;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.enums.Permission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-based dashboard APIs")
@CrossOrigin
public class DashboardController {

    private final DashboardService dashboardService;
    private final PermissionService permissionService;

    @GetMapping("/{employeeId}")
    @Operation(summary = "Get role-based dashboard for an employee")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@PathVariable @NonNull Long employeeId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();

        boolean isOwnDashboard = currentUserId.equals(employeeId);
        boolean hasLeadershipView = permissionService.hasPermission(currentUserId, Permission.VIEW_ORG_ANALYTICS);

        if (!isOwnDashboard && !hasLeadershipView) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to view this dashboard"));
        }

        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard(employeeId)));
    }
}
