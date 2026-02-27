package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.service.EmployeeService;
import com.kpmg.employee360.service.ExportService;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management APIs")
@CrossOrigin
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ExportService exportService;
    private final PermissionService permissionService;

    @GetMapping("/me")
    @Operation(summary = "Get current logged in user profile and permissions")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getCurrentUser()));
    }

    @PostMapping
    @Operation(summary = "Create a new employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created", employeeService.createEmployee(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee 360 detail by ID")
    public ResponseEntity<ApiResponse<EmployeeDetailResponse>> getEmployeeDetail(@PathVariable @NonNull Long id) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (permissionService.canViewEmployeeProfile(currentUserId, id)) {
            return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeDetail(id)));
        } else {
            // Return limited profile if not authorized for full view
            return ResponseEntity
                    .ok(ApiResponse.success("Limited profile view", employeeService.getLimitedEmployeeDetail(id)));
        }
    }

    @GetMapping("/code/{empCode}")
    @Operation(summary = "Get employee by emp code")
    public ResponseEntity<ApiResponse<EmployeeDetailResponse>> getByEmpCode(@PathVariable String empCode) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeByEmpCode(empCode)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search employees by name, code, or email")
    public ResponseEntity<ApiResponse<List<EmployeeSlimDTO>>> searchEmployees(@RequestParam String q) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        boolean fullSearch = permissionService.hasPermission(currentUserId, Permission.SEARCH_FULL);
        return ResponseEntity.ok(ApiResponse.success(employeeService.searchEmployees(q, fullSearch)));
    }

    @GetMapping("/{id}/direct-reports")
    @Operation(summary = "Get direct reports of an employee")
    public ResponseEntity<ApiResponse<List<EmployeeSlimDTO>>> getDirectReports(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getDirectReports(id)));
    }

    @GetMapping("/{id}/org-hierarchy")
    @Operation(summary = "Get full org hierarchy for an employee")
    public ResponseEntity<ApiResponse<OrgHierarchyDTO>> getOrgHierarchy(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getOrgHierarchy(id)));
    }

    @GetMapping("/{id}/teammates")
    @Operation(summary = "Get actual teammates of an employee")
    public ResponseEntity<ApiResponse<List<EmployeeSlimDTO>>> getTeammates(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getTeammates(id)));
    }

    @GetMapping
    @Operation(summary = "Get all employees (paginated)")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees(pageable)));
    }

    @GetMapping("/designation/{level}")
    @Operation(summary = "Get employees by designation level")
    public ResponseEntity<ApiResponse<List<EmployeeSlimDTO>>> getByDesignation(@PathVariable Integer level) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeesByDesignation(level)));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter employees with multiple criteria")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> filterEmployees(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, name = "designation") Integer designationLevel,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long managerId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.filterEmployees(q, designationLevel, department, location, active, managerId,
                        pageable)));
    }

    @GetMapping("/available")
    @Operation(summary = "Search available employees for allocation")
    public ResponseEntity<ApiResponse<Page<EmployeeAvailabilityDTO>>> getAvailableEmployees(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minAvailable,
            @PageableDefault(size = 20) Pageable pageable) {

        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to search available employees"));
        }

        return ResponseEntity.ok(ApiResponse.success(
                employeeService.searchAvailableEmployees(q, department, location, minAvailable, pageable)));
    }

    // ─── Export Endpoints ────────────────────────────────────────────

    @GetMapping("/{id}/report")
    @Operation(summary = "Download a JSON 360 summary report for an employee")
    public ResponseEntity<byte[]> downloadEmployeeReport(@PathVariable @NonNull Long id) {
        byte[] data = exportService.generateEmployeeReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employee-" + id + "-report.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @GetMapping("/{id}/team-csv")
    @Operation(summary = "Download a CSV report of all direct reports for a manager")
    public ResponseEntity<byte[]> downloadTeamCsv(@PathVariable @NonNull Long id) {
        byte[] data = exportService.generateTeamCsv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"team-report-" + id + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }

    @GetMapping("/export")
    @Operation(summary = "Export all employees to CSV based on permissions")
    public ResponseEntity<byte[]> exportEmployees() {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        String csvData = exportService.exportEmployeesToCsv(currentUserId);
        byte[] data = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employees-export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details (partial)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();
        EmployeeDetailResponse targetEmployee = employeeService.getEmployeeDetail(id);

        boolean isSelf = currentUserId.equals(id);
        boolean isManager = currentUserId.equals(targetEmployee.getReportingManagerId());
        boolean isDirectorOrAbove = currentUser.getDesignationLevel() >= 6;

        if (!isSelf && !isManager && !isDirectorOrAbove) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to update this employee"));
        }

        // Apply restrictions based on permission level
        if (!isDirectorOrAbove) {
            if (isSelf) {
                // Restricted to phone and location
                String phone = request.getPhone();
                String location = request.getLocation();
                request = new EmployeeUpdateRequest(); // Reset to null all other fields
                request.setPhone(phone);
                request.setLocation(location);
            } else if (isManager) {
                // Restricted to department and designation
                Long designationId = request.getDesignationId();
                String department = request.getDepartment();
                request = new EmployeeUpdateRequest(); // Reset to null all other fields
                request.setDesignationId(designationId);
                request.setDepartment(department);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Employee updated", employeeService.updateEmployee(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate employee (soft delete)")
    public ResponseEntity<ApiResponse<String>> deactivateEmployee(@PathVariable @NonNull Long id) {
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();

        if (currentUser.getDesignationLevel() < 6) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Directors/Partners (Level 6+) can deactivate employees"));
        }

        employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated"));
    }

    @PutMapping("/{id}/reporting-manager/{managerId}")
    @Operation(summary = "Update reporting manager")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateReportingManager(
            @PathVariable @NonNull Long id,
            @PathVariable @NonNull Long managerId) {
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();

        if (currentUser.getDesignationLevel() < 6) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Directors/Partners can change managers"));
        }

        return ResponseEntity.ok(ApiResponse.success("Reporting manager updated",
                employeeService.updateReportingManager(id, managerId)));
    }

    @PutMapping("/{id}/performance-manager/{managerId}")
    @Operation(summary = "Update performance manager")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updatePerformanceManager(
            @PathVariable @NonNull Long id,
            @PathVariable @NonNull Long managerId) {
        EmployeeResponse currentUser = employeeService.getCurrentUser().getProfile();

        if (currentUser.getDesignationLevel() < 6) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only Directors/Partners can change managers"));
        }

        return ResponseEntity.ok(ApiResponse.success("Performance manager updated",
                employeeService.updatePerformanceManager(id, managerId)));
    }
}
