package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.enums.ProjectStatus;
import com.kpmg.employee360.enums.ProjectType;
import com.kpmg.employee360.service.ProjectService;
import com.kpmg.employee360.service.PermissionService;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.enums.Permission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
@CrossOrigin
public class ProjectController {

    private final ProjectService projectService;
    private final PermissionService permissionService;

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.CREATE_PROJECT)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to create projects"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", projectService.createProject(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project detail with teams and members")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> getProjectDetail(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectDetail(id)));
    }

    @GetMapping
    @Operation(summary = "Get all projects with optional filters")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(
            @RequestParam(required = false) ProjectType type,
            @RequestParam(required = false) ProjectStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Long currentUserId = CurrentUserContext.getCurrentUserId();

        // If specific filters are provided, we use the standard method but this is less
        // common for general listing
        if (type != null || status != null) {
            // Ideally we'd combine these filters, but for now we follow the
            // permission-aware list if no filters
            return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjects(type, status, pageable)));
        }

        return ResponseEntity.ok(ApiResponse.success(projectService.getFilteredProjects(currentUserId, pageable)));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get projects for an employee")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectsByEmployee(
            @PathVariable @NonNull Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectsByEmployee(employeeId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project details (partial)")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        ProjectDetailResponse project = projectService.getProjectDetail(id);

        boolean isEM = currentUserId.equals(project.getEngagementManagerId());
        boolean isDirectorOrAbove = permissionService.getPermissions(
                permissionService.findEmployeeById(currentUserId)).stream()
                .anyMatch(p -> p.name().equals("CREATE_PROJECT")); // Level 6+ check via permission

        if (!isEM && !isDirectorOrAbove) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Engagement Manager or Directors/Partners can update this project"));
        }

        return ResponseEntity.ok(ApiResponse.success("Project updated", projectService.updateProject(id, request)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update project status")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProjectStatus(
            @PathVariable @NonNull Long id,
            @RequestBody java.util.Map<String, String> statusMap) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        ProjectDetailResponse project = projectService.getProjectDetail(id);
        ProjectStatus status = ProjectStatus.valueOf(statusMap.get("status"));

        boolean isEM = currentUserId.equals(project.getEngagementManagerId());
        int userLevel = permissionService.findEmployeeById(currentUserId).getDesignation().getLevel();

        if (!isEM && userLevel < 5) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse
                            .error("Only Engagement Manager or Managers+ (Level 5+) can change project status"));
        }

        return ResponseEntity
                .ok(ApiResponse.success("Project status updated", projectService.updateProjectStatus(id, status)));
    }
}
