package com.puff.tech.usecase.income.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record GetIncomeUseCaseResponse(
        Integer id,
        String incomeNo,
        LocalDate date,
        Integer categoryId,
        Integer itemId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        String photo
)
implements UseCases.UseCaseResponse {
}
