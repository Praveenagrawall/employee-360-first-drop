package com.kpmg.employee360.service;

import com.kpmg.employee360.dto.request.RequestDTOs.*;
import com.kpmg.employee360.dto.response.ResponseDTOs.*;
import com.kpmg.employee360.entity.*;
import com.kpmg.employee360.enums.AllocationStatus;
import com.kpmg.employee360.exception.ResourceNotFoundException;
import com.kpmg.employee360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

        private final TeamRepository teamRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final ProjectRepository projectRepository;
        private final EmployeeRepository employeeRepository;

        @Transactional
        public TeamResponse createTeam(@NonNull TeamCreateRequest request) {
                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project", "id",
                                                request.getProjectId()));

                Team team = Team.builder()
                                .name(request.getName())
                                .project(project)
                                .build();

                if (request.getTeamLeadId() != null) {
                        team.setTeamLead(employeeRepository.findById(request.getTeamLeadId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                                                        request.getTeamLeadId())));
                }

                Team saved = teamRepository.save(team);
                return toTeamResponse(saved);
        }

        @Transactional
        public void addMember(@NonNull TeamMemberAddRequest request) {
                Team team = teamRepository.findById(request.getTeamId())
                                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", request.getTeamId()));
                Employee employee = employeeRepository.findById(request.getEmployeeId())
                                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id",
                                                request.getEmployeeId()));

                TeamMember member = TeamMember.builder()
                                .team(team)
                                .employee(employee)
                                .roleInTeam(request.getRoleInTeam())
                                .allocationPercentage(request.getAllocationPercentage() != null
                                                ? request.getAllocationPercentage()
                                                : 100)
                                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                                .status(AllocationStatus.ACTIVE)
                                .build();

                teamMemberRepository.save(member);
        }

        @Transactional
        public void removeMember(@NonNull Long teamId, @NonNull Long employeeId) {
                List<TeamMember> members = teamMemberRepository.findByTeam_Id(teamId).stream()
                                .filter(tm -> tm.getEmployee().getId().equals(employeeId))
                                .collect(Collectors.toList());

                members.forEach(tm -> {
                        tm.setStatus(AllocationStatus.BENCH);
                        tm.setEndDate(LocalDate.now());
                        teamMemberRepository.save(tm);
                });
        }

        @Transactional
        public void updateAllocation(Long memberId, Integer percentage) {
                TeamMember member = teamMemberRepository.findById(memberId)
                                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", memberId));
                member.setAllocationPercentage(percentage);
                teamMemberRepository.save(member);
        }

        @Transactional
        public void updateRole(Long memberId, String role) {
                TeamMember member = teamMemberRepository.findById(memberId)
                                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", memberId));
                member.setRoleInTeam(role);
                teamMemberRepository.save(member);
        }

        public List<TeamMemberDTO> getMembershipsByEmployee(Long employeeId) {
                return teamMemberRepository.findByEmployee_Id(employeeId).stream()
                                .map(this::toTeamMemberDTO)
                                .collect(Collectors.toList());
        }

        public List<TeamResponse> getTeamsByProject(@NonNull Long projectId) {
                return teamRepository.findByProject_Id(projectId).stream()
                                .map(this::toTeamResponse)
                                .collect(Collectors.toList());
        }

        private TeamResponse toTeamResponse(Team team) {
                List<TeamMember> members = teamMemberRepository.findByTeam_Id(team.getId());
                return TeamResponse.builder()
                                .id(team.getId())
                                .name(team.getName())
                                .teamLeadName(team.getTeamLead() != null ? team.getTeamLead().getFullName() : null)
                                .teamLeadId(team.getTeamLead() != null ? team.getTeamLead().getId() : null)
                                .projectName(team.getProject().getName())
                                .projectId(team.getProject().getId())
                                .memberCount(members.size())
                                .build();
        }

        private TeamMemberDTO toTeamMemberDTO(TeamMember tm) {
                return TeamMemberDTO.builder()
                                .id(tm.getId())
                                .employeeId(tm.getEmployee().getId())
                                .employeeName(tm.getEmployee().getFullName())
                                .empCode(tm.getEmployee().getEmpCode())
                                .designation(tm.getEmployee().getDesignation() != null
                                                ? tm.getEmployee().getDesignation().getDisplayName()
                                                : "N/A")
                                .roleInTeam(tm.getRoleInTeam())
                                .allocationPercentage(tm.getAllocationPercentage())
                                .status(tm.getStatus())
                                .startDate(tm.getStartDate())
                                .endDate(tm.getEndDate())
                                .profilePicUrl(tm.getEmployee().getProfilePicUrl())
                                .build();
        }
}
