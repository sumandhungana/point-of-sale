package com.puff.tech.usecase.service.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateServiceUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
