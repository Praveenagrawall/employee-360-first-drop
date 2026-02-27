package com.kpmg.employee360.repository;

import com.kpmg.employee360.entity.AllocationRequest;
import com.kpmg.employee360.enums.AllocationRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRequestRepository extends JpaRepository<AllocationRequest, Long> {

        List<AllocationRequest> findByRequester_IdAndStatus(Long requesterId, AllocationRequestStatus status);

        List<AllocationRequest> findByApprover_IdAndStatus(Long approverId, AllocationRequestStatus status);

        List<AllocationRequest> findByEmployee_Id(Long employeeId);

        List<AllocationRequest> findByApprover_IdAndStatusOrderByCreatedAtDesc(Long approverId,
                        AllocationRequestStatus status);

        List<AllocationRequest> findByRequester_IdOrderByCreatedAtDesc(Long requesterId);

        List<AllocationRequest> findByProject_Id(Long projectId);

        Optional<AllocationRequest> findByEmployee_IdAndTeam_IdAndStatus(Long employeeId, Long teamId,
                        AllocationRequestStatus status);

        long countByApprover_IdAndStatus(Long approverId, AllocationRequestStatus status);

        long countByStatus(AllocationRequestStatus status);
}
