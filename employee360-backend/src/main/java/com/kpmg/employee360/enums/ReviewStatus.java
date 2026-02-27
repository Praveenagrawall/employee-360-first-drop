package com.kpmg.employee360.enums;

public enum ReviewStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    ACKNOWLEDGED("Acknowledged"),
    COMPLETED("Completed");

    private final String displayName;

    ReviewStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
