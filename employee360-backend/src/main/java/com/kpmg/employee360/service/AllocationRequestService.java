package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.AllocationRequestCreateDTO;
import com.kpmg.employee360.dto.response.ResponseDTOs.AllocationRequestResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.EmployeeSlimDTO;
import com.kpmg.employee360.entity.AllocationRequest;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.entity.Project;
import com.kpmg.employee360.entity.Team;
import com.kpmg.employee360.entity.TeamMember;
import com.kpmg.employee360.enums.AllocationRequestStatus;
import com.kpmg.employee360.enums.AllocationStatus;
import com.kpmg.employee360.enums.Permission;
import com.kpmg.employee360.exception.DuplicateResourceException;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.AllocationRequestRepository;
import com.kpmg.employee360.repository.EmployeeRepository;
import com.kpmg.employee360.repository.ProjectRepository;
import com.kpmg.employee360.repository.TeamMemberRepository;
import com.kpmg.employee360.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AllocationRequestService {

    private final AllocationRequestRepository allocationRequestRepo;
    private final EmployeeRepository employeeRepo;
    private final TeamRepository teamRepo;
    private final ProjectRepository projectRepo;
    private final TeamMemberRepository teamMemberRepo;
    private final PermissionService permissionService;
    private final NotificationService notificationService;

    @Transactional
    public AllocationRequestResponse createRequest(AllocationRequestCreateDTO requestDTO, Long requesterId) {
        if (!permissionService.hasPermission(requesterId, Permission.ASSIGN_TEAM_MEMBERS)) {
            throw new SecurityException("You do not have permission to request team members.");
        }

        Employee requester = employeeRepo.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Requester", "id", requesterId.toString()));

        Employee employee = employeeRepo.findById(requestDTO.getEmployeeId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Employee", "id", requestDTO.getEmployeeId().toString()));

        if (!Boolean.TRUE.equals(employee.getIsActive())) {
            throw new IllegalStateException("Cannot request allocation for an inactive employee.");
        }

        Team team = teamRepo.findById(requestDTO.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", requestDTO.getTeamId().toString()));

        Project project = projectRepo.findById(requestDTO.getProjectId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Project", "id", requestDTO.getProjectId().toString()));

        allocationRequestRepo
                .findByEmployee_IdAndTeam_IdAndStatus(employee.getId(), team.getId(), AllocationRequestStatus.PENDING)
                .ifPresent(ar -> {
                    throw new DuplicateResourceException(
                            "A pending request already exists for this employee on this team");
                });

        Integer currentAlloc = teamMemberRepo.getTotalAllocationByEmployeeId(employee.getId());
        int currentTotalAllocation = currentAlloc != null ? currentAlloc : 0;

        String warningMessage = null;
        if (currentTotalAllocation + requestDTO.getRequestedAllocation() > 100) {
            warningMessage = "Warning: Requested allocation will push employee over 100% total allocation.";
        }

        Employee approver = null;
        boolean autoApprove = false;

        if (currentTotalAllocation == 0) {
            autoApprove = true;
        } else if (employee.getReportingManager() != null
                && employee.getReportingManager().getId().equals(requesterId)) {
            autoApprove = true;
        } else if (requester.getDesignation() != null && requester.getDesignation().getLevel() >= 6) {
            autoApprove = true;
        } else {
            approver = employee.getReportingManager();
            if (approver != null && approver.getDesignation() != null && approver.getDesignation().getLevel() < 4) {
                Employee pm = employee.getPerformanceManager();
                if (pm != null) {
                    approver = pm;
                }
            }
            if (approver == null) {
                autoApprove = true;
            }
        }

        AllocationRequest request = AllocationRequest.builder()
                .employee(employee)
                .team(team)
                .project(project)
                .requester(requester)
                .approver(autoApprove ? requester : approver)
                .roleInTeam(requestDTO.getRoleInTeam() != null && !requestDTO.getRoleInTeam().isBlank()
                        ? requestDTO.getRoleInTeam()
                        : "Member")
                .requestedAllocation(requestDTO.getRequestedAllocation())
                .currentTotalAllocation(currentTotalAllocation)
                .proposedStartDate(requestDTO.getProposedStartDate() != null ? requestDTO.getProposedStartDate()
                        : java.time.LocalDate.now())
                .proposedEndDate(requestDTO.getProposedEndDate())
                .requestReason(requestDTO.getRequestReason() != null && !requestDTO.getRequestReason().isBlank()
                        ? requestDTO.getRequestReason()
                        : "Added to team")
                .status(autoApprove ? AllocationRequestStatus.AUTO_APPROVED : AllocationRequestStatus.PENDING)
                .resolvedAt(autoApprove ? LocalDateTime.now() : null)
                .build();

        AllocationRequest savedReq = allocationRequestRepo.save(request);

        if (autoApprove) {
            createTeamMember(savedReq);
            notificationService.createNotification(
                    employee.getId(),
                    "New Project Allocation",
                    "You have been added to " + project.getName() + " by " + requester.getFirstName() + " "
                            + requester.getLastName(),
                    "ALLOCATION_APPROVED",
                    savedReq.getId(),
                    "ALLOCATION_REQUEST");
        } else if (approver != null) {
            notificationService.createNotification(
                    approver.getId(),
                    "New Allocation Request",
                    "New allocation request from " + requester.getFirstName() + " " + requester.getLastName() + " for "
                            + employee.getFirstName() + " " + employee.getLastName() + " on " + project.getName(),
                    "ALLOCATION_REQUEST",
                    savedReq.getId(),
                    "ALLOCATION_REQUEST");
        }

        AllocationRequestResponse response = toResponse(savedReq);
        return response;
    }

    @Transactional
    public AllocationRequestResponse approveRequest(Long requestId, String comments, Long approverId) {
        AllocationRequest request = allocationRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationRequest", "id", requestId.toString()));

        if (request.getStatus() != AllocationRequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be approved.");
        }

        Employee approver = employeeRepo.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver", "id", approverId.toString()));

        boolean hasRights = false;
        if (request.getApprover() != null && request.getApprover().getId().equals(approverId)) {
            hasRights = true;
        } else if (approver.getDesignation() != null && approver.getDesignation().getLevel() >= 6) {
            hasRights = true;
        }

        if (!hasRights) {
            throw new SecurityException("You are not authorized to approve this request.");
        }

        request.setStatus(AllocationRequestStatus.APPROVED);
        request.setApproverComments(comments);
        request.setResolvedAt(LocalDateTime.now());

        createTeamMember(request);

        notificationService.createNotification(
                request.getRequester().getId(),
                "Allocation Request Approved",
                "Your request for " + request.getEmployee().getFirstName() + " " + request.getEmployee().getLastName()
                        + " on " + request.getProject().getName() + " was approved",
                "ALLOCATION_APPROVED",
                request.getId(),
                "ALLOCATION_REQUEST");

        notificationService.createNotification(
                request.getEmployee().getId(),
                "New Project Allocation",
                "You have been added to " + request.getProject().getName(),
                "ALLOCATION_APPROVED",
                request.getId(),
                "ALLOCATION_REQUEST");

        return toResponse(allocationRequestRepo.save(request));
    }

    @Transactional
    public AllocationRequestResponse rejectRequest(Long requestId, String reason, Long approverId) {
        AllocationRequest request = allocationRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationRequest", "id", requestId.toString()));

        if (request.getStatus() != AllocationRequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be rejected.");
        }

        Employee approver = employeeRepo.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver", "id", approverId.toString()));

        boolean hasRights = false;
        if (request.getApprover() != null && request.getApprover().getId().equals(approverId)) {
            hasRights = true;
        } else if (approver.getDesignation() != null && approver.getDesignation().getLevel() >= 6) {
            hasRights = true;
        }

        if (!hasRights) {
            throw new SecurityException("You are not authorized to reject this request.");
        }

        request.setStatus(AllocationRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setResolvedAt(LocalDateTime.now());

        notificationService.createNotification(
                request.getRequester().getId(),
                "Allocation Request Rejected",
                "Your request for " + request.getEmployee().getFirstName() + " " + request.getEmployee().getLastName()
                        + " on " + request.getProject().getName() + " was rejected. Reason: " + reason,
                "ALLOCATION_REJECTED",
                request.getId(),
                "ALLOCATION_REQUEST");

        return toResponse(allocationRequestRepo.save(request));
    }

    @Transactional
    public AllocationRequestResponse withdrawRequest(Long requestId, Long requesterId) {
        AllocationRequest request = allocationRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationRequest", "id", requestId.toString()));

        if (request.getStatus() != AllocationRequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be withdrawn.");
        }

        if (!request.getRequester().getId().equals(requesterId)) {
            throw new SecurityException("Only the requester can withdraw this request.");
        }

        request.setStatus(AllocationRequestStatus.WITHDRAWN);
        request.setResolvedAt(LocalDateTime.now());

        return toResponse(allocationRequestRepo.save(request));
    }

    public List<AllocationRequestResponse> getPendingRequestsForApprover(Long approverId) {
        return allocationRequestRepo
                .findByApprover_IdAndStatusOrderByCreatedAtDesc(approverId, AllocationRequestStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AllocationRequestResponse> getRequestsByRequester(Long requesterId) {
        return allocationRequestRepo.findByRequester_IdOrderByCreatedAtDesc(requesterId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AllocationRequestResponse> getRequestsForEmployee(Long employeeId) {
        return allocationRequestRepo.findByEmployee_Id(employeeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getPendingCount(Long approverId) {
        return allocationRequestRepo.countByApprover_IdAndStatus(approverId, AllocationRequestStatus.PENDING);
    }

    private void createTeamMember(AllocationRequest request) {
        TeamMember member = TeamMember.builder()
                .team(request.getTeam())
                .employee(request.getEmployee())
                .roleInTeam(request.getRoleInTeam())
                .allocationPercentage(request.getRequestedAllocation())
                .startDate(request.getProposedStartDate())
                .status(AllocationStatus.ACTIVE)
                .build();
        teamMemberRepo.save(member);
    }

    private AllocationRequestResponse toResponse(AllocationRequest req) {
        AllocationRequestResponse.AllocationRequestResponseBuilder builder = AllocationRequestResponse.builder()
                .id(req.getId())
                .employeeId(req.getEmployee().getId())
                .employeeName(req.getEmployee().getFirstName() + " " + req.getEmployee().getLastName())
                .employeeDesignation(
                        req.getEmployee().getDesignation() != null ? req.getEmployee().getDesignation().getDisplayName()
                                : null)
                .employeeDepartment(req.getEmployee().getDepartment())
                .employeeEmpCode(req.getEmployee().getEmpCode())
                .teamId(req.getTeam().getId())
                .teamName(req.getTeam().getName())
                .projectId(req.getProject().getId())
                .projectName(req.getProject().getName())
                .projectType(req.getProject().getType() != null ? req.getProject().getType().name() : null)
                .requesterId(req.getRequester().getId())
                .requesterName(req.getRequester().getFirstName() + " " + req.getRequester().getLastName())
                .requesterDesignation(req.getRequester().getDesignation() != null
                        ? req.getRequester().getDesignation().getDisplayName()
                        : null)
                .roleInTeam(req.getRoleInTeam())
                .requestedAllocation(req.getRequestedAllocation())
                .currentTotalAllocation(req.getCurrentTotalAllocation())
                .availableAllocation(100 - req.getCurrentTotalAllocation())
                .willExceedCapacity(req.getCurrentTotalAllocation() + req.getRequestedAllocation() > 100)
                .proposedStartDate(req.getProposedStartDate())
                .proposedEndDate(req.getProposedEndDate())
                .status(req.getStatus())
                .statusDisplayName(req.getStatus() != null ? req.getStatus().getDisplayName() : null)
                .requestReason(req.getRequestReason())
                .rejectionReason(req.getRejectionReason())
                .approverComments(req.getApproverComments())
                .createdAt(req.getCreatedAt())
                .resolvedAt(req.getResolvedAt());

        if (req.getApprover() != null) {
            builder.approverId(req.getApprover().getId())
                    .approverName(req.getApprover().getFirstName() + " " + req.getApprover().getLastName())
                    .approverDesignation(req.getApprover().getDesignation() != null
                            ? req.getApprover().getDesignation().getDisplayName()
                            : null);
        }

        return builder.build();
    }
}
