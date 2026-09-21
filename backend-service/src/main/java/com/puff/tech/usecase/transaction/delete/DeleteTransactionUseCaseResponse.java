package com.puff.tech.usecase.transaction.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteTransactionUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
