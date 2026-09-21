package com.puff.tech.usecase.permission.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePermissionUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
