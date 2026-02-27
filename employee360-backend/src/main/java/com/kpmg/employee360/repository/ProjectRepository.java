package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Project;
import com.kpmg.employee360.enums.ProjectStatus;
import com.kpmg.employee360.enums.ProjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

        Optional<Project> findByProjectCode(String projectCode);

        List<Project> findByType(ProjectType type);

        List<Project> findByStatus(ProjectStatus status);

        List<Project> findByEngagementManager_Id(Long managerId);

        Page<Project> findByType(ProjectType type, Pageable pageable);

        Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

        Page<Project> findByTypeAndStatus(ProjectType type, ProjectStatus status, Pageable pageable);

        @Query("SELECT DISTINCT p FROM Project p " +
                        "LEFT JOIN Team t ON t.project = p " +
                        "LEFT JOIN TeamMember tm ON tm.team = t " +
                        "WHERE p.engagementManager.id = :employeeId " +
                        "OR tm.employee.id = :employeeId")
        Page<Project> findByEngagementManagerOrMember(@Param("employeeId") Long employeeId, Pageable pageable);

        @Query("SELECT DISTINCT p FROM Project p " +
                        "INNER JOIN Team t ON t.project = p " +
                        "INNER JOIN TeamMember tm ON tm.team = t " +
                        "WHERE tm.employee.id = :employeeId")
        Page<Project> findByMember(@Param("employeeId") Long employeeId, Pageable pageable);

        @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(p.clientName) LIKE LOWER(CONCAT('%', :query, '%'))")
        List<Project> searchByQuery(@Param("query") String query);
}
