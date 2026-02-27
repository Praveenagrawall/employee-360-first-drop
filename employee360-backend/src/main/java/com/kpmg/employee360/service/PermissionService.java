package com.kpmg.employee360.service;

import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.repository.EmployeeRepository;
import com.kpmg.employee360.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Set;

import static com.kpmg.employee360.enums.Permission.*;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final EmployeeRepository employeeRepository;
    private final TeamMemberRepository teamMemberRepository;

    public Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new com.kpmg.employee360.exception.ResourceNotFoundException("Employee", "id",
                        String.valueOf(id)));
    }

    public Set<Permission> getPermissions(Employee employee) {
        if (employee.getDesignation() == null) {
            return EnumSet.of(VIEW_OWN_PROFILE, VIEW_OWN_PERFORMANCE, VIEW_OWN_PROJECTS, GIVE_PEER_FEEDBACK);
        }

        int level = employee.getDesignation().getLevel();
        Set<Permission> perms = EnumSet.of(VIEW_OWN_PROFILE, VIEW_OWN_PERFORMANCE, VIEW_OWN_PROJECTS,
                GIVE_PEER_FEEDBACK);

        if (level <= 3) {
            perms.addAll(EnumSet.of(SEARCH_BASIC, VIEW_LIMITED_PROFILE));
        }

        if (level >= 4) {
            perms.addAll(EnumSet.of(
                    VIEW_ANY_PROFILE,
                    VIEW_TEAM_PERFORMANCE,
                    WRITE_PERFORMANCE_REVIEW,
                    ASSIGN_TEAM_MEMBERS,
                    VIEW_TEAM_PROJECTS,
                    GIVE_DOWNWARD_FEEDBACK,
                    EXPORT_TEAM_REPORT,
                    SEARCH_FULL));
        }

        if (level >= 6) {
            perms.addAll(EnumSet.of(
                    VIEW_ANY_PERFORMANCE,
                    CREATE_PROJECT,
                    VIEW_ALL_PROJECTS,
                    VIEW_ORG_ANALYTICS,
                    EXPORT_ANY_REPORT));
        }

        if (level == 7) {
            perms.add(ADMIN_PANEL);
        }

        return perms;
    }

    public boolean hasPermission(Long employeeId, Permission permission) {
        return employeeRepository.findById(employeeId)
                .map(this::getPermissions)
                .map(perms -> perms.contains(permission))
                .orElse(false);
    }

    public boolean canViewEmployeeProfile(Long viewerId, Long targetId) {
        if (viewerId.equals(targetId))
            return true;

        Employee viewer = employeeRepository.findById(viewerId).orElse(null);
        if (viewer == null)
            return false;

        Set<Permission> perms = getPermissions(viewer);
        if (perms.contains(VIEW_ANY_PROFILE))
            return true;

        Employee target = employeeRepository.findById(targetId).orElse(null);
        if (target == null)
            return false;

        // Check if viewer is reporting or performance manager
        if (target.getReportingManager() != null && target.getReportingManager().getId().equals(viewerId))
            return true;
        if (target.getPerformanceManager() != null && target.getPerformanceManager().getId().equals(viewerId))
            return true;

        // Check if they share an active team
        return teamMemberRepository.existsBySharedTeam(viewerId, targetId);
    }

    public boolean canViewPerformance(Long viewerId, Long targetId) {
        if (viewerId.equals(targetId))
            return true;

        Employee viewer = employeeRepository.findById(viewerId).orElse(null);
        if (viewer == null)
            return false;

        Set<Permission> perms = getPermissions(viewer);
        if (perms.contains(VIEW_ANY_PERFORMANCE))
            return true;

        if (perms.contains(VIEW_TEAM_PERFORMANCE)) {
            Employee target = employeeRepository.findById(targetId).orElse(null);
            if (target != null && target.getReportingManager() != null &&
                    target.getReportingManager().getId().equals(viewerId)) {
                return true;
            }
        }

        return false;
    }
}
