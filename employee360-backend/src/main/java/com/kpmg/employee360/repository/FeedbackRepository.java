package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.Feedback;
import com.kpmg.employee360.enums.FeedbackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByToEmployee_Id(Long employeeId);

    List<Feedback> findByFromEmployee_Id(Long employeeId);

    List<Feedback> findByToEmployee_IdAndType(Long employeeId, FeedbackType type);

    List<Feedback> findByProject_Id(Long projectId);

    List<Feedback> findByToEmployee_IdOrderByCreatedAtDesc(Long employeeId);

    List<Feedback> findByToEmployee_IdInOrderByCreatedAtDesc(List<Long> employeeIds);
}
