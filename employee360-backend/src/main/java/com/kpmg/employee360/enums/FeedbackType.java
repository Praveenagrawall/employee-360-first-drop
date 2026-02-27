package com.kpmg.employee360.enums;

public enum FeedbackType {
    PEER("Peer Feedback"),
    UPWARD("Upward Feedback"),
    DOWNWARD("Downward Feedback"),
    SELF("Self Assessment");

    private final String displayName;

    FeedbackType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
