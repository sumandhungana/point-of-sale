package com.puff.tech.usecase.cashbook.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateCashBookUseCaseRequest(
        @NotNull String cashbookNo,
        @NotNull LocalDate date,
        @NotNull Integer categoryId,
        @NotNull Integer itemId,
        @NotNull String paymentMode,
        @NotNull BigDecimal amount,
        String remarks,
        CompletedFileUpload photo
)
implements UseCases.UseCaseRequest {
}
