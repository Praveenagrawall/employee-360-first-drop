package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    Optional<Designation> findByLevel(Integer level);
    Optional<Designation> findByName(String name);
}
