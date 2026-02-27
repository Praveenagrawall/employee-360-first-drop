package com.kpmg.employee360.enums;

public enum AllocationRequestStatus {
    PENDING("Pending Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    WITHDRAWN("Withdrawn"),
    AUTO_APPROVED("Auto-Approved");

    private final String displayName;

    AllocationRequestStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
