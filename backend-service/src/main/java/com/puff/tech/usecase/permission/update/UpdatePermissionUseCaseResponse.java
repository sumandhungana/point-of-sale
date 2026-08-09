package com.puff.tech.usecase.permission.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePermissionUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
