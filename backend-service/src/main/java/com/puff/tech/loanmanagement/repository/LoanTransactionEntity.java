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
@MappedEntity(value = "loan_transactions")
public class LoanTransactionEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    private Long loanId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private LocalDate transactionDate;
    private String type; // PAYMENT_GIVEN, PAYMENT_RECEIVED
    private BigDecimal amount;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private String paymentMode; // CASH, BANK_TRANSFER, CHEQUE, DIGITAL
    private String referenceNo;
    private String remarks;
    private BigDecimal balanceAfter;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
