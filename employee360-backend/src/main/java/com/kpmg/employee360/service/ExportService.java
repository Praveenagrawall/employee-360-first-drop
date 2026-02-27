package com.kpmg.employee360.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.AllocationStatus;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.EmployeeRepository;
import com.kpmg.employee360.repository.PerformanceReviewRepository;
import com.kpmg.employee360.repository.ProjectRepository;
import com.kpmg.employee360.repository.TeamMemberRepository;
import com.kpmg.employee360.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final PermissionService permissionService;

    // ─── Employee 360 JSON Report ─────────────────────────────────────

    public byte[] generateEmployeeReport(@NonNull Long employeeId) {
        EmployeeDetailResponse detail = employeeService.getEmployeeDetail(employeeId);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportGeneratedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("reportType", "Employee 360 Summary");
        report.put("employee", detail);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        try {
            return mapper.writeValueAsBytes(report);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize employee report", e);
        }
    }

    // ─── CSV Export Methods ───────────────────────────────────────────

    public String exportEmployeesToCsv(Long requesterId) {
        List<Employee> employees;
        if (permissionService.hasPermission(requesterId, Permission.EXPORT_ANY_REPORT)) {
            employees = employeeRepository.findAll();
        } else if (permissionService.hasPermission(requesterId, Permission.EXPORT_TEAM_REPORT)) {
            employees = employeeRepository.findByReportingManager_Id(requesterId);
        } else {
            throw new com.kpmg.employee360.exception.AccessDeniedException(
                    "Insufficient permissions to export employee report");
        }

        StringBuilder csv = new StringBuilder();
        csv.append(
                "EmpCode,Name,Email,Designation,Department,Location,ReportingManager,PerformanceManager,DateOfJoining,CurrentProjects,TotalAllocation,LatestRating,IsActive\n");

        for (Employee emp : employees) {
            Integer totalAlloc = teamMemberRepository.getTotalAllocationByEmployeeId(emp.getId());
            Double avgRating = performanceReviewRepository.getAverageRatingByEmployeeId(emp.getId());
            long projectCount = teamMemberRepository.findByEmployee_IdAndStatus(emp.getId(), AllocationStatus.ACTIVE)
                    .size();

            csv.append(escapeCsv(emp.getEmpCode())).append(",");
            csv.append(escapeCsv(emp.getFullName())).append(",");
            csv.append(escapeCsv(emp.getEmail())).append(",");
            csv.append(escapeCsv(emp.getDesignation().getDisplayName())).append(",");
            csv.append(escapeCsv(emp.getDepartment())).append(",");
            csv.append(escapeCsv(emp.getLocation())).append(",");
            csv.append(escapeCsv(emp.getReportingManager() != null ? emp.getReportingManager().getFullName() : ""))
                    .append(",");
            csv.append(escapeCsv(emp.getPerformanceManager() != null ? emp.getPerformanceManager().getFullName() : ""))
                    .append(",");
            csv.append(emp.getDateOfJoining() != null ? emp.getDateOfJoining().toString() : "").append(",");
            csv.append(projectCount).append(",");
            csv.append(totalAlloc != null ? totalAlloc : 0).append(",");
            csv.append(avgRating != null ? String.format("%.1f", avgRating) : "N/A").append(",");
            csv.append(emp.getIsActive()).append("\n");
        }
        return csv.toString();
    }

    public String exportProjectsToCsv() {
        List<Project> projects = projectRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append(
                "ProjectCode,Name,Type,Status,ClientName,EngagementManager,StartDate,EndDate,TeamCount,MemberCount\n");

        for (Project p : projects) {
            List<Team> teams = teamRepository.findByProject_Id(p.getId());
            long memberCount = teams.stream()
                    .flatMap(team -> teamMemberRepository.findByTeam_Id(team.getId()).stream())
                    .count();

            csv.append(escapeCsv(p.getProjectCode())).append(",");
            csv.append(escapeCsv(p.getName())).append(",");
            csv.append(p.getType()).append(",");
            csv.append(p.getStatus()).append(",");
            csv.append(escapeCsv(p.getClientName())).append(",");
            csv.append(escapeCsv(p.getEngagementManager() != null ? p.getEngagementManager().getFullName() : ""))
                    .append(",");
            csv.append(p.getStartDate()).append(",");
            csv.append(p.getEndDate() != null ? p.getEndDate() : "").append(",");
            csv.append(teams.size()).append(",");
            csv.append(memberCount).append("\n");
        }
        return csv.toString();
    }

    public String exportPerformanceReviewsCsv(String cycle, Long requesterId) {
        List<PerformanceReview> reviews;
        if (permissionService.hasPermission(requesterId, Permission.VIEW_ANY_PERFORMANCE)) {
            reviews = performanceReviewRepository.findByReviewCycle(cycle);
        } else if (permissionService.hasPermission(requesterId, Permission.VIEW_TEAM_PERFORMANCE)) {
            reviews = performanceReviewRepository.findByReviewer_Id(requesterId).stream()
                    .filter(r -> r.getReviewCycle().equals(cycle))
                    .collect(Collectors.toList());
        } else {
            throw new com.kpmg.employee360.exception.AccessDeniedException(
                    "Insufficient permissions to export performance reviews");
        }

        StringBuilder csv = new StringBuilder();
        csv.append(
                "EmployeeName,EmpCode,Designation,ReviewCycle,Rating,ReviewerName,Status,ReviewDate,Goals,Comments\n");

        for (PerformanceReview r : reviews) {
            csv.append(escapeCsv(r.getEmployee().getFullName())).append(",");
            csv.append(escapeCsv(r.getEmployee().getEmpCode())).append(",");
            csv.append(escapeCsv(r.getEmployee().getDesignation().getDisplayName())).append(",");
            csv.append(escapeCsv(r.getReviewCycle())).append(",");
            csv.append(r.getRating() != null ? r.getRating() : "").append(",");
            csv.append(escapeCsv(r.getReviewer().getFullName())).append(",");
            csv.append(r.getStatus()).append(",");
            csv.append(r.getReviewDate() != null ? r.getReviewDate() : "").append(",");
            csv.append(escapeCsv(r.getGoals())).append(",");
            csv.append(escapeCsv(r.getComments())).append("\n");
        }
        return csv.toString();
    }

    public String exportTeamAllocationCsv(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        List<Team> teams = teamRepository.findByProject_Id(projectId);
        StringBuilder csv = new StringBuilder();
        csv.append(
                "ProjectName,TeamName,EmployeeName,EmpCode,Designation,RoleInTeam,AllocationPercentage,Status,StartDate\n");

        for (Team team : teams) {
            List<TeamMember> members = teamMemberRepository.findByTeam_Id(team.getId());
            for (TeamMember tm : members) {
                csv.append(escapeCsv(project.getName())).append(",");
                csv.append(escapeCsv(team.getName())).append(",");
                csv.append(escapeCsv(tm.getEmployee().getFullName())).append(",");
                csv.append(escapeCsv(tm.getEmployee().getEmpCode())).append(",");
                csv.append(escapeCsv(tm.getEmployee().getDesignation().getDisplayName())).append(",");
                csv.append(escapeCsv(tm.getRoleInTeam())).append(",");
                csv.append(tm.getAllocationPercentage()).append(",");
                csv.append(tm.getStatus()).append(",");
                csv.append(tm.getStartDate()).append("\n");
            }
        }
        return csv.toString();
    }

    public byte[] generateTeamCsv(@NonNull Long managerId) {
        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", String.valueOf(managerId)));

        List<Employee> directReports = employeeRepository.findByReportingManager_Id(managerId);

        StringBuilder csv = new StringBuilder();

        // Header
        csv.append("Emp Code,Full Name,Designation,Department,Location,Date Of Joining,");
        csv.append("Avg Rating,Total Reviews,Total Allocation %,Active Projects,Status\n");

        for (Employee emp : directReports) {
            Double avgRating = performanceReviewRepository.getAverageRatingByEmployeeId(emp.getId());
            int totalReviews = performanceReviewRepository.findByEmployee_Id(emp.getId()).size();
            Integer allocation = teamMemberRepository.getTotalAllocationByEmployeeId(emp.getId());
            long activeProjects = teamMemberRepository.findByEmployee_IdAndStatus(
                    emp.getId(), com.kpmg.employee360.enums.AllocationStatus.ACTIVE).size();

            csv.append(escapeCsv(emp.getEmpCode())).append(",");
            csv.append(escapeCsv(emp.getFullName())).append(",");
            csv.append(escapeCsv(emp.getDesignation().getDisplayName())).append(",");
            csv.append(escapeCsv(emp.getDepartment())).append(",");
            csv.append(escapeCsv(emp.getLocation() != null ? emp.getLocation() : "")).append(",");
            csv.append(emp.getDateOfJoining() != null ? emp.getDateOfJoining().toString() : "").append(",");
            csv.append(avgRating != null ? String.format("%.1f", avgRating) : "N/A").append(",");
            csv.append(totalReviews).append(",");
            csv.append(allocation != null ? allocation : 0).append(",");
            csv.append(activeProjects).append(",");
            csv.append(Boolean.TRUE.equals(emp.getIsActive()) ? "Active" : "Inactive").append("\n");
        }

        // Footer summary
        csv.append("\n");
        csv.append("Manager,").append(escapeCsv(manager.getFullName())).append("\n");
        csv.append("Total Direct Reports,").append(directReports.size()).append("\n");
        csv.append("Report Generated,").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .append("\n");

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
