package com.puff.tech.usecase.role.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateRoleUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
