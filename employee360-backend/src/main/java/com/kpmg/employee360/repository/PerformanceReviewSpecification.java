package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.PerformanceReview;
import com.kpmg.employee360.enums.ReviewStatus;
import org.springframework.data.jpa.domain.Specification;

public class PerformanceReviewSpecification {

    public static Specification<PerformanceReview> hasDepartment(String dept) {
        return (root, query, cb) -> dept == null ? null : cb.equal(root.get("employee").get("department"), dept);
    }

    public static Specification<PerformanceReview> hasDesignationLevel(Integer level) {
        return (root, query, cb) -> level == null ? null
                : cb.equal(root.get("employee").get("designation").get("level"), level);
    }

    public static Specification<PerformanceReview> hasReviewCycle(String cycle) {
        return (root, query, cb) -> cycle == null ? null : cb.equal(root.get("reviewCycle"), cycle);
    }

    public static Specification<PerformanceReview> hasStatus(ReviewStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }
}
