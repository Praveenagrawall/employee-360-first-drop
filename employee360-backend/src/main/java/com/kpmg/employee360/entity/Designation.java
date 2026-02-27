package com.kpmg.employee360.entity;

import com.kpmg.employee360.enums.DashboardType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "designations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Designation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false, unique = true)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DashboardType dashboardType;
}
