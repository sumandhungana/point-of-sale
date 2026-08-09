package com.puff.tech.usecase.transaction.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteTransactionUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
