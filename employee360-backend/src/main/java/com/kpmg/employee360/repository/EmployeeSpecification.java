package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Employee;
import org.springframework.data.jpa.domain.Specification;

public class EmployeeSpecification {
    public static Specification<Employee> hasDesignationLevel(Integer level) {
        return (root, query, cb) -> level == null ? null : cb.equal(root.get("designation").get("level"), level);
    }

    public static Specification<Employee> hasDepartment(String dept) {
        return (root, query, cb) -> dept == null ? null : cb.equal(root.get("department"), dept);
    }

    public static Specification<Employee> hasLocation(String loc) {
        return (root, query, cb) -> loc == null ? null : cb.equal(root.get("location"), loc);
    }

    public static Specification<Employee> isActive(Boolean active) {
        return (root, query, cb) -> active == null ? null : cb.equal(root.get("isActive"), active);
    }

    public static Specification<Employee> reportsTo(Long managerId) {
        return (root, query, cb) -> managerId == null ? null
                : cb.equal(root.get("reportingManager").get("id"), managerId);
    }

    public static Specification<Employee> nameOrCodeContains(String query) {
        return (root, q, cb) -> {
            if (query == null || query.isBlank())
                return null;
            String pattern = "%" + query.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern),
                    cb.like(cb.lower(root.get("empCode")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern));
        };
    }
}
