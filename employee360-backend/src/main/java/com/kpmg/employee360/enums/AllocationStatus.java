package com.kpmg.employee360.enums;

public enum AllocationStatus {
    ACTIVE("Active"),
    BENCH("On Bench"),
    PARTIAL("Partially Allocated");

    private final String displayName;

    AllocationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
