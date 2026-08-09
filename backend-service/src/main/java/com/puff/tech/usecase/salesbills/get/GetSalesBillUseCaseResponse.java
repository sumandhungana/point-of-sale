package com.puff.tech.usecase.salesbills.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetSalesBillUseCaseResponse(
        Integer id,
        String billNumber,
        LocalDate billDate,
        Integer customerId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        String photoPath,
        Instant createdAt,
        Instant updatedAt
)implements UseCase.UseCaseResponse {
}
