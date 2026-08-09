package com.puff.tech.usecase.transaction.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record CreateTransactionUseCaseRequest(
        String description,
        BigDecimal amount,
        Instant transactionDate,
        String transactionType
)
implements UseCase.UseCaseRequest {
}
