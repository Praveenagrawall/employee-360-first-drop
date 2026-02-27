package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.ReviewStatus;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PerformanceService {

        private final PerformanceReviewRepository reviewRepository;
        private final EmployeeRepository employeeRepository;

        @Transactional
        public PerformanceReviewResponse createReview(PerformanceReviewRequest request, @NonNull Long reviewerId) {
                Employee employee = employeeRepository.findById(request.getEmployeeId())
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                                                request.getEmployeeId()));
                Employee reviewer = employeeRepository.findById(reviewerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", reviewerId));

                PerformanceReview review = PerformanceReview.builder()
                                .employee(employee)
                                .reviewer(reviewer)
                                .reviewCycle(request.getReviewCycle())
                                .rating(request.getRating())
                                .goals(request.getGoals())
                                .comments(request.getComments())
                                .status(ReviewStatus.SUBMITTED)
                                .reviewDate(LocalDate.now())
                                .build();

                return toResponse(reviewRepository.save(review));
        }

        @Transactional
        public PerformanceReviewResponse updateReview(Long id, ReviewUpdateRequest request) {
                PerformanceReview review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));

                if (request.getRating() != null)
                        review.setRating(request.getRating());
                if (request.getGoals() != null)
                        review.setGoals(request.getGoals());
                if (request.getComments() != null)
                        review.setComments(request.getComments());

                return toResponse(reviewRepository.save(review));
        }

        @Transactional
        public PerformanceReviewResponse submitReview(Long id) {
                PerformanceReview review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
                review.setStatus(ReviewStatus.SUBMITTED);
                return toResponse(reviewRepository.save(review));
        }

        @Transactional
        public PerformanceReviewResponse acknowledgeReview(Long id) {
                PerformanceReview review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
                review.setStatus(ReviewStatus.ACKNOWLEDGED);
                return toResponse(reviewRepository.save(review));
        }

        @Transactional
        public PerformanceReviewResponse completeReview(Long id) {
                PerformanceReview review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
                review.setStatus(ReviewStatus.COMPLETED);
                return toResponse(reviewRepository.save(review));
        }

        public List<PerformanceReviewResponse> getReviewsByCycle(String cycle) {
                return reviewRepository.findByReviewCycle(cycle).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public List<PerformanceReviewResponse> getReviewsByEmployee(@NonNull Long employeeId) {
                return reviewRepository.findByEmployee_IdOrderByReviewDateDesc(employeeId).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public List<PerformanceReviewResponse> getReviewsForTeam(@NonNull Long managerId) {
                List<Employee> reports = employeeRepository.findByReportingManager_Id(managerId);
                List<Long> reportIds = reports.stream().map(Employee::getId).collect(Collectors.toList());
                if (reportIds.isEmpty())
                        return List.of();
                return reviewRepository.findByEmployee_IdInOrderByReviewDateDesc(reportIds).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public List<PerformanceReviewResponse> getReviewsWithFilters(String department, Integer designation,
                        String cycle, ReviewStatus status) {
                org.springframework.data.jpa.domain.Specification<PerformanceReview> spec = org.springframework.data.jpa.domain.Specification
                                .where(PerformanceReviewSpecification.hasDepartment(department))
                                .and(PerformanceReviewSpecification.hasDesignationLevel(designation))
                                .and(PerformanceReviewSpecification.hasReviewCycle(cycle))
                                .and(PerformanceReviewSpecification.hasStatus(status));

                return reviewRepository
                                .findAll(spec, org.springframework.data.domain.Sort
                                                .by(org.springframework.data.domain.Sort.Direction.DESC, "reviewDate"))
                                .stream().map(this::toResponse).collect(Collectors.toList());
        }

        public PerformanceReviewResponse getReviewById(Long id) {
                PerformanceReview review = reviewRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
                return toResponse(review);
        }

        public PerformanceSummaryDTO getPerformanceSummary(@NonNull Long employeeId) {
                var latest = reviewRepository.findFirstByEmployee_IdOrderByReviewDateDesc(employeeId);
                Double avg = reviewRepository.getAverageRatingByEmployeeId(employeeId);
                int total = reviewRepository.findByEmployee_Id(employeeId).size();

                return PerformanceSummaryDTO.builder()
                                .latestRating(latest.map(PerformanceReview::getRating).orElse(null))
                                .averageRating(avg)
                                .totalReviews(total)
                                .lastReviewCycle(latest.map(PerformanceReview::getReviewCycle).orElse(null))
                                .lastReviewDate(latest.map(PerformanceReview::getReviewDate).orElse(null))
                                .build();
        }

        public List<PerformanceReviewResponse> getPendingReviews(@NonNull Long reviewerId) {
                return reviewRepository.findByReviewer_IdAndStatus(reviewerId, ReviewStatus.DRAFT).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        private PerformanceReviewResponse toResponse(PerformanceReview review) {
                return PerformanceReviewResponse.builder()
                                .id(review.getId())
                                .employeeId(review.getEmployee().getId())
                                .employeeName(review.getEmployee().getFullName())
                                .reviewerId(review.getReviewer().getId())
                                .reviewerName(review.getReviewer().getFullName())
                                .reviewCycle(review.getReviewCycle())
                                .rating(review.getRating())
                                .goals(review.getGoals())
                                .comments(review.getComments())
                                .status(review.getStatus())
                                .reviewDate(review.getReviewDate())
                                .build();
        }
}
