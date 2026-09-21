package com.puff.tech.usecase.transaction.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record GetTransactionUseCaseResponse(
        Integer id,
        String description,
        BigDecimal amount,
        Instant transactionDate,
        String transactionType,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}
