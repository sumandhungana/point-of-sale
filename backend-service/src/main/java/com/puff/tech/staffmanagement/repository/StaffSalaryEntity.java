package com.puff.tech.staffmanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "staff_salaries")
public class StaffSalaryEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Integer id;

    // Micronaut Data will automatically map this relation to "member_id"
    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    // Micronaut Data will automatically map this relation to "staff_id"
    @Relation(Relation.Kind.MANY_TO_ONE)
    private OrganizationStaffEntity staff;

    private Integer month;
    private Integer year;
    private Instant selectedDate;

    private Boolean isSlideOn = false;
    private Instant calculationDate;
    private String salaryType; // monthly, weekly, daily
    private BigDecimal amount;
    private String permission; // full, limited, restricted

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

}
