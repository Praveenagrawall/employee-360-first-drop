package com.kpmg.employee360.enums;

public enum ProjectType {
    CLIENT("Client Project"),
    INTERNAL("Internal Project"),
    PROPOSAL("Proposal");

    private final String displayName;

    ProjectType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
