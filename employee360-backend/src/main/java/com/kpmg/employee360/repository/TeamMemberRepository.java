package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.TeamMember;
import com.kpmg.employee360.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeam_Id(Long teamId);

    List<TeamMember> findByEmployee_Id(Long employeeId);

    List<TeamMember> findByEmployee_IdAndStatus(Long employeeId, AllocationStatus status);

    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id IN " +
            "(SELECT tm2.team.id FROM TeamMember tm2 WHERE tm2.employee.id = :employeeId AND tm2.status = 'ACTIVE') " +
            "AND tm.employee.id != :employeeId AND tm.status = 'ACTIVE'")
    List<TeamMember> findTeammatesByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT SUM(tm.allocationPercentage) FROM TeamMember tm WHERE tm.employee.id = :employeeId AND tm.status = 'ACTIVE'")
    Integer getTotalAllocationByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT COUNT(tm1) > 0 FROM TeamMember tm1, TeamMember tm2 " +
            "WHERE tm1.team.id = tm2.team.id " +
            "AND tm1.employee.id = :viewerId " +
            "AND tm2.employee.id = :targetId " +
            "AND tm1.status = 'ACTIVE' AND tm2.status = 'ACTIVE'")
    boolean existsBySharedTeam(@Param("viewerId") Long viewerId, @Param("targetId") Long targetId);
}
