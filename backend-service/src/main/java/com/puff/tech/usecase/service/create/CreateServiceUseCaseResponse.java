package com.puff.tech.usecase.service.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateServiceUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
