package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByProject_Id(Long projectId);

    List<Team> findByTeamLead_Id(Long leadId);
}
