package com.puff.tech.usecase.service.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateServiceUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
