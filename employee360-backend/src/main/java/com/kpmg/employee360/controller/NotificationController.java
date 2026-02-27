package com.kpmg.employee360.controller;

import com.kpmg.employee360.dto.response.ApiResponse;
import com.kpmg.employee360.dto.response.ResponseDTOs.NotificationDTO;
import com.kpmg.employee360.entity.Employee;
import com.kpmg.employee360.config.CurrentUserContext;
import com.kpmg.employee360.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing user notifications")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get recent notifications for current user")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getRecentNotifications(
            @RequestParam(defaultValue = "50") int limit) {

        List<NotificationDTO> notifications = notificationService
                .getRecentNotifications(CurrentUserContext.getCurrentUserId(), limit);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {

        long count = notificationService.getUnreadCount(CurrentUserContext.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {

        notificationService.markAllAsRead(CurrentUserContext.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
