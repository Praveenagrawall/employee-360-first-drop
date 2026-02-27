package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.AllocationStatus;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.enums.ProjectStatus;
import com.kpmg.employee360.enums.ProjectType;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PermissionService permissionService;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        Employee manager = employeeRepository.findById(request.getEngagementManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                        String.valueOf(request.getEngagementManagerId())));

        Project project = Project.builder()
                .projectCode(request.getProjectCode())
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .clientName(request.getClientName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .engagementManager(manager)
                .build();

        return toProjectResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", String.valueOf(id)));

        if (request.getName() != null)
            project.setName(request.getName());
        if (request.getDescription() != null)
            project.setDescription(request.getDescription());
        if (request.getStatus() != null)
            project.setStatus(request.getStatus());
        if (request.getClientName() != null)
            project.setClientName(request.getClientName());
        if (request.getEndDate() != null)
            project.setEndDate(request.getEndDate());

        if (request.getEngagementManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getEngagementManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                            String.valueOf(request.getEngagementManagerId())));
            project.setEngagementManager(manager);
        }

        return toProjectResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProjectStatus(Long id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", String.valueOf(id)));
        project.setStatus(status);
        return toProjectResponse(projectRepository.save(project));
    }

    public ProjectDetailResponse getProjectDetail(@NonNull Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", String.valueOf(id)));

        List<Team> teams = teamRepository.findByProject_Id(id);
        List<TeamResponse> teamResponses = teams.stream().map(team -> {
            List<TeamMember> members = teamMemberRepository.findByTeam_Id(team.getId());
            List<TeamMemberDTO> memberDTOs = members.stream()
                    .map(this::toTeamMemberDTO)
                    .collect(Collectors.toList());

            return TeamResponse.builder()
                    .id(team.getId())
                    .name(team.getName())
                    .teamLeadName(team.getTeamLead() != null ? team.getTeamLead().getFullName() : null)
                    .teamLeadId(team.getTeamLead() != null ? team.getTeamLead().getId() : null)
                    .projectName(project.getName())
                    .projectId(project.getId())
                    .memberCount(members.size())
                    .members(memberDTOs)
                    .build();
        }).collect(Collectors.toList());

        return ProjectDetailResponse.builder()
                .id(project.getId())
                .projectCode(project.getProjectCode())
                .name(project.getName())
                .description(project.getDescription())
                .type(project.getType())
                .status(project.getStatus())
                .clientName(project.getClientName())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .engagementManagerName(project.getEngagementManager().getFullName())
                .engagementManagerId(project.getEngagementManager().getId())
                .teams(teamResponses)
                .build();
    }

    public Page<ProjectResponse> getAllProjects(ProjectType type, ProjectStatus status, Pageable pageable) {
        if (type != null && status != null) {
            return projectRepository.findByTypeAndStatus(type, status, pageable).map(this::toProjectResponse);
        } else if (type != null) {
            return projectRepository.findByType(type, pageable).map(this::toProjectResponse);
        } else if (status != null) {
            return projectRepository.findByStatus(status, pageable).map(this::toProjectResponse);
        }
        return projectRepository.findAll(pageable).map(this::toProjectResponse);
    }

    public Page<ProjectResponse> getFilteredProjects(Long employeeId, Pageable pageable) {
        if (permissionService.hasPermission(employeeId, Permission.VIEW_ALL_PROJECTS)) {
            return projectRepository.findAll(pageable).map(this::toProjectResponse);
        } else if (permissionService.hasPermission(employeeId, Permission.VIEW_TEAM_PROJECTS)) {
            return projectRepository.findByEngagementManagerOrMember(employeeId, pageable).map(this::toProjectResponse);
        } else if (permissionService.hasPermission(employeeId, Permission.VIEW_OWN_PROJECTS)) {
            return projectRepository.findByMember(employeeId, pageable).map(this::toProjectResponse);
        }
        return Page.empty(pageable);
    }

    public List<ProjectResponse> getProjectsByEmployee(Long employeeId) {
        List<TeamMember> memberships = teamMemberRepository.findByEmployee_IdAndStatus(employeeId,
                AllocationStatus.ACTIVE);
        return memberships.stream()
                .map(tm -> toProjectResponse(tm.getTeam().getProject()))
                .distinct()
                .collect(Collectors.toList());
    }

    private ProjectResponse toProjectResponse(Project project) {
        List<Team> teams = teamRepository.findByProject_Id(project.getId());
        int memberCount = teams.stream()
                .mapToInt(t -> teamMemberRepository.findByTeam_Id(t.getId()).size())
                .sum();

        return ProjectResponse.builder()
                .id(project.getId())
                .projectCode(project.getProjectCode())
                .name(project.getName())
                .description(project.getDescription())
                .type(project.getType())
                .status(project.getStatus())
                .clientName(project.getClientName())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .engagementManagerName(project.getEngagementManager().getFullName())
                .engagementManagerId(project.getEngagementManager().getId())
                .teamCount(teams.size())
                .memberCount(memberCount)
                .build();
    }

    private TeamMemberDTO toTeamMemberDTO(TeamMember tm) {
        return TeamMemberDTO.builder()
                .id(tm.getId())
                .employeeName(tm.getEmployee().getFullName())
                .employeeId(tm.getEmployee().getId())
                .empCode(tm.getEmployee().getEmpCode())
                .designation(
                        tm.getEmployee().getDesignation() != null ? tm.getEmployee().getDesignation().getDisplayName()
                                : "N/A")
                .roleInTeam(tm.getRoleInTeam())
                .allocationPercentage(tm.getAllocationPercentage())
                .status(tm.getStatus())
                .profilePicUrl(tm.getEmployee().getProfilePicUrl())
                .build();
    }
}
