package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.AllocationStatus;
import com.kpmg.employee360.exception.DuplicateResourceException;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.repository.EmployeeSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

        private final EmployeeRepository employeeRepository;
        private final DesignationRepository designationRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final PerformanceReviewRepository performanceReviewRepository;
        private final AllocationRequestRepository allocationRequestRepository;
        private final PermissionService permissionService;

        @Transactional
        public CurrentUserResponse getCurrentUser() {
                Long currentUserId = CurrentUserContext.getCurrentUserId();
                if (currentUserId == null) {
                        currentUserId = 1L; // Fallback for safety in simulation
                }
                Employee emp = findEmployeeById(currentUserId);

                Set<String> permissions = permissionService.getPermissions(emp).stream()
                                .map(Enum::name)
                                .collect(Collectors.toSet());

                return CurrentUserResponse.builder()
                                .profile(toEmployeeResponse(emp))
                                .permissions(permissions)
                                .build();
        }

        @Transactional
        public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
                if (employeeRepository.findByEmpCode(request.getEmpCode()).isPresent()) {
                        throw new DuplicateResourceException(
                                        "Employee with code " + request.getEmpCode() + " already exists");
                }
                if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new DuplicateResourceException(
                                        "Employee with email " + request.getEmail() + " already exists");
                }

                Designation designation = designationRepository.findById(request.getDesignationId())
                                .orElseThrow(() -> new ResourceNotFoundException("Designation", "id",
                                                String.valueOf(request.getDesignationId())));

                Employee employee = Employee.builder()
                                .empCode(request.getEmpCode())
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .designation(designation)
                                .department(request.getDepartment())
                                .location(request.getLocation())
                                .dateOfJoining(request.getDateOfJoining())
                                .isActive(true)
                                .build();

                if (request.getReportingManagerId() != null) {
                        employee.setReportingManager(findEmployeeById(request.getReportingManagerId()));
                }
                if (request.getPerformanceManagerId() != null) {
                        employee.setPerformanceManager(findEmployeeById(request.getPerformanceManagerId()));
                }

                return toEmployeeResponse(employeeRepository.save(employee));
        }

        @Transactional
        public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
                Employee employee = findEmployeeById(id);

                if (request.getFirstName() != null)
                        employee.setFirstName(request.getFirstName());
                if (request.getLastName() != null)
                        employee.setLastName(request.getLastName());
                if (request.getEmail() != null)
                        employee.setEmail(request.getEmail());
                if (request.getPhone() != null)
                        employee.setPhone(request.getPhone());
                if (request.getDepartment() != null)
                        employee.setDepartment(request.getDepartment());
                if (request.getLocation() != null)
                        employee.setLocation(request.getLocation());
                if (request.getIsActive() != null)
                        employee.setIsActive(request.getIsActive());

                if (request.getDesignationId() != null) {
                        Designation designation = designationRepository.findById(request.getDesignationId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Designation", "id",
                                                        String.valueOf(request.getDesignationId())));
                        employee.setDesignation(designation);
                }

                if (request.getReportingManagerId() != null) {
                        employee.setReportingManager(findEmployeeById(request.getReportingManagerId()));
                }
                if (request.getPerformanceManagerId() != null) {
                        employee.setPerformanceManager(findEmployeeById(request.getPerformanceManagerId()));
                }

                return toEmployeeResponse(employeeRepository.save(employee));
        }

        @Transactional
        public void deactivateEmployee(Long id) {
                Employee employee = findEmployeeById(id);
                employee.setIsActive(false);
                employeeRepository.save(employee);
        }

        @Transactional
        public EmployeeResponse updateReportingManager(Long id, Long managerId) {
                Employee employee = findEmployeeById(id);
                Employee manager = findEmployeeById(managerId);
                employee.setReportingManager(manager);
                return toEmployeeResponse(employeeRepository.save(employee));
        }

        @Transactional
        public EmployeeResponse updatePerformanceManager(Long id, Long managerId) {
                Employee employee = findEmployeeById(id);
                Employee manager = findEmployeeById(managerId);
                employee.setPerformanceManager(manager);
                return toEmployeeResponse(employeeRepository.save(employee));
        }

        public EmployeeDetailResponse getEmployeeDetail(@NonNull Long id) {
                Employee emp = findEmployeeById(id);
                return buildEmployeeDetail(emp);
        }

        @Transactional
        public EmployeeDetailResponse getLimitedEmployeeDetail(@NonNull Long id) {
                Employee emp = findEmployeeById(id);
                return buildLimitedEmployeeDetail(emp);
        }

        public EmployeeDetailResponse getEmployeeByEmpCode(String empCode) {
                Employee emp = employeeRepository.findByEmpCode(empCode)
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "empCode", empCode));
                return buildEmployeeDetail(emp);
        }

        public List<EmployeeSlimDTO> searchEmployees(String query, boolean fullSearch) {
                return employeeRepository.searchByQuery(query).stream()
                                .map(e -> fullSearch ? toSlimDTO(e) : toBasicSlimDTO(e))
                                .collect(Collectors.toList());
        }

        public Page<EmployeeResponse> filterEmployees(String query, Integer level, String dept, String loc,
                        Boolean active,
                        Long managerId, Pageable pageable) {
                Specification<Employee> spec = Specification.where(EmployeeSpecification.nameOrCodeContains(query))
                                .and(EmployeeSpecification.hasDesignationLevel(level))
                                .and(EmployeeSpecification.hasDepartment(dept))
                                .and(EmployeeSpecification.hasLocation(loc))
                                .and(EmployeeSpecification.isActive(active))
                                .and(EmployeeSpecification.reportsTo(managerId));

                return employeeRepository.findAll(spec, pageable).map(this::toEmployeeResponse);
        }

        public Page<EmployeeAvailabilityDTO> searchAvailableEmployees(String query, String department, String location,
                        Integer minAvailable, Pageable pageable) {
                Specification<Employee> spec = Specification.where(EmployeeSpecification.isActive(true));

                if (query != null && !query.trim().isEmpty()) {
                        spec = spec.and(EmployeeSpecification.nameOrCodeContains(query));
                }
                if (department != null && !department.trim().isEmpty()) {
                        spec = spec.and(EmployeeSpecification.hasDepartment(department));
                }
                if (location != null && !location.trim().isEmpty()) {
                        spec = spec.and(EmployeeSpecification.hasLocation(location));
                }

                List<Employee> allEmployees = employeeRepository.findAll(spec);

                List<EmployeeAvailabilityDTO> dtos = allEmployees.stream().map(emp -> {
                        Long id = emp.getId();
                        Integer totalAlloc = teamMemberRepository.getTotalAllocationByEmployeeId(id);
                        int alloc = totalAlloc != null ? totalAlloc : 0;
                        int available = Math.max(0, 100 - alloc);

                        String status = "Available";
                        if (alloc >= 100)
                                status = "Fully Allocated";
                        else if (alloc > 0)
                                status = "Partially Available";

                        List<CurrentAssignmentDTO> assignments = teamMemberRepository
                                        .findByEmployee_IdAndStatus(id, AllocationStatus.ACTIVE)
                                        .stream().map(tm -> CurrentAssignmentDTO.builder()
                                                        .projectName(tm.getTeam().getProject().getName())
                                                        .teamName(tm.getTeam().getName())
                                                        .roleInTeam(tm.getRoleInTeam())
                                                        .allocationPercentage(tm.getAllocationPercentage())
                                                        .build())
                                        .collect(Collectors.toList());

                        Double avgRating = performanceReviewRepository.getAverageRatingByEmployeeId(id);
                        var latestReview = performanceReviewRepository.findFirstByEmployee_IdOrderByReviewDateDesc(id);

                        boolean hasPending = allocationRequestRepository.findByEmployee_Id(id).stream()
                                        .anyMatch(r -> com.kpmg.employee360.enums.AllocationRequestStatus.PENDING
                                                        .equals(r.getStatus()));

                        return EmployeeAvailabilityDTO.builder()
                                        .id(id)
                                        .empCode(emp.getEmpCode())
                                        .fullName(emp.getFullName())
                                        .email(emp.getEmail())
                                        .designation(emp.getDesignation() != null
                                                        ? emp.getDesignation().getDisplayName()
                                                        : null)
                                        .designationLevel(emp.getDesignation() != null ? emp.getDesignation().getLevel()
                                                        : null)
                                        .department(emp.getDepartment())
                                        .location(emp.getLocation())
                                        .profilePicUrl(emp.getProfilePicUrl())
                                        .totalAllocation(alloc)
                                        .availableAllocation(available)
                                        .allocationStatus(status)
                                        .currentAssignments(assignments)
                                        .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                                        .latestRating(latestReview.map(PerformanceReview::getRating).orElse(null))
                                        .hasPendingRequest(hasPending)
                                        .build();
                }).filter(dto -> minAvailable == null || dto.getAvailableAllocation() >= minAvailable)
                                .sorted((a, b) -> Integer.compare(b.getAvailableAllocation(),
                                                a.getAvailableAllocation()))
                                .collect(Collectors.toList());

                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), dtos.size());
                List<EmployeeAvailabilityDTO> pageContent;
                if (start > dtos.size()) {
                        pageContent = new ArrayList<>();
                } else {
                        pageContent = dtos.subList(start, end);
                }
                return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, dtos.size());
        }

        public List<EmployeeSlimDTO> getEmployeesOnBench() {
                return employeeRepository.findAll().stream()
                                .filter(e -> {
                                        Integer totalAlloc = teamMemberRepository
                                                        .getTotalAllocationByEmployeeId(e.getId());
                                        return totalAlloc == null || totalAlloc == 0;
                                })
                                .map(this::toSlimDTO)
                                .collect(Collectors.toList());
        }

        public List<EmployeeSlimDTO> getTopPerformers(int limit) {
                return employeeRepository.findAll().stream()
                                .map(e -> {
                                        Double avg = performanceReviewRepository
                                                        .getAverageRatingByEmployeeId(e.getId());
                                        return new Object[] { e, avg != null ? avg : 0.0 };
                                })
                                .sorted((a, b) -> Double.compare((Double) b[1], (Double) a[1]))
                                .limit(limit)
                                .map(arr -> toSlimDTO((Employee) arr[0]))
                                .collect(Collectors.toList());
        }

        public EmployeeSlimDTO toBasicSlimDTO(Employee e) {
                return EmployeeSlimDTO.builder()
                                .id(e.getId())
                                .fullName(e.getFullName())
                                .designationName(e.getDesignation() != null ? e.getDesignation().getName() : null)
                                .designationLevel(e.getDesignation() != null ? e.getDesignation().getLevel() : null)
                                .email(e.getEmail())
                                .department(e.getDepartment())
                                .profilePicUrl(null) // Restricted
                                .empCode(null) // Restricted
                                .build();
        }

        @Transactional
        public EmployeeDetailResponse buildLimitedEmployeeDetail(Employee emp) {
                return EmployeeDetailResponse.builder()
                                .id(emp.getId())
                                .empCode(emp.getEmpCode())
                                .firstName(emp.getFirstName())
                                .lastName(emp.getLastName())
                                .fullName(emp.getFullName())
                                .email(emp.getEmail())
                                .phone(emp.getPhone())
                                .designationName(emp.getDesignation() != null ? emp.getDesignation().getName() : null)
                                .designationLevel(emp.getDesignation() != null ? emp.getDesignation().getLevel() : null)
                                .dashboardType(emp.getDesignation() != null ? emp.getDesignation().getDashboardType()
                                                : null)
                                .department(emp.getDepartment())
                                .location(emp.getLocation())
                                .dateOfJoining(emp.getDateOfJoining())
                                .profilePicUrl(emp.getProfilePicUrl())
                                .isActive(emp.getIsActive())
                                .reportingManagerId(
                                                emp.getReportingManager() != null ? emp.getReportingManager().getId()
                                                                : null)
                                .reportingManagerName(emp.getReportingManager() != null
                                                ? emp.getReportingManager().getFullName()
                                                : null)
                                .performanceManagerId(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getId()
                                                : null)
                                .performanceManagerName(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getFullName()
                                                : null)
                                .currentTeams(null) // Hidden
                                .totalAllocationPercentage(null) // Hidden
                                .directReports(null) // Hidden
                                .teammates(null) // Hidden
                                .performanceSummary(null) // Hidden
                                .build();
        }

        public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
                return employeeRepository.findByIsActiveTrue(pageable)
                                .map(this::toEmployeeResponse);
        }

        public List<EmployeeSlimDTO> getDirectReports(@NonNull Long managerId) {
                return employeeRepository.findByReportingManager_Id(managerId).stream()
                                .map(this::toSlimDTO)
                                .collect(Collectors.toList());
        }

        public List<EmployeeSlimDTO> getTeammates(@NonNull Long employeeId) {
                return teamMemberRepository.findTeammatesByEmployeeId(employeeId).stream()
                                .map(tm -> toSlimDTO(tm.getEmployee()))
                                .collect(Collectors.toList());
        }

        public OrgHierarchyDTO getOrgHierarchy(@NonNull Long employeeId) {
                Employee emp = findEmployeeById(employeeId);

                // Build upward chain
                List<OrgHierarchyDTO> upwardChain = new ArrayList<>();
                Employee current = emp.getReportingManager();
                while (current != null) {
                        upwardChain.add(OrgHierarchyDTO.builder()
                                        .employee(toSlimDTO(current))
                                        .build());
                        current = current.getReportingManager();
                }

                List<EmployeeSlimDTO> directReports = employeeRepository.findByReportingManager_Id(employeeId)
                                .stream().map(this::toSlimDTO).collect(Collectors.toList());

                return OrgHierarchyDTO.builder()
                                .employee(toSlimDTO(emp))
                                .reportingManager(
                                                emp.getReportingManager() != null ? toSlimDTO(emp.getReportingManager())
                                                                : null)
                                .performanceManager(emp.getPerformanceManager() != null
                                                ? toSlimDTO(emp.getPerformanceManager())
                                                : null)
                                .directReports(directReports)
                                .upwardChain(upwardChain)
                                .build();
        }

        public List<EmployeeSlimDTO> getEmployeesByDesignation(Integer level) {
                return employeeRepository.findByDesignation_Level(level).stream()
                                .map(this::toSlimDTO)
                                .collect(Collectors.toList());
        }

        // ============ PRIVATE HELPERS ============

        public Employee findEmployeeById(@NonNull Long id) {
                return employeeRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", String.valueOf(id)));
        }

        private EmployeeDetailResponse buildEmployeeDetail(Employee emp) {
                // Current teams
                List<TeamMember> activeAssignments = teamMemberRepository
                                .findByEmployee_IdAndStatus(emp.getId(), AllocationStatus.ACTIVE);

                List<TeamAssignmentDTO> teamAssignments = activeAssignments.stream()
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

                Integer totalAllocation = teamMemberRepository.getTotalAllocationByEmployeeId(emp.getId());

                // Direct reports
                List<EmployeeSlimDTO> directReports = employeeRepository.findByReportingManager_Id(emp.getId())
                                .stream().map(this::toSlimDTO).collect(Collectors.toList());

                // Teammates
                List<EmployeeSlimDTO> teammates = teamMemberRepository.findTeammatesByEmployeeId(emp.getId())
                                .stream().map(tm -> toSlimDTO(tm.getEmployee()))
                                .distinct().collect(Collectors.toList());

                // Performance summary
                PerformanceSummaryDTO perfSummary = buildPerformanceSummary(emp.getId());

                return EmployeeDetailResponse.builder()
                                .id(emp.getId())
                                .empCode(emp.getEmpCode())
                                .firstName(emp.getFirstName())
                                .lastName(emp.getLastName())
                                .fullName(emp.getFullName())
                                .email(emp.getEmail())
                                .phone(emp.getPhone())
                                .designationName(emp.getDesignation().getDisplayName())
                                .designationLevel(emp.getDesignation().getLevel())
                                .dashboardType(emp.getDesignation().getDashboardType())
                                .department(emp.getDepartment())
                                .location(emp.getLocation())
                                .dateOfJoining(emp.getDateOfJoining())
                                .profilePicUrl(emp.getProfilePicUrl())
                                .isActive(emp.getIsActive())
                                .reportingManagerId(
                                                emp.getReportingManager() != null ? emp.getReportingManager().getId()
                                                                : null)
                                .reportingManagerName(emp.getReportingManager() != null
                                                ? emp.getReportingManager().getFullName()
                                                : null)
                                .reportingManagerDesignation(emp.getReportingManager() != null
                                                ? emp.getReportingManager().getDesignation().getDisplayName()
                                                : null)
                                .performanceManagerId(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getId()
                                                : null)
                                .performanceManagerName(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getFullName()
                                                : null)
                                .performanceManagerDesignation(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getDesignation().getDisplayName()
                                                : null)
                                .currentTeams(teamAssignments)
                                .totalAllocationPercentage(totalAllocation != null ? totalAllocation : 0)
                                .directReports(directReports)
                                .teammates(teammates)
                                .performanceSummary(perfSummary)
                                .build();
        }

        private PerformanceSummaryDTO buildPerformanceSummary(Long employeeId) {
                var latestReview = performanceReviewRepository.findFirstByEmployee_IdOrderByReviewDateDesc(employeeId);
                Double avgRating = performanceReviewRepository.getAverageRatingByEmployeeId(employeeId);
                int totalReviews = performanceReviewRepository.findByEmployee_Id(employeeId).size();

                return PerformanceSummaryDTO.builder()
                                .latestRating(latestReview.map(PerformanceReview::getRating).orElse(null))
                                .averageRating(avgRating)
                                .totalReviews(totalReviews)
                                .lastReviewCycle(latestReview.map(PerformanceReview::getReviewCycle).orElse(null))
                                .lastReviewDate(latestReview.map(PerformanceReview::getReviewDate).orElse(null))
                                .build();
        }

        public EmployeeResponse toEmployeeResponse(Employee emp) {
                return EmployeeResponse.builder()
                                .id(emp.getId())
                                .empCode(emp.getEmpCode())
                                .firstName(emp.getFirstName())
                                .lastName(emp.getLastName())
                                .fullName(emp.getFullName())
                                .email(emp.getEmail())
                                .phone(emp.getPhone())
                                .designationName(emp.getDesignation().getDisplayName())
                                .designationLevel(emp.getDesignation().getLevel())
                                .dashboardType(emp.getDesignation().getDashboardType())
                                .department(emp.getDepartment())
                                .location(emp.getLocation())
                                .dateOfJoining(emp.getDateOfJoining())
                                .profilePicUrl(emp.getProfilePicUrl())
                                .isActive(emp.getIsActive())
                                .reportingManagerId(
                                                emp.getReportingManager() != null ? emp.getReportingManager().getId()
                                                                : null)
                                .reportingManagerName(emp.getReportingManager() != null
                                                ? emp.getReportingManager().getFullName()
                                                : null)
                                .performanceManagerId(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getId()
                                                : null)
                                .performanceManagerName(emp.getPerformanceManager() != null
                                                ? emp.getPerformanceManager().getFullName()
                                                : null)
                                .totalAllocation(teamMemberRepository.getTotalAllocationByEmployeeId(emp.getId()))
                                .build();
        }

        public EmployeeSlimDTO toSlimDTO(Employee emp) {
                return EmployeeSlimDTO.builder()
                                .id(emp.getId())
                                .empCode(emp.getEmpCode())
                                .fullName(emp.getFullName())
                                .email(emp.getEmail())
                                .designationName(emp.getDesignation() != null ? emp.getDesignation().getDisplayName()
                                                : "N/A")
                                .designationLevel(emp.getDesignation() != null ? emp.getDesignation().getLevel() : 0)
                                .profilePicUrl(emp.getProfilePicUrl())
                                .department(emp.getDepartment())
                                .build();
        }
}
