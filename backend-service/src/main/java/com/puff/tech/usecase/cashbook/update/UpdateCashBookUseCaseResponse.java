package com.puff.tech.usecase.cashbook.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateCashBookUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
