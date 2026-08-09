package com.puff.tech.entity;

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
@MappedEntity(value = "StaffSalaries")
public class StaffSalaryEntity {

    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private Integer staffId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private StaffEntity staff;
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
