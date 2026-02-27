package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmpCode(String empCode);

    Optional<Employee> findByEmail(String email);

    List<Employee> findByReportingManager_Id(Long managerId);

    List<Employee> findByPerformanceManager_Id(Long managerId);

    List<Employee> findByDesignation_Level(Integer level);

    List<Employee> findByDesignation_LevelBetween(Integer from, Integer to);

    List<Employee> findByDepartment(String department);

    List<Employee> findByIsActiveTrue();

    Page<Employee> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(e.empCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Employee> searchByQuery(@Param("query") String query);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.reportingManager.id = :managerId")
    Long countDirectReports(@Param("managerId") Long managerId);
}
