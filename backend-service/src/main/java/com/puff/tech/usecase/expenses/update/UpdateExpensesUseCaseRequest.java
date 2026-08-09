package com.puff.tech.usecase.expenses.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdateExpensesUseCaseRequest(
        Integer id,
        String expensesNo,
        LocalDate date,
        Integer categoryId,
        Integer itemId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        CompletedFileUpload photo
)implements UseCase.UseCaseRequest {
}
