package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.service.TeamService;
import com.kpmg.employee360.service.PermissionService;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.enums.Permission;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Team management APIs")
@CrossOrigin
public class TeamController {

    private final TeamService teamService;
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(@Valid @RequestBody TeamCreateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to create teams"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team created", teamService.createTeam(request)));
    }

    @PostMapping("/members")
    public ResponseEntity<ApiResponse<String>> addMember(@Valid @RequestBody TeamMemberAddRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to assign team members"));
        }
        teamService.addMember(request);
        return ResponseEntity.ok(ApiResponse.success("Member added to team", "Success"));
    }

    @DeleteMapping("/{teamId}/members/{employeeId}")
    public ResponseEntity<ApiResponse<String>> removeMember(@PathVariable @NonNull Long teamId,
            @PathVariable @NonNull Long employeeId) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to remove team members"));
        }
        teamService.removeMember(teamId, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from team", "Success"));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeamsByProject(@PathVariable @NonNull Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeamsByProject(projectId)));
    }

    @PutMapping("/members/{memberId}/allocation")
    public ResponseEntity<ApiResponse<String>> updateAllocation(
            @PathVariable @NonNull Long memberId,
            @Valid @RequestBody AllocationUpdateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to update allocation"));
        }
        teamService.updateAllocation(memberId, request.getAllocationPercentage());
        return ResponseEntity.ok(ApiResponse.success("Allocation updated", "Success"));
    }

    @PutMapping("/members/{memberId}/role")
    public ResponseEntity<ApiResponse<String>> updateRole(
            @PathVariable @NonNull Long memberId,
            @Valid @RequestBody RoleUpdateRequest request) {
        Long currentUserId = CurrentUserContext.getCurrentUserId();
        if (!permissionService.hasPermission(currentUserId, Permission.ASSIGN_TEAM_MEMBERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Insufficient permissions to update role"));
        }
        teamService.updateRole(memberId, request.getRoleInTeam());
        return ResponseEntity.ok(ApiResponse.success("Role updated", "Success"));
    }

    @GetMapping("/employee/{employeeId}/memberships")
    public ResponseEntity<ApiResponse<List<TeamMemberDTO>>> getMembershipsByEmployee(
            @PathVariable @NonNull Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getMembershipsByEmployee(employeeId)));
    }
}
