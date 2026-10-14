package com.puff.tech.loanmanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "loan_schedules")
public class LoanScheduleEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    private Long loanId;
    private Integer installmentNo;
    private LocalDate dueDate;
    private BigDecimal beginningBalance;
    private BigDecimal emiAmount;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal endingBalance;
    private String status; // PENDING, PAID, OVERDUE
    private LocalDate paidDate;
    private BigDecimal paidAmount;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
