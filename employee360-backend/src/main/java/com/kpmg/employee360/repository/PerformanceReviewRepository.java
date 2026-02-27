package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.PerformanceReview;
import com.kpmg.employee360.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface PerformanceReviewRepository
        extends JpaRepository<PerformanceReview, Long>, JpaSpecificationExecutor<PerformanceReview> {

    List<PerformanceReview> findByEmployee_Id(Long employeeId);

    List<PerformanceReview> findByEmployee_IdOrderByReviewDateDesc(Long employeeId);

    Optional<PerformanceReview> findByEmployee_IdAndReviewCycle(Long employeeId, String cycle);

    List<PerformanceReview> findByReviewer_Id(Long reviewerId);

    List<PerformanceReview> findByReviewer_IdAndStatus(Long reviewerId, ReviewStatus status);

    List<PerformanceReview> findByReviewCycle(String reviewCycle);

    @Query("SELECT AVG(pr.rating) FROM PerformanceReview pr WHERE pr.employee.id = :employeeId")
    Double getAverageRatingByEmployeeId(@Param("employeeId") Long employeeId);

    Optional<PerformanceReview> findFirstByEmployee_IdOrderByReviewDateDesc(Long employeeId);

    List<PerformanceReview> findByEmployee_IdInOrderByReviewDateDesc(List<Long> employeeIds);
}
