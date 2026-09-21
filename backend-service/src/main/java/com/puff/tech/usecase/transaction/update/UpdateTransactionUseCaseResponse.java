package com.puff.tech.usecase.transaction.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateTransactionUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
