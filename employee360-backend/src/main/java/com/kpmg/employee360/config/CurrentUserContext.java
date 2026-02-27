package com.kpmg.employee360.config;

/**
 * ThreadLocal utility to store and retrieve the security context for the
 * current request thread.
 * Used to simulate the "currently logged-in user" in a stateless environment.
 */
public class CurrentUserContext {
    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    /**
     * Sets the ID for the current thread.
     */
    public static void setCurrentUserId(Long id) {
        currentUserId.set(id);
    }

    /**
     * Gets the current user ID. Defaults to 15 (Praveen Agrawal) if not set.
     */
    public static Long getCurrentUserId() {
        return currentUserId.get() != null ? currentUserId.get() : 15L;
    }

    /**
     * Clears the context to prevent memory leaks in managed threads.
     */
    public static void clear() {
        currentUserId.remove();
    }
}
