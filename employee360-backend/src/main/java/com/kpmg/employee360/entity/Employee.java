package com.kpmg.employee360.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_emp_code", columnList = "empCode"),
        @Index(name = "idx_emp_email", columnList = "email"),
        @Index(name = "idx_emp_department", columnList = "department")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"reportingManager", "performanceManager", "directReports"})
@EqualsAndHashCode(exclude = {"reportingManager", "performanceManager", "directReports"})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String empCode;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designation_id", nullable = false)
    private Designation designation;

    @Column(nullable = false)
    private String department;

    private String location;

    private LocalDate dateOfJoining;

    private String profilePicUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    @JsonIgnoreProperties({"directReports", "reportingManager", "performanceManager"})
    private Employee reportingManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performance_manager_id")
    @JsonIgnoreProperties({"directReports", "reportingManager", "performanceManager"})
    private Employee performanceManager;

    @OneToMany(mappedBy = "reportingManager", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"directReports", "reportingManager", "performanceManager"})
    @Builder.Default
    private List<Employee> directReports = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
