package com.kpmg.employee360.controller;

import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.EmployeeSlimDTO;
import com.kpmg.employee360.dto.response.ResponseDTOs.UserContextDTO;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.EmployeeRepository;
import com.kpmg.employee360.service.EmployeeService;
import com.kpmg.employee360.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/user-context")
@RequiredArgsConstructor
@Tag(name = "User Context", description = "Endpoints for frontend identity and role switching")
@CrossOrigin
public class UserContextController {

    private final EmployeeRepository employeeRepository;
    private final PermissionService permissionService;
    private final EmployeeService employeeService;

    @GetMapping("/me")
    @Operation(summary = "Get current logged in user context")
    public ResponseEntity<ApiResponse<UserContextDTO>> getMe() {
        Long userId = CurrentUserContext.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(buildUserContext(userId)));
    }

    @GetMapping("/switch/{employeeId}")
    @Operation(summary = "Switch current user for demo purposes")
    public ResponseEntity<ApiResponse<UserContextDTO>> switchUser(@PathVariable Long employeeId) {
        // In a real app, this would involve session/token changes.
        // For our simulation, we update the context and return the new user's data.
        CurrentUserContext.setCurrentUserId(employeeId);
        return ResponseEntity.ok(ApiResponse.success(buildUserContext(employeeId)));
    }

    @GetMapping("/switchable-users")
    @Operation(summary = "Get list of users available for role switching")
    public ResponseEntity<ApiResponse<List<EmployeeSlimDTO>>> getSwitchableUsers() {
        List<EmployeeSlimDTO> users = employeeRepository.findByIsActiveTrue().stream()
                .map(employeeService::toSlimDTO)
                .sorted(Comparator.comparing(EmployeeSlimDTO::getDesignationLevel).reversed()
                        .thenComparing(EmployeeSlimDTO::getFullName))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    private UserContextDTO buildUserContext(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", String.valueOf(employeeId)));

        Set<String> permissions = permissionService.getPermissions(employee).stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return UserContextDTO.builder()
                .employeeId(employee.getId())
                .fullName(employee.getFullName())
                .empCode(employee.getEmpCode())
                .email(employee.getEmail())
                .designation(employee.getDesignation() != null ? employee.getDesignation().getName() : null)
                .designationLevel(employee.getDesignation() != null ? employee.getDesignation().getLevel() : null)
                .dashboardType(employee.getDesignation() != null ? employee.getDesignation().getDashboardType() : null)
                .department(employee.getDepartment())
                .location(employee.getLocation())
                .profilePicUrl(employee.getProfilePicUrl())
                .permissions(permissions)
                .build();
    }
}
