package com.puff.tech.usecase.transaction.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record UpdateTransactionUseCaseRequest(
        Integer id,
        String description,
        BigDecimal amount,
        Instant transactionDate,
        String transactionType
)
implements UseCases.UseCaseRequest {
}
