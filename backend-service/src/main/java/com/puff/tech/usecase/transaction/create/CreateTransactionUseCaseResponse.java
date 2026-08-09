package com.puff.tech.usecase.transaction.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateTransactionUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
