package com.puff.tech.loanmanagement.usecase.calculate;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CalculateLoanEmiUseCaseRequest(
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer tenureMonths,
        String interestType,
        LocalDate startDate
) implements UCRequest {}
