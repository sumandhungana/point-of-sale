package com.puff.tech.usecase.expenses.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateExpensesUseCaseRequest(
        String expensesNo,
        LocalDate date,
        Integer categoryId,
        Integer itemId,
        String paymentMode,
        BigDecimal amount,
        CompletedFileUpload photoPath,
        String remarks
)
implements UseCases.UseCaseRequest {
}
