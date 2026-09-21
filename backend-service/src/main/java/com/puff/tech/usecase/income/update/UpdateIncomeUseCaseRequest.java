package com.puff.tech.usecase.income.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdateIncomeUseCaseRequest(
        Integer id,
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
