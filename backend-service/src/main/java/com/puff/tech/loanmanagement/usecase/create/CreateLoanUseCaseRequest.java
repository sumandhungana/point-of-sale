package com.puff.tech.loanmanagement.usecase.create;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateLoanUseCaseRequest(
        String loanNumber,
        String lenderName,
        String lenderType,
        String phoneNumber,
        String accountNumber,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer tenureMonths,
        String interestType,
        LocalDate startDate,
        String purpose,
        String remarks
) implements UCRequest {}
