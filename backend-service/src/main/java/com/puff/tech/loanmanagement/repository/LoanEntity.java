package com.puff.tech.loanmanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
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
@MappedEntity(value = "loans")
public class LoanEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private String loanNumber;
    private String lenderName;
    private String lenderType; // BANK, PERSON, INSTITUTION, OTHER
    private String phoneNumber;
    private String accountNumber;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private String interestType; // REDUCING, FLAT
    private LocalDate startDate;
    private BigDecimal monthlyEmi;
    private BigDecimal totalInterest;
    private BigDecimal totalPayable;
    private BigDecimal totalPaid;
    private BigDecimal remainingBalance;
    private String status; // ACTIVE, CLOSED, OVERDUE
    private String purpose;
    private String remarks;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
