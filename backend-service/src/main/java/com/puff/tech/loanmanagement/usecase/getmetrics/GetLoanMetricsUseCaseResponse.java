package com.puff.tech.loanmanagement.usecase.getmetrics;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record GetLoanMetricsUseCaseResponse(
        BigDecimal totalBorrowed,
        BigDecimal totalRepaid,
        BigDecimal totalOutstanding,
        BigDecimal totalMonthlyEmi,
        Long totalLoans,
        Long activeLoans,
        Long closedLoans
) implements UCResponse {}
