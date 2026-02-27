package com.kpmg.employee360.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Extracts the user context from the "X-Current-User-Id" request header.
 */
@Component
@Slf4j
public class CurrentUserInterceptor implements HandlerInterceptor {

    private static final String HEADER_NAME = "X-Current-User-Id";
    private static final Long DEFAULT_USER_ID = 15L;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler) {
        String userIdStr = request.getHeader(HEADER_NAME);
        Long userId = DEFAULT_USER_ID;

        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                userId = Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                log.warn("Invalid {} header: {}. Defaulting to {}", HEADER_NAME, userIdStr, DEFAULT_USER_ID);
            }
        }

        CurrentUserContext.setCurrentUserId(userId);
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler, Exception ex) {
        CurrentUserContext.clear();
    }
}
