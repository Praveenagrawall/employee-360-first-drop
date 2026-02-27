package com.kpmg.employee360.controller;

import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.service.ExportService;
import com.kpmg.employee360.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "CSV Data Export Endpoints")
@CrossOrigin
public class ExportController {

    private final ExportService exportService;
    private final PermissionService permissionService;

    @GetMapping("/employees")
    @Operation(summary = "Export employee data to CSV")
    public ResponseEntity<byte[]> exportEmployees() {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        // Permission check is inside the service for this one to handle filtering
        String csv = exportService.exportEmployeesToCsv(currentUserId);
        return createCsvResponse(csv, "employees_export_" + timestamp() + ".csv");
    }

    @GetMapping("/projects")
    @Operation(summary = "Export project data to CSV")
    public ResponseEntity<byte[]> exportProjects() {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.VIEW_ALL_PROJECTS)) {
            throw new com.kpmg.employee360.exception.AccessDeniedException(
                    "Insufficient permissions to export projects");
        }
        String csv = exportService.exportProjectsToCsv();
        return createCsvResponse(csv, "projects_export_" + timestamp() + ".csv");
    }

    @GetMapping("/performance")
    @Operation(summary = "Export performance reviews for a specific cycle to CSV")
    public ResponseEntity<byte[]> exportPerformance(@RequestParam String cycle) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        // Permission check is inside the service to handle filtering
        String csv = exportService.exportPerformanceReviewsCsv(cycle, currentUserId);
        return createCsvResponse(csv, "performance_reviews_" + cycle + "_" + timestamp() + ".csv");
    }

    @GetMapping("/team-allocation/{projectId}")
    @Operation(summary = "Export team allocation for a specific project to CSV")
    public ResponseEntity<byte[]> exportTeamAllocation(@PathVariable Long projectId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.VIEW_ALL_PROJECTS) &&
                !permissionService.hasPermission(currentUserId, Permission.VIEW_TEAM_PROJECTS)) {
            throw new com.kpmg.employee360.exception.AccessDeniedException(
                    "Insufficient permissions to export team allocation");
        }
        String csv = exportService.exportTeamAllocationCsv(projectId);
        return createCsvResponse(csv, "team_allocation_prj_" + projectId + "_" + timestamp() + ".csv");
    }

    private ResponseEntity<byte[]> createCsvResponse(String csv, String filename) {
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    private String timestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    }
}
