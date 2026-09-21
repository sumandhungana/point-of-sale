package com.puff.tech.usecase.transaction.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateTransactionUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
