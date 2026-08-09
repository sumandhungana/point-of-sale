package com.puff.tech.usecase.cashbook.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdateCashBookUseCaseRequest(
        String cashbookNo,
        LocalDate date,
        Long categoryId,
        Long itemId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        CompletedFileUpload photo
)
implements UseCase.UseCaseRequest {
}
