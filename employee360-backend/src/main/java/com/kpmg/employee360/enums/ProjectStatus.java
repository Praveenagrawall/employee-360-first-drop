package com.kpmg.employee360.enums;

public enum ProjectStatus {
    ACTIVE("Active"),
    COMPLETED("Completed"),
    ON_HOLD("On Hold"),
    PIPELINE("Pipeline");

    private final String displayName;

    ProjectStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
