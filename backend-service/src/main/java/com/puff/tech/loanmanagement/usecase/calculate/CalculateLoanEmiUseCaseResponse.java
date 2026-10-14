package com.puff.tech.loanmanagement.usecase.calculate;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.loanmanagement.converter.LoanScheduleDto;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.util.List;

@Serdeable
public record CalculateLoanEmiUseCaseResponse(
        BigDecimal monthlyEmi,
        BigDecimal totalInterest,
        BigDecimal totalPayable,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer tenureMonths,
        String interestType,
        List<LoanScheduleDto> schedule
) implements UCResponse {}
