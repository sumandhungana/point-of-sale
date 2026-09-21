package com.puff.tech.usecase.expenses.getall;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetAllExpensesBookUseCaseResponse(
        Integer id,
        String expensesNo,
        LocalDate date,
        Integer categoryId,
        Integer itemId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        String photoPath,
        Instant createdAt
)
implements UseCases.UseCaseResponse {
}
