package com.puff.tech.usecase.permission.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePermissionUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
