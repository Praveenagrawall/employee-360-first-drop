package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.*;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

        private final EmployeeRepository employeeRepository;
        private final EmployeeService employeeService;
        private final PerformanceService performanceService;
        private final FeedbackService feedbackService;
        private final TeamMemberRepository teamMemberRepository;
        private final PerformanceReviewRepository performanceReviewRepository;
        private final ProjectRepository projectRepository;
        private final AllocationRequestService allocationRequestService;
        private final AllocationRequestRepository allocationRequestRepository;

        public DashboardResponse getDashboard(@NonNull Long id) {
                Employee emp = employeeRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                                                String.valueOf(id)));

                DashboardType type = emp.getDesignation().getDashboardType();
                DashboardResponse.DashboardResponseBuilder builder = DashboardResponse.builder()
                                .dashboardType(type)
                                .employee(employeeService.toSlimDTO(emp));

                switch (type) {
                        case INDIVIDUAL -> buildIndividualDashboard(builder, emp);
                        case MANAGER -> buildManagerDashboard(builder, emp);
                        case LEADERSHIP -> buildLeadershipDashboard(builder, emp);
                }

                return builder.build();
        }

        private void buildIndividualDashboard(DashboardResponse.DashboardResponseBuilder builder,
                        @NonNull Employee emp) {
                Long id = emp.getId();

                List<TeamMember> activeTeams = teamMemberRepository.findByEmployee_IdAndStatus(id,
                                AllocationStatus.ACTIVE);
                Integer totalAlloc = teamMemberRepository.getTotalAllocationByEmployeeId(id);
                PerformanceSummaryDTO perfSummary = performanceService.getPerformanceSummary(id);
                List<FeedbackResponse> feedbacks = feedbackService.getFeedbackForEmployee(id, null);

                List<TeamAssignmentDTO> teamAssignments = activeTeams.stream()
                                .map(tm -> TeamAssignmentDTO.builder()
                                                .teamId(tm.getTeam().getId())
                                                .teamName(tm.getTeam().getName())
                                                .projectId(tm.getTeam().getProject().getId())
                                                .projectName(tm.getTeam().getProject().getName())
                                                .projectType(tm.getTeam().getProject().getType())
                                                .clientName(tm.getTeam().getProject().getClientName())
                                                .roleInTeam(tm.getRoleInTeam())
                                                .allocationPercentage(tm.getAllocationPercentage())
                                                .teamLeadName(tm.getTeam().getTeamLead() != null
                                                                ? tm.getTeam().getTeamLead().getFullName()
                                                                : null)
                                                .build())
                                .collect(Collectors.toList());

                List<EmployeeSlimDTO> teammates = teamMemberRepository.findTeammatesByEmployeeId(id).stream()
                                .map(tm -> employeeService.toSlimDTO(tm.getEmployee()))
                                .distinct().collect(Collectors.toList());

                builder.currentProjectCount(activeTeams.size())
                                .totalAllocation(totalAlloc != null ? totalAlloc : 0)
                                .latestRating(perfSummary.getLatestRating())
                                .feedbackCount(feedbacks.size())
                                .myProjects(teamAssignments)
                                .myTeammates(teammates)
                                .recentReviews(performanceService.getReviewsByEmployee(id).stream().limit(5)
                                                .collect(Collectors.toList()))
                                .recentFeedback(feedbacks.stream().limit(3).collect(Collectors.toList()))
                                .allocationStatus(getAllocationStatus(id))
                                .currentGoals(performanceReviewRepository
                                                .findFirstByEmployee_IdOrderByReviewDateDesc(id)
                                                .map(PerformanceReview::getGoals)
                                                .orElse("No goals set for current cycle"));
        }

        private void buildManagerDashboard(DashboardResponse.DashboardResponseBuilder builder, @NonNull Employee emp) {
                Long id = emp.getId();

                List<Employee> reports = employeeRepository.findByReportingManager_Id(id);
                List<EmployeeSlimDTO> reportDTOs = reports.stream().map(employeeService::toSlimDTO)
                                .collect(Collectors.toList());

                Double avgRating = reports.stream()
                                .map(r -> performanceReviewRepository.getAverageRatingByEmployeeId(r.getId()))
                                .filter(r -> r != null)
                                .mapToDouble(Double::doubleValue)
                                .average().orElse(0.0);

                Double avgUtilization = reports.stream()
                                .map(r -> teamMemberRepository.getTotalAllocationByEmployeeId(r.getId()))
                                .filter(a -> a != null)
                                .mapToDouble(Integer::doubleValue)
                                .average().orElse(0.0);

                List<PerformanceReviewResponse> pending = performanceService.getPendingReviews(id);

                List<ProjectResponse> activeProjects = projectRepository.findByEngagementManager_Id(id).stream()
                                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE)
                                .map(p -> ProjectResponse.builder()
                                                .id(p.getId())
                                                .projectCode(p.getProjectCode())
                                                .name(p.getName())
                                                .type(p.getType())
                                                .status(p.getStatus())
                                                .clientName(p.getClientName())
                                                .startDate(p.getStartDate())
                                                .endDate(p.getEndDate())
                                                .engagementManagerName(emp.getFullName())
                                                .engagementManagerId(id)
                                                .build())
                                .collect(Collectors.toList());

                builder.directReportCount(reports.size())
                                .activeProjects(activeProjects)
                                .averageTeamRating(Math.round(avgRating * 10.0) / 10.0)
                                .pendingReviewCount(pending.size())
                                .teamUtilization(Math.round(avgUtilization * 10.0) / 10.0)
                                .directReports(reportDTOs)
                                .pendingReviews(pending)
                                .benchedReports(getBenchedEmployees(reports))
                                .reviewCompletionRate(calculateReviewCompletionRate(id));

                List<AllocationRequestResponse> pendingAllocations = allocationRequestService
                                .getPendingRequestsForApprover(id);
                builder.pendingAllocationRequestCount(pendingAllocations.size())
                                .pendingAllocationRequests(
                                                pendingAllocations.stream().limit(5).collect(Collectors.toList()));
        }

        private void buildLeadershipDashboard(DashboardResponse.DashboardResponseBuilder builder,
                        @NonNull Employee emp) {
                // Get all employees under this leader (recursive would be ideal, simplified
                // here)
                List<Employee> allEmployees = employeeRepository.findByIsActiveTrue();

                long clientProjects = projectRepository.findByType(ProjectType.CLIENT).stream()
                                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
                long proposals = projectRepository.findByType(ProjectType.PROPOSAL).size();
                long benchCount = allEmployees.stream()
                                .filter(e -> {
                                        Integer alloc = teamMemberRepository.getTotalAllocationByEmployeeId(e.getId());
                                        return alloc == null || alloc == 0;
                                }).count();

                List<Employee> directReports = employeeRepository.findByReportingManager_Id(emp.getId());

                builder.totalHeadcount(allEmployees.size())
                                .clientProjectCount((int) clientProjects)
                                .proposalCount((int) proposals)
                                .benchStrength((int) benchCount)
                                .directReportCount(directReports.size())
                                .directReports(directReports.stream().map(employeeService::toSlimDTO)
                                                .collect(Collectors.toList()))
                                .activeProjects(projectRepository.findByStatus(ProjectStatus.ACTIVE).stream()
                                                .map(p -> ProjectResponse.builder()
                                                                .id(p.getId()).name(p.getName()).type(p.getType())
                                                                .status(p.getStatus())
                                                                .clientName(p.getClientName())
                                                                .startDate(p.getStartDate())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .utilizationRate(calculateAverageUtilization(allEmployees))
                                .recentHires(employeeRepository.findAll().stream()
                                                .filter(e -> e.getDateOfJoining() != null && e.getDateOfJoining()
                                                                .isAfter(java.time.LocalDate.now().minusDays(90)))
                                                .map(employeeService::toSlimDTO).collect(Collectors.toList()))
                                .departmentBreakdown(allEmployees.stream()
                                                .collect(Collectors.groupingBy(Employee::getDepartment,
                                                                Collectors.summingInt(e -> 1))));

                long totalPendingOrgWide = allocationRequestRepository.countByStatus(AllocationRequestStatus.PENDING);
                builder.pendingAllocationRequestCount((int) totalPendingOrgWide);
        }

        private String getAllocationStatus(Long employeeId) {
                Integer alloc = teamMemberRepository.getTotalAllocationByEmployeeId(employeeId);
                int val = alloc != null ? alloc : 0;
                if (val == 0)
                        return "On Bench";
                if (val < 100)
                        return "Partially Allocated (" + val + "%)";
                if (val == 100)
                        return "Fully Allocated";
                return "Over Allocated (" + val + "%)";
        }

        private Double calculateAverageUtilization(List<Employee> employees) {
                if (employees.isEmpty())
                        return 0.0;
                double total = employees.stream()
                                .mapToDouble(e -> {
                                        Integer a = teamMemberRepository.getTotalAllocationByEmployeeId(e.getId());
                                        return a != null ? a : 0;
                                }).sum();
                return Math.round((total / employees.size()) * 10.0) / 10.0;
        }

        private List<EmployeeSlimDTO> getBenchedEmployees(List<Employee> employees) {
                return employees.stream()
                                .filter(e -> {
                                        Integer a = teamMemberRepository.getTotalAllocationByEmployeeId(e.getId());
                                        return a == null || a == 0;
                                })
                                .map(employeeService::toSlimDTO)
                                .collect(Collectors.toList());
        }

        private Double calculateReviewCompletionRate(Long reviewerId) {
                var allReviews = performanceReviewRepository.findAll().stream()
                                .filter(r -> r.getReviewer().getId().equals(reviewerId))
                                .collect(Collectors.toList());

                if (allReviews.isEmpty())
                        return 100.0;

                String latestCycle = allReviews.stream()
                                .map(PerformanceReview::getReviewCycle)
                                .max(String::compareTo).orElse(null);

                if (latestCycle == null)
                        return 100.0;

                long totalInCycle = allReviews.stream().filter(r -> r.getReviewCycle().equals(latestCycle)).count();
                long completedInCycle = allReviews.stream()
                                .filter(r -> r.getReviewCycle().equals(latestCycle)
                                                && r.getStatus() == ReviewStatus.COMPLETED)
                                .count();

                return Math.round((completedInCycle * 100.0 / totalInCycle) * 10.0) / 10.0;
        }
}
