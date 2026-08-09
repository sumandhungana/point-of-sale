package com.puff.tech.usecase.transaction.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateTransactionUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
