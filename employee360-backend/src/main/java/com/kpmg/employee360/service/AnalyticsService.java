package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.entity.Project;
import com.kpmg.employee360.enums.ProjectStatus;
import com.kpmg.employee360.repository.EmployeeRepository;
import com.kpmg.employee360.repository.PerformanceReviewRepository;
import com.kpmg.employee360.repository.ProjectRepository;
import com.kpmg.employee360.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

        private final EmployeeRepository employeeRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final PerformanceReviewRepository performanceReviewRepository;
        private final ProjectRepository projectRepository;
        private final EmployeeService employeeService;

        public HeadcountDTO getHeadcount() {
                List<Employee> allEmployees = employeeRepository.findAll();

                long active = allEmployees.stream().filter(Employee::getIsActive).count();
                long inactive = allEmployees.size() - active;

                Map<String, Integer> byDesignation = allEmployees.stream()
                                .filter(Employee::getIsActive)
                                .collect(Collectors.groupingBy(e -> e.getDesignation().getDisplayName(),
                                                Collectors.summingInt(e -> 1)));

                Map<String, Integer> byDepartment = allEmployees.stream()
                                .filter(Employee::getIsActive)
                                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.summingInt(e -> 1)));

                Map<String, Integer> byLocation = allEmployees.stream()
                                .filter(Employee::getIsActive)
                                .collect(Collectors.groupingBy(
                                                e -> e.getLocation() != null ? e.getLocation() : "Unknown",
                                                Collectors.summingInt(e -> 1)));

                return HeadcountDTO.builder()
                                .totalActive((int) active)
                                .totalInactive((int) inactive)
                                .byDesignation(byDesignation)
                                .byDepartment(byDepartment)
                                .byLocation(byLocation)
                                .build();
        }

        public UtilizationDTO getUtilization() {
                List<Employee> activeEmployees = employeeRepository.findByIsActiveTrue();
                int totalEmployees = activeEmployees.size();

                if (totalEmployees == 0) {
                        return UtilizationDTO.builder().build();
                }

                int fully = 0;
                int partial = 0;
                int bench = 0;
                double totalUtilization = 0;
                List<EmployeeSlimDTO> benchEmployees = new ArrayList<>();
                List<EmployeeSlimDTO> overAllocated = new ArrayList<>();

                for (Employee e : activeEmployees) {
                        Integer alloc = teamMemberRepository.getTotalAllocationByEmployeeId(e.getId());
                        int allocVal = alloc != null ? alloc : 0;
                        totalUtilization += allocVal;

                        if (allocVal >= 100) {
                                fully++;
                                if (allocVal > 100) {
                                        overAllocated.add(employeeService.toSlimDTO(e));
                                }
                        } else if (allocVal > 0) {
                                partial++;
                        } else {
                                bench++;
                                benchEmployees.add(employeeService.toSlimDTO(e));
                        }
                }

                return UtilizationDTO.builder()
                                .averageUtilization(Math.round((totalUtilization / totalEmployees) * 10.0) / 10.0)
                                .fullyAllocated(fully)
                                .partiallyAllocated(partial)
                                .onBench(bench)
                                .benchEmployees(benchEmployees)
                                .overAllocated(overAllocated)
                                .build();
        }

        public PerformanceOverviewDTO getPerformanceOverview() {
                var allReviews = performanceReviewRepository.findAll();
                if (allReviews.isEmpty()) {
                        return PerformanceOverviewDTO.builder().build();
                }

                double avgRating = allReviews.stream()
                                .mapToDouble(r -> r.getRating() != null ? r.getRating() : 0)
                                .average().orElse(0.0);

                Map<Integer, Integer> distribution = allReviews.stream()
                                .filter(r -> r.getRating() != null)
                                .collect(Collectors.groupingBy(r -> r.getRating(), Collectors.summingInt(r -> 1)));

                // Performance by department - needs to join with Employee
                Map<String, Double> byDept = employeeRepository.findByIsActiveTrue().stream()
                                .collect(Collectors.groupingBy(
                                                Employee::getDepartment,
                                                Collectors.averagingDouble(e -> {
                                                        Double avg = performanceReviewRepository
                                                                        .getAverageRatingByEmployeeId(e.getId());
                                                        return avg != null ? avg : 0.0;
                                                })));

                List<EmployeeSlimDTO> topPerformers = employeeService.getTopPerformers(10);

                long completed = allReviews.stream()
                                .filter(r -> r.getStatus() != null && r.getStatus().name().equals("COMPLETED")).count();
                long pending = allReviews.size() - completed;

                return PerformanceOverviewDTO.builder()
                                .organizationAverageRating(Math.round(avgRating * 10.0) / 10.0)
                                .ratingDistribution(distribution)
                                .averageByDepartment(byDept)
                                .topPerformers(topPerformers)
                                .completedReviewsCount((int) completed)
                                .pendingReviewsCount((int) pending)
                                .build();
        }

        public ProjectOverviewDTO getProjectOverview() {
                List<Project> allProjects = projectRepository.findAll();

                Map<String, Integer> byType = allProjects.stream()
                                .collect(Collectors.groupingBy(p -> p.getType().name(), Collectors.summingInt(p -> 1)));

                int active = (int) allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
                int completed = (int) allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                                .count();
                int onHold = (int) allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.ON_HOLD).count();
                int pipeline = (int) allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.PIPELINE).count();

                LocalDate now = LocalDate.now();
                List<ProjectResponse> atRisk = allProjects.stream()
                                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE && p.getEndDate() != null
                                                && p.getEndDate().isBefore(now))
                                .map(this::toProjectResponse)
                                .collect(Collectors.toList());

                return ProjectOverviewDTO.builder()
                                .totalProjects(allProjects.size())
                                .activeProjects(active)
                                .completedProjects(completed)
                                .onHoldProjects(onHold)
                                .pipelineProjects(pipeline)
                                .byType(byType)
                                .atRiskProjects(atRisk)
                                .build();
        }

        public LeadershipAnalyticsDTO getOrgOverview() {
                HeadcountDTO headcount = getHeadcount();
                UtilizationDTO utilization = getUtilization();
                PerformanceOverviewDTO performance = getPerformanceOverview();

                List<HeadcountByDesignationDTO> headcountByDesignation = headcount.getByDesignation().entrySet()
                                .stream()
                                .map(e -> HeadcountByDesignationDTO.builder()
                                                .designation(e.getKey())
                                                .count(e.getValue())
                                                .build())
                                .collect(Collectors.toList());

                return LeadershipAnalyticsDTO.builder()
                                .headcountByDesignation(headcountByDesignation)
                                .utilizationStats(UtilizationStatsDTO.builder()
                                                .allocated(utilization.getFullyAllocated())
                                                .partial(utilization.getPartiallyAllocated())
                                                .bench(utilization.getOnBench())
                                                .build())
                                .topPerformers(performance.getTopPerformers().stream()
                                                .map(emp -> TopPerformerDTO.builder()
                                                                .employee(emp)
                                                                .averageRating(performanceReviewRepository
                                                                                .getAverageRatingByEmployeeId(
                                                                                                emp.getId()))
                                                                .build())
                                                .collect(Collectors.toList()))
                                .benchEmployees(utilization.getBenchEmployees())
                                .build();
        }

        private ProjectResponse toProjectResponse(Project p) {
                return ProjectResponse.builder()
                                .id(p.getId())
                                .projectCode(p.getProjectCode())
                                .name(p.getName())
                                .type(p.getType())
                                .status(p.getStatus())
                                .clientName(p.getClientName())
                                .startDate(p.getStartDate())
                                .endDate(p.getEndDate())
                                .engagementManagerName(p.getEngagementManager() != null
                                                ? p.getEngagementManager().getFullName()
                                                : null)
                                .engagementManagerId(p.getEngagementManager() != null ? p.getEngagementManager().getId()
                                                : null)
                                .build();
        }
}
