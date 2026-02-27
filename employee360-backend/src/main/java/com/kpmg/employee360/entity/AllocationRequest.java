package com.kpmg.employee360.entity;

import com.kpmg.employee360.enums.AllocationRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "allocation_requests", indexes = {
        @Index(name = "idx_ar_status", columnList = "status"),
        @Index(name = "idx_ar_requester", columnList = "requester_id"),
        @Index(name = "idx_ar_approver", columnList = "approver_id"),
        @Index(name = "idx_ar_employee", columnList = "employee_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private Employee approver;

    @Column(name = "role_in_team", nullable = false)
    private String roleInTeam;

    @Column(name = "requested_allocation", nullable = false)
    private Integer requestedAllocation;

    @Column(name = "current_total_allocation", nullable = false)
    private Integer currentTotalAllocation;

    @Column(name = "proposed_start_date", nullable = false)
    private LocalDate proposedStartDate;

    @Column(name = "proposed_end_date")
    private LocalDate proposedEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AllocationRequestStatus status = AllocationRequestStatus.PENDING;

    @Column(name = "request_reason", columnDefinition = "TEXT")
    private String requestReason;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approver_comments", columnDefinition = "TEXT")
    private String approverComments;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
