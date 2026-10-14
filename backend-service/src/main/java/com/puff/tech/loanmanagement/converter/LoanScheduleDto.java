package com.puff.tech.loanmanagement.converter;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record LoanScheduleDto(
        Long id,
        Long loanId,
        Integer installmentNo,
        LocalDate dueDate,
        BigDecimal beginningBalance,
        BigDecimal emiAmount,
        BigDecimal principalComponent,
        BigDecimal interestComponent,
        BigDecimal endingBalance,
        String status,
        LocalDate paidDate,
        BigDecimal paidAmount
) implements UCResponse {}
