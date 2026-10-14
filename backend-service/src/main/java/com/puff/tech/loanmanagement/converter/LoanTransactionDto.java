package com.puff.tech.loanmanagement.converter;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record LoanTransactionDto(
        Long id,
        Long loanId,
        LocalDate transactionDate,
        String type, // PAYMENT_GIVEN, PAYMENT_RECEIVED
        BigDecimal amount,
        BigDecimal principalComponent,
        BigDecimal interestComponent,
        String paymentMode,
        String referenceNo,
        String remarks,
        BigDecimal balanceAfter,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {}
