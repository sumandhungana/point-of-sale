package com.puff.tech.usecase.income.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateIncomeUseCaseRequest(
        String incomeNo,
        LocalDate date,
        Integer categoryId,
        Integer itemId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        CompletedFileUpload photo

)
implements UseCases.UseCaseRequest {
}
