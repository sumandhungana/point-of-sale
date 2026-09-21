package com.puff.tech.usecase.permission.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePermissionUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
