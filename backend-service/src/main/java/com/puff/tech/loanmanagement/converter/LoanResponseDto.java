package com.puff.tech.loanmanagement.converter;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Serdeable
public record LoanResponseDto(
        Long id,
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
        BigDecimal monthlyEmi,
        BigDecimal totalInterest,
        BigDecimal totalPayable,
        BigDecimal totalPaid,
        BigDecimal remainingBalance,
        String status,
        String purpose,
        String remarks,
        Instant createdAt,
        Instant updatedAt,
        List<LoanScheduleDto> schedule
) implements UCResponse {}
