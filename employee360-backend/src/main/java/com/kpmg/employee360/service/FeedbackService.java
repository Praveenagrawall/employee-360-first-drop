package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.FeedbackType;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request, @NonNull Long fromEmployeeId) {
        Employee from = employeeRepository.findById(fromEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", fromEmployeeId));
        Employee to = employeeRepository.findById(request.getToEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getToEmployeeId()));

        Feedback feedback = Feedback.builder()
                .fromEmployee(from)
                .toEmployee(to)
                .type(request.getType())
                .content(request.getContent())
                .rating(request.getRating())
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();

        if (request.getProjectId() != null) {
            feedback.setProject(projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId())));
        }

        return toResponse(feedbackRepository.save(feedback));
    }

    public List<FeedbackResponse> getFeedbackForEmployee(@NonNull Long employeeId, FeedbackType type) {
        List<Feedback> feedbacks;
        if (type != null) {
            feedbacks = feedbackRepository.findByToEmployee_IdAndType(employeeId, type);
        } else {
            feedbacks = feedbackRepository.findByToEmployee_IdOrderByCreatedAtDesc(employeeId);
        }
        return feedbacks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbackGivenByEmployee(@NonNull Long employeeId) {
        return feedbackRepository.findByFromEmployee_Id(employeeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbackForTeam(@NonNull Long managerId) {
        List<Employee> reports = employeeRepository.findByReportingManager_Id(managerId);
        List<Long> reportIds = reports.stream().map(Employee::getId).collect(Collectors.toList());
        if (reportIds.isEmpty())
            return List.of();
        return feedbackRepository.findByToEmployee_IdInOrderByCreatedAtDesc(reportIds).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFeedback(@NonNull Long id, @NonNull Long employeeId) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", id));

        if (!feedback.getFromEmployee().getId().equals(employeeId)) {
            throw new IllegalArgumentException("Cannot delete someone else's feedback");
        }
        if (feedback.getCreatedAt().plusHours(24).isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Feedback can only be deleted within 24 hours of creation");
        }
        feedbackRepository.delete(feedback);
    }

    public List<FeedbackResponse> getFeedbackByProject(@NonNull Long projectId) {
        return feedbackRepository.findByProject_Id(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FeedbackResponse toResponse(Feedback fb) {
        return FeedbackResponse.builder()
                .id(fb.getId())
                .fromEmployeeName(fb.getIsAnonymous() ? "Anonymous" : fb.getFromEmployee().getFullName())
                .fromEmployeeId(fb.getIsAnonymous() ? null : fb.getFromEmployee().getId())
                .toEmployeeName(fb.getToEmployee().getFullName())
                .toEmployeeId(fb.getToEmployee().getId())
                .projectName(fb.getProject() != null ? fb.getProject().getName() : null)
                .type(fb.getType())
                .content(fb.getContent())
                .rating(fb.getRating())
                .isAnonymous(fb.getIsAnonymous())
                .createdAt(fb.getCreatedAt())
                .build();
    }
}
