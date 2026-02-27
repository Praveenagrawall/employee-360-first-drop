package com.kpmg.employee360.enums;

public enum DesignationType {
    ASSOCIATE_CONSULTANT(1, "Associate Consultant", DashboardType.INDIVIDUAL),
    CONSULTANT(2, "Consultant", DashboardType.INDIVIDUAL),
    ASSISTANT_MANAGER(3, "Assistant Manager", DashboardType.INDIVIDUAL),
    MANAGER(4, "Manager", DashboardType.MANAGER),
    ASSISTANT_DIRECTOR(5, "Assistant Director", DashboardType.MANAGER),
    DIRECTOR(6, "Director", DashboardType.LEADERSHIP),
    PARTNER(7, "Partner", DashboardType.LEADERSHIP);

    private final int level;
    private final String displayName;
    private final DashboardType dashboardType;

    DesignationType(int level, String displayName, DashboardType dashboardType) {
        this.level = level;
        this.displayName = displayName;
        this.dashboardType = dashboardType;
    }

    public int getLevel() {
        return level;
    }

    public String getDisplayName() {
        return displayName;
    }

    public DashboardType getDashboardType() {
        return dashboardType;
    }

    public static DesignationType fromLevel(int level) {
        for (DesignationType type : values()) {
            if (type.level == level) {
                return type;
            }
        }
        throw new IllegalArgumentException("No designation found for level: " + level);
    }
}
