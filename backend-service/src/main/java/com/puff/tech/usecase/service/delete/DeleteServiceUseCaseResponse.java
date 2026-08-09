package com.puff.tech.usecase.service.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteServiceUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
