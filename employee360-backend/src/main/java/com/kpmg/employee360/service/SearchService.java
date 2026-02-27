package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

        private final EmployeeRepository employeeRepository;
        private final ProjectRepository projectRepository;
        private final EmployeeService employeeService;
        private final TeamRepository teamRepository;
        private final TeamMemberRepository teamMemberRepository;

        public SearchResultsDTO search(String query) {
                if (query == null || query.trim().length() < 2) {
                        return SearchResultsDTO.builder()
                                        .employees(List.of())
                                        .projects(List.of())
                                        .totalEmployeeResults(0)
                                        .totalProjectResults(0)
                                        .build();
                }

                // Search employees (capped at 5)
                List<EmployeeSlimDTO> employees = employeeRepository.searchByQuery(query.trim())
                                .stream()
                                .limit(5)
                                .map(employeeService::toSlimDTO)
                                .collect(Collectors.toList());

                // Search projects (capped at 5)
                List<ProjectResponse> projects = projectRepository.searchByQuery(query.trim())
                                .stream()
                                .limit(5)
                                .map(this::toProjectResponse)
                                .collect(Collectors.toList());

                return SearchResultsDTO.builder()
                                .employees(employees)
                                .projects(projects)
                                .totalEmployeeResults(employees.size())
                                .totalProjectResults(projects.size())
                                .build();
        }

        public SearchResultsDTO globalSearch(String query, String type, boolean fullSearch) {
                if (query == null || query.trim().isBlank()) {
                        return SearchResultsDTO.builder()
                                        .employees(List.of())
                                        .projects(List.of())
                                        .totalEmployeeResults(0)
                                        .totalProjectResults(0)
                                        .build();
                }

                String searchType = type != null ? type.toUpperCase() : "ALL";
                List<EmployeeSlimDTO> employees = List.of();
                List<ProjectResponse> projects = List.of();

                if (searchType.equals("ALL") || searchType.equals("EMPLOYEE")) {
                        employees = employeeRepository.searchByQuery(query.trim()).stream()
                                        .limit(10)
                                        .map(e -> fullSearch ? employeeService.toSlimDTO(e)
                                                        : employeeService.toBasicSlimDTO(e))
                                        .collect(Collectors.toList());
                }

                if (searchType.equals("ALL") || searchType.equals("PROJECT")) {
                        projects = projectRepository.searchByQuery(query.trim()).stream()
                                        .limit(5)
                                        .map(this::toProjectResponse)
                                        .collect(Collectors.toList());
                }

                return SearchResultsDTO.builder()
                                .employees(employees)
                                .projects(projects)
                                .totalEmployeeResults(employees.size())
                                .totalProjectResults(projects.size())
                                .build();
        }

        private ProjectResponse toProjectResponse(Project project) {
                var teams = teamRepository.findByProject_Id(project.getId());
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
                                .engagementManagerName(
                                                project.getEngagementManager() != null
                                                                ? project.getEngagementManager().getFullName()
                                                                : null)
                                .engagementManagerId(
                                                project.getEngagementManager() != null
                                                                ? project.getEngagementManager().getId()
                                                                : null)
                                .teamCount(teams.size())
                                .memberCount(memberCount)
                                .build();
        }
}
