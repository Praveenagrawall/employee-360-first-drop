package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.enums.FeedbackType;
import com.kpmg.employee360.service.FeedbackService;
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
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Feedback APIs")
@CrossOrigin
public class FeedbackController {

        private final FeedbackService feedbackService;
        private final PermissionService permissionService;

        @PostMapping
        public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
                        @Valid @RequestBody FeedbackRequest request,
                        @RequestParam @NonNull Long fromEmployeeId) {

                Long currentUserId = CurrentUserContext.getCurrentUserId();
                Permission requiredPermission = request.getType() == FeedbackType.DOWNWARD
                                ? Permission.GIVE_DOWNWARD_FEEDBACK
                                : Permission.GIVE_PEER_FEEDBACK;

                if (!permissionService.hasPermission(currentUserId, requiredPermission)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error("Insufficient permissions to give "
                                                        + request.getType().name().toLowerCase()
                                                        + " feedback"));
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Feedback submitted",
                                                feedbackService.submitFeedback(request, fromEmployeeId)));
        }

        @GetMapping("/employee/{employeeId}")
        public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbackForEmployee(
                        @PathVariable @NonNull Long employeeId,
                        @RequestParam(required = false) FeedbackType type) {

                Long currentUserId = CurrentUserContext.getCurrentUserId();
                // Permission check: own feedback, manager of employee, or VIEW_ANY_PERFORMANCE
                if (!permissionService.canViewPerformance(currentUserId, employeeId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error(
                                                        "Insufficient permissions to view feedback for this employee"));
                }

                return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackForEmployee(employeeId, type)));
        }

        @GetMapping("/given/{employeeId}")
        public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbackGivenByEmployee(
                        @PathVariable @NonNull Long employeeId) {
                Long currentUserId = CurrentUserContext.getCurrentUserId();
                if (!currentUserId.equals(employeeId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error("Can only view own given feedback"));
                }
                return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackGivenByEmployee(employeeId)));
        }

        @GetMapping("/team/{managerId}")
        public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbackForTeam(
                        @PathVariable @NonNull Long managerId) {
                Long currentUserId = CurrentUserContext.getCurrentUserId();
                if (!currentUserId.equals(managerId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error("Can only view feedback for own team"));
                }
                return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackForTeam(managerId)));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<String>> deleteFeedback(
                        @PathVariable @NonNull Long id,
                        @RequestParam @NonNull Long employeeId) {
                Long currentUserId = CurrentUserContext.getCurrentUserId();
                if (!currentUserId.equals(employeeId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error("Unauthorized"));
                }
                try {
                        feedbackService.deleteFeedback(id, employeeId);
                        return ResponseEntity.ok(ApiResponse.success("Feedback deleted successfully"));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.error(e.getMessage()));
                }
        }

        @GetMapping("/project/{projectId}")
        public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbackByProject(
                        @PathVariable @NonNull Long projectId) {
                return ResponseEntity.ok(ApiResponse.success(feedbackService.getFeedbackByProject(projectId)));
        }
}
