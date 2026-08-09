package com.puff.tech.usecase.cashbook.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateCashBookUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
