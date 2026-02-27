package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.AllocationRequestActionDTO;
import com.kpmg.employee360.dto.request.RequestDTOs.AllocationRequestCreateDTO;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.AllocationRequestResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.AllocationRequestSummary;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.service.AllocationRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/allocation-requests")
@RequiredArgsConstructor
@Tag(name = "Allocation Requests", description = "Endpoints for managing employee team allocation requests")
@CrossOrigin
public class AllocationRequestController {

        private final AllocationRequestService allocationRequestService;

        @PostMapping
        @Operation(summary = "Create new allocation request")
        public ApiResponse<AllocationRequestResponse> createRequest(
                        @Valid @RequestBody AllocationRequestCreateDTO request) {
                return ApiResponse.success(
                                "Allocation request created successfully",
                                allocationRequestService.createRequest(request, CurrentUserContext.getCurrentUserId()));
        }

        @PutMapping("/{id}/approve")
        @Operation(summary = "Approve a pending request")
        public ApiResponse<AllocationRequestResponse> approveRequest(
                        @PathVariable Long id,
                        @RequestBody AllocationRequestActionDTO actionDTO) {
                return ApiResponse.success(
                                "Allocation request approved successfully",
                                allocationRequestService.approveRequest(id, actionDTO.getComments(),
                                                CurrentUserContext.getCurrentUserId()));
        }

        @PutMapping("/{id}/reject")
        @Operation(summary = "Reject a pending request")
        public ApiResponse<AllocationRequestResponse> rejectRequest(
                        @PathVariable Long id,
                        @RequestBody AllocationRequestActionDTO actionDTO) {
                return ApiResponse.success(
                                "Allocation request rejected successfully",
                                allocationRequestService.rejectRequest(id, actionDTO.getReason(),
                                                CurrentUserContext.getCurrentUserId()));
        }

        @PutMapping("/{id}/withdraw")
        @Operation(summary = "Withdraw own request")
        public ApiResponse<AllocationRequestResponse> withdrawRequest(@PathVariable Long id) {
                return ApiResponse.success(
                                "Allocation request withdrawn successfully",
                                allocationRequestService.withdrawRequest(id, CurrentUserContext.getCurrentUserId()));
        }

        @GetMapping("/pending")
        @Operation(summary = "Get pending requests for current user (as approver)")
        public ApiResponse<List<AllocationRequestResponse>> getPendingRequests() {
                return ApiResponse.success(
                                "Pending requests retrieved successfully",
                                allocationRequestService
                                                .getPendingRequestsForApprover(CurrentUserContext.getCurrentUserId()));
        }

        @GetMapping("/my-requests")
        @Operation(summary = "Get requests made by current user")
        public ApiResponse<List<AllocationRequestResponse>> getMyRequests() {
                return ApiResponse.success(
                                "My requests retrieved successfully",
                                allocationRequestService.getRequestsByRequester(CurrentUserContext.getCurrentUserId()));
        }

        @GetMapping("/employee/{employeeId}")
        @Operation(summary = "Get all requests for an employee")
        public ApiResponse<List<AllocationRequestResponse>> getEmployeeRequests(@PathVariable Long employeeId) {
                return ApiResponse.success(
                                "Employee allocation requests retrieved successfully",
                                allocationRequestService.getRequestsForEmployee(employeeId));
        }

        @GetMapping("/pending-count")
        @Operation(summary = "Get count of pending approvals for current user")
        public ApiResponse<Long> getPendingCount() {
                return ApiResponse.success(
                                "Pending count retrieved successfully",
                                allocationRequestService.getPendingCount(CurrentUserContext.getCurrentUserId()));
        }

        @GetMapping("/summary")
        @Operation(summary = "Get summary of allocation requests (counts + recent)")
        public ApiResponse<AllocationRequestSummary> getSummary() {
                Long approverId = CurrentUserContext.getCurrentUserId();

                List<AllocationRequestResponse> pending = allocationRequestService
                                .getPendingRequestsForApprover(approverId);
                AllocationRequestSummary summary = AllocationRequestSummary.builder()
                                .pendingCount(pending.size())
                                .approvedCount(0) // Mocked
                                .rejectedCount(0) // Mocked
                                .recentRequests(pending.stream().limit(10).collect(Collectors.toList()))
                                .build();

                return ApiResponse.success("Allocation request summary retrieved successfully", summary);
        }
}
